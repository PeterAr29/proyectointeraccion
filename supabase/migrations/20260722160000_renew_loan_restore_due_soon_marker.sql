-- ==========================================================================
-- BiblioTEC · Fix: restaurar el reinicio del aviso de vencimiento al ampliar
--
-- REGRESIÓN QUE CORRIGE
-- La migración 20260712120000_loan_two_day_policy.sql re-declaró `renew_loan`
-- partiendo de la versión de F3.2 (20260710140000) en vez de la de F4.2
-- (20260710160000), y con eso perdió esta línea del UPDATE:
--
--     vencimiento_notificado_en = null
--
-- `syncOwnDueSoonNotifications` (lib/services/notifications.ts) selecciona solo
-- préstamos con `vencimiento_notificado_en is null`. Sin el reinicio, un
-- préstamo que YA recibió su aviso de "vencimiento próximo" nunca vuelve a
-- avisar tras ampliarse: el usuario amplía el plazo y se queda sin recordatorio
-- del nuevo vencimiento. Con la política vigente de 2 días + 1 ampliación de
-- 1 día, el margen es de horas, así que la pérdida del aviso es más grave que
-- bajo la política anterior.
--
-- QUÉ HACE ESTA MIGRACIÓN
-- Re-declara `renew_loan` conservando ÍNTEGRA la semántica de la política 2+1
-- (la ampliación suma exactamente 1 día, partiendo de `greatest(fecha, now())`)
-- y volviendo a añadir `vencimiento_notificado_en = null`.
--
-- No se edita ninguna migración ya aplicada: este archivo es aditivo.
-- ==========================================================================

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

  select max_renovaciones into v_max from public.settings where id = 1;
  v_max := coalesce(v_max, 1);

  if v_loan.renovaciones >= v_max then
    raise exception 'Alcanzaste el máximo de ampliaciones' using errcode = 'BT101';
  end if;

  if exists (
    select 1 from public.fines
    where loan_id = p_loan_id and estado = 'pendiente'
  ) then
    raise exception 'Tienes una multa pendiente de este préstamo' using errcode = 'BT102';
  end if;

  update public.loans
  set renovaciones = renovaciones + 1,
      estado = 'activo', -- ampliar limpia un posible 'vencido'
      fecha_devolucion_estimada =
        greatest(fecha_devolucion_estimada, now()) + make_interval(days => 1),
      vencimiento_notificado_en = null -- F4.2: permite avisar del nuevo plazo
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.renew_loan(uuid) is
  'Amplía el préstamo (owner o bibliotecario) sumando 1 día al plazo; valida el máximo de ampliaciones y la multa pendiente, y reinicia el marcador de aviso de vencimiento (F4.2). SECURITY DEFINER.';

revoke execute on function public.renew_loan(uuid) from public, anon;
grant  execute on function public.renew_loan(uuid) to authenticated;
