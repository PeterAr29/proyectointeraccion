-- ==========================================================================
-- BiblioTEC · Devolución en DOS PASOS con verificación del bibliotecario.
-- Fuente: docs/especificaciones.md §7.2 (RF-C05 / RF-E04).
--
-- Problema que cierra: antes `return_loan` aceptaba al DUEÑO, así que un
-- estudiante podía marcar un libro como devuelto SIN entregarlo físicamente
-- (reponía stock y evitaba la multa). Ahora la devolución es un acto físico
-- que solo el bibliotecario puede CONFIRMAR:
--   1) el estudiante SOLICITA la devolución  → request_return  (marca intención)
--   2) el bibliotecario CONFIRMA la recepción → return_loan    (cierra + stock + multa)
--
-- El estado "pendiente_devolucion" NO es un valor de enum: se deriva en lectura
-- desde `loans.devolucion_solicitada_en` (igual que `vencido` se deriva de la
-- fecha). Así evitamos ALTER TYPE en producción y no tocamos el enum.
--
-- Códigos de error (SQLSTATE → motivo en la capa de servicios):
--   BT000 sin sesión
--   BT200 confirmar: inexistente / ya devuelto / no es bibliotecario
--   BT300 solicitar:  inexistente / ajeno / ya devuelto / ya solicitada
--   BT301 cancelar:   inexistente / ajeno / ya devuelto / sin solicitud
-- ==========================================================================

-- Marca de intención de devolución (null = no solicitada). La devolución real
-- sigue viviendo en `fecha_devolucion_real`.
alter table public.loans
  add column if not exists devolucion_solicitada_en timestamptz;

comment on column public.loans.devolucion_solicitada_en is
  'Cuándo el estudiante solicitó devolver (null = no solicitada). El bibliotecario confirma la recepción física con return_loan.';

-- --------------------------------------------------------------------------
-- request_return(p_loan_id): el ESTUDIANTE dueño marca que va a devolver.
-- No repone stock ni cierra el préstamo; solo registra la intención.
-- --------------------------------------------------------------------------
create or replace function public.request_return(p_loan_id uuid)
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

  -- Solo el dueño solicita su propia devolución.
  if not found or v_loan.user_id <> v_user_id then
    raise exception 'Préstamo no encontrado' using errcode = 'BT300';
  end if;
  if v_loan.fecha_devolucion_real is not null then
    raise exception 'El préstamo ya fue devuelto' using errcode = 'BT300';
  end if;
  if v_loan.devolucion_solicitada_en is not null then
    raise exception 'Ya solicitaste la devolución' using errcode = 'BT300';
  end if;

  update public.loans
  set devolucion_solicitada_en = now()
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.request_return(uuid) is
  'Devolución 2 pasos: el estudiante dueño solicita la devolución (marca intención). No repone stock. SECURITY DEFINER.';

-- --------------------------------------------------------------------------
-- cancel_return_request(p_loan_id): retira la solicitud (dueño o bibliotecario)
-- mientras no se haya confirmado la devolución.
-- --------------------------------------------------------------------------
create or replace function public.cancel_return_request(p_loan_id uuid)
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
    raise exception 'Préstamo no encontrado' using errcode = 'BT301';
  end if;
  if v_loan.fecha_devolucion_real is not null then
    raise exception 'El préstamo ya fue devuelto' using errcode = 'BT301';
  end if;
  if v_loan.devolucion_solicitada_en is null then
    raise exception 'No hay una solicitud de devolución' using errcode = 'BT301';
  end if;

  update public.loans
  set devolucion_solicitada_en = null
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.cancel_return_request(uuid) is
  'Devolución 2 pasos: retira la solicitud de devolución (dueño o bibliotecario) si aún no se confirmó. SECURITY DEFINER.';

-- --------------------------------------------------------------------------
-- return_loan(p_loan_id): CONFIRMA la recepción física. Ahora es EXCLUSIVO del
-- bibliotecario (antes aceptaba al dueño). Cierra el préstamo y repone el stock.
-- La multa por retraso la asegura la capa de servicios (registerReturn →
-- syncFineForLoan) ANTES de llamar aquí, usando la fecha de confirmación.
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

  -- Solo el bibliotecario confirma la devolución (verificación física).
  if not public.is_librarian() then
    raise exception 'Préstamo no encontrado' using errcode = 'BT200';
  end if;

  select * into v_loan from public.loans where id = p_loan_id for update;

  if not found then
    raise exception 'Préstamo no encontrado' using errcode = 'BT200';
  end if;
  if v_loan.fecha_devolucion_real is not null then
    raise exception 'El préstamo ya fue devuelto' using errcode = 'BT200';
  end if;

  update public.loans
  set estado = 'devuelto',
      fecha_devolucion_real = now(),
      devolucion_solicitada_en = null -- la intención ya se cumplió
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
  'Devolución 2 pasos: SOLO el bibliotecario confirma la recepción física, cierra el préstamo y repone el stock. SECURITY DEFINER.';

-- --------------------------------------------------------------------------
-- Privilegios: solo authenticated (return_loan queda además gated a bibliotecario
-- dentro de la función).
-- --------------------------------------------------------------------------
revoke execute on function public.request_return(uuid)        from public, anon;
revoke execute on function public.cancel_return_request(uuid) from public, anon;
grant  execute on function public.request_return(uuid)        to authenticated;
grant  execute on function public.cancel_return_request(uuid) to authenticated;
