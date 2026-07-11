-- ==========================================================================
-- BiblioTEC · F3.2 · Circulación: devolución y renovación (Módulo C)
-- Fuente: docs/especificaciones.md §7.2 (reglas 3, 5) y RF-C04/RF-C05.
--
-- Simétricas a F3.1 (create_loan). Son SECURITY DEFINER por lo mismo: el
-- estudiante NO puede escribir en `books` (RLS), pero devolver debe REPONER el
-- stock de forma atómica. La autorización real la dan los checks por `auth.uid()`
-- (o `is_librarian()` para el flujo admin de F5.3), no la RLS.
--
-- Códigos de error (SQLSTATE → motivo en la capa de servicios):
--   BT000 sin sesión
--   Devolver:  BT200 préstamo inexistente / ajeno / ya devuelto
--   Renovar:   BT100 inexistente / ajeno / ya devuelto
--              BT101 máximo de renovaciones alcanzado
--              BT102 renovación bloqueada por multa pendiente (§7.2.5)
-- ==========================================================================

-- --------------------------------------------------------------------------
-- return_loan(p_loan_id): registra la devolución y repone el stock (RF-C05).
-- --------------------------------------------------------------------------
create or replace function public.return_loan(p_loan_id uuid)
returns public.loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_loan    public.loans;
begin
  if v_user_id is null then
    raise exception 'Sesión no encontrada' using errcode = 'BT000';
  end if;

  select * into v_loan from public.loans where id = p_loan_id for update;

  if not found or (v_loan.user_id <> v_user_id and not public.is_librarian()) then
    raise exception 'Préstamo no encontrado' using errcode = 'BT200';
  end if;

  if v_loan.fecha_devolucion_real is not null then
    raise exception 'El préstamo ya fue devuelto' using errcode = 'BT200';
  end if;

  update public.loans
  set estado = 'devuelto', fecha_devolucion_real = now()
  where id = p_loan_id
  returning * into v_loan;

  -- Repone un ejemplar sin superar el total (respaldo del check de la tabla).
  update public.books
  set cantidad_disponible = least(cantidad_total, cantidad_disponible + 1)
  where id = v_loan.book_id;

  return v_loan;
end;
$$;

comment on function public.return_loan(uuid) is
  'F3.2: registra la devolución del préstamo (owner o bibliotecario) y repone el stock de forma atómica. SECURITY DEFINER.';

-- --------------------------------------------------------------------------
-- renew_loan(p_loan_id): renueva el préstamo recalculando la fecha (RF-C04).
-- Máximo `max_renovaciones`; nunca con multa pendiente del préstamo (§7.2.5).
-- --------------------------------------------------------------------------
create or replace function public.renew_loan(p_loan_id uuid)
returns public.loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_loan    public.loans;
  v_max     integer;
  v_dias    integer;
begin
  if v_user_id is null then
    raise exception 'Sesión no encontrada' using errcode = 'BT000';
  end if;

  select * into v_loan from public.loans where id = p_loan_id for update;

  if not found or (v_loan.user_id <> v_user_id and not public.is_librarian()) then
    raise exception 'Préstamo no encontrado' using errcode = 'BT100';
  end if;

  if v_loan.fecha_devolucion_real is not null then
    raise exception 'El préstamo ya fue devuelto' using errcode = 'BT100';
  end if;

  select max_renovaciones, dias_prestamo into v_max, v_dias
  from public.settings where id = 1;
  v_max  := coalesce(v_max, 2);
  v_dias := coalesce(v_dias, 14);

  if v_loan.renovaciones >= v_max then
    raise exception 'Alcanzaste el máximo de renovaciones' using errcode = 'BT101';
  end if;

  if exists (
    select 1 from public.fines
    where loan_id = p_loan_id and estado = 'pendiente'
  ) then
    raise exception 'Tienes una multa pendiente de este préstamo' using errcode = 'BT102';
  end if;

  update public.loans
  set renovaciones = renovaciones + 1,
      estado = 'activo', -- renovar limpia un posible 'vencido'
      fecha_devolucion_estimada = now() + make_interval(days => v_dias)
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.renew_loan(uuid) is
  'F3.2: renueva el préstamo (owner o bibliotecario), recalcula la fecha y valida máximo de renovaciones y multa pendiente. SECURITY DEFINER.';

-- --------------------------------------------------------------------------
-- Privilegios: solo authenticated.
-- --------------------------------------------------------------------------
revoke execute on function public.return_loan(uuid) from public, anon;
revoke execute on function public.renew_loan(uuid)  from public, anon;
grant  execute on function public.return_loan(uuid) to authenticated;
grant  execute on function public.renew_loan(uuid)  to authenticated;
