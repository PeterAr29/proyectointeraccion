-- ==========================================================================
-- BiblioTEC · F4.2 · Marcadores de notificación (Módulo D)
-- Fuente: docs/guia_desarrollo.md §F4.2 y docs/especificaciones.md §7.
--
-- El motor de notificaciones (lib/services/notifications.ts) genera avisos
-- idempotentes. Para no duplicar avisos entre renders (el barrido corre en la
-- vista, como el de multas de F4.1) marcamos la fila ORIGEN cuando ya se avisó:
--   · reservations.notificada_disponible_en → se avisó "reserva disponible".
--   · loans.vencimiento_notificado_en       → se avisó "vencimiento próximo".
-- Son timestamptz (no boolean) para poder auditar cuándo se envió y, en el caso
-- del préstamo, permitir un nuevo aviso tras una renovación (que mueve la fecha).
-- La multa (multa_generada) no necesita marcador: la fila `fines` es única por
-- préstamo (índice de F4.1) y el aviso se emite solo al CREAR la multa.
-- ==========================================================================

alter table public.reservations
  add column if not exists notificada_disponible_en timestamptz;

comment on column public.reservations.notificada_disponible_en is
  'F4.2: cuándo se notificó al usuario que su reserva pasó a disponible (null = aún no). Idempotencia del aviso reserva_disponible.';

alter table public.loans
  add column if not exists vencimiento_notificado_en timestamptz;

comment on column public.loans.vencimiento_notificado_en is
  'F4.2: cuándo se notificó el vencimiento próximo del préstamo (null = aún no). Se reinicia al renovar para permitir un nuevo aviso en el nuevo plazo.';

-- --------------------------------------------------------------------------
-- renew_loan: al renovar, la fecha de devolución se recalcula, así que el
-- marcador de "vencimiento próximo" debe reiniciarse para poder avisar de nuevo
-- cuando el nuevo plazo esté por vencer. Se re-declara la función de F3.2
-- (20260710140000) añadiendo `vencimiento_notificado_en = null` al UPDATE.
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
      fecha_devolucion_estimada = now() + make_interval(days => v_dias),
      vencimiento_notificado_en = null -- F4.2: permite avisar del nuevo plazo
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.renew_loan(uuid) is
  'F3.2/F4.2: renueva el préstamo (owner o bibliotecario), recalcula la fecha, valida máximo de renovaciones y multa pendiente, y reinicia el marcador de aviso de vencimiento. SECURITY DEFINER.';
