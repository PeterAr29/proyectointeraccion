-- ==========================================================================
-- BiblioTEC · F3.1 · Circulación: préstamo y reserva transaccionales (Módulo C)
-- Fuente: docs/especificaciones.md §7.2 (reglas de negocio 1, 2) y §2.3 (concurrencia).
--
-- Por qué RPC y no dos statements desde el service:
--   1) Atomicidad (A01/§2.3): prestar debe (a) verificar stock, (b) insertar el
--      loan y (c) decrementar cantidad_disponible como una sola operación. Con
--      `select ... for update` sobre la fila del libro evitamos que dos préstamos
--      concurrentes vendan el último ejemplar dos veces (doble préstamo).
--   2) RLS: el estudiante NO puede actualizar `books` (esa política es solo del
--      bibliotecario). Estas funciones son SECURITY DEFINER (owner postgres, con
--      BYPASSRLS) para poder decrementar el stock; la autorización real la dan
--      los checks explícitos por `auth.uid()` dentro de cada función, no la RLS.
--
-- Códigos de error (SQLSTATE) que la capa de servicios mapea a mensajes:
--   BT000 sin sesión · BT404 libro inexistente
--   BT001 sin stock  · BT002 ya tiene préstamo activo del libro
--   BT003 hay stock (no reservar, prestar) · BT004 ya tiene reserva activa
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Garantías a nivel de BD: un usuario no puede tener dos préstamos activos ni
-- dos reservas activas del mismo libro (respaldo del check en las funciones,
-- también frente a condiciones de carrera).
-- --------------------------------------------------------------------------
create unique index loans_one_active_per_user_book
  on public.loans (user_id, book_id)
  where estado = 'activo';

create unique index reservations_one_active_per_user_book
  on public.reservations (user_id, book_id)
  where estado = 'activa';

-- --------------------------------------------------------------------------
-- create_loan(p_book_id): presta un libro al usuario autenticado.
-- Devuelve la fila `loans` creada. Lanza excepción tipada ante cualquier
-- condición que impida el préstamo (la maneja lib/services/loans.ts).
-- --------------------------------------------------------------------------
create or replace function public.create_loan(p_book_id uuid)
returns public.loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id     uuid := auth.uid();
  v_disponible  integer;
  v_dias        integer;
  v_loan        public.loans;
begin
  if v_user_id is null then
    raise exception 'Sesión no encontrada' using errcode = 'BT000';
  end if;

  -- Bloquea la fila del libro: serializa préstamos concurrentes del mismo título.
  select cantidad_disponible into v_disponible
  from public.books
  where id = p_book_id
  for update;

  if not found then
    raise exception 'Libro no encontrado' using errcode = 'BT404';
  end if;

  if v_disponible <= 0 then
    raise exception 'Sin ejemplares disponibles' using errcode = 'BT001';
  end if;

  if exists (
    select 1 from public.loans
    where user_id = v_user_id and book_id = p_book_id and estado = 'activo'
  ) then
    raise exception 'Ya tienes un préstamo activo de este libro' using errcode = 'BT002';
  end if;

  select dias_prestamo into v_dias from public.settings where id = 1;
  v_dias := coalesce(v_dias, 14);

  insert into public.loans (book_id, user_id, fecha_devolucion_estimada)
  values (p_book_id, v_user_id, now() + make_interval(days => v_dias))
  returning * into v_loan;

  update public.books
  set cantidad_disponible = cantidad_disponible - 1
  where id = p_book_id;

  return v_loan;
end;
$$;

comment on function public.create_loan(uuid) is
  'F3.1: presta un libro al usuario autenticado de forma atómica (bloquea el stock, valida y decrementa). SECURITY DEFINER; autoriza por auth.uid().';

-- --------------------------------------------------------------------------
-- create_reservation(p_book_id): reserva un libro SIN stock para el usuario.
-- Estima la disponibilidad con la devolución más próxima entre los préstamos
-- activos del libro (requiere leer préstamos de otros usuarios → SECURITY DEFINER).
-- --------------------------------------------------------------------------
create or replace function public.create_reservation(p_book_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id     uuid := auth.uid();
  v_disponible  integer;
  v_estimada    timestamptz;
  v_res         public.reservations;
begin
  if v_user_id is null then
    raise exception 'Sesión no encontrada' using errcode = 'BT000';
  end if;

  select cantidad_disponible into v_disponible
  from public.books
  where id = p_book_id;

  if not found then
    raise exception 'Libro no encontrado' using errcode = 'BT404';
  end if;

  -- Reservar solo tiene sentido sin stock; si hay ejemplares, se presta.
  if v_disponible > 0 then
    raise exception 'Hay ejemplares disponibles' using errcode = 'BT003';
  end if;

  if exists (
    select 1 from public.reservations
    where user_id = v_user_id and book_id = p_book_id and estado = 'activa'
  ) then
    raise exception 'Ya tienes una reserva activa de este libro' using errcode = 'BT004';
  end if;

  select min(fecha_devolucion_estimada) into v_estimada
  from public.loans
  where book_id = p_book_id and estado = 'activo';

  insert into public.reservations (book_id, user_id, fecha_estimada_disponibilidad)
  values (p_book_id, v_user_id, v_estimada)
  returning * into v_res;

  return v_res;
end;
$$;

comment on function public.create_reservation(uuid) is
  'F3.1: reserva un libro sin stock para el usuario autenticado y estima su disponibilidad. SECURITY DEFINER; autoriza por auth.uid().';

-- --------------------------------------------------------------------------
-- Privilegios: solo el rol authenticated puede invocarlas (nunca anon/public).
-- Mismo endurecimiento aplicado a is_librarian() en 20260710120200.
-- --------------------------------------------------------------------------
revoke execute on function public.create_loan(uuid)        from public, anon;
revoke execute on function public.create_reservation(uuid) from public, anon;
grant  execute on function public.create_loan(uuid)        to authenticated;
grant  execute on function public.create_reservation(uuid) to authenticated;
