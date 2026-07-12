-- ==========================================================================
-- BiblioTEC · Política de circulación: préstamo de 2 días, ampliación de 1 día
--
-- Cambio de reglas de negocio pedido por el producto:
--   · Un préstamo dura como máximo 2 días.
--   · Solo puede ampliarse una vez, sumando exactamente 1 día.
--
-- Este archivo:
--   1) Ajusta la fila única de `settings` (dias_prestamo = 2, max_renovaciones = 1).
--   2) Redefine `renew_loan` para que la ampliación sume SIEMPRE 1 día
--      (independiente de `dias_prestamo`), en vez del plazo completo del préstamo.
--
-- No es retroactivo para el plazo de préstamos ya emitidos: `create_loan` sigue
-- leyendo `dias_prestamo` al prestar, que ahora vale 2.
-- ==========================================================================

-- 1) Parámetros de circulación vigentes.
update public.settings
set dias_prestamo = 2, max_renovaciones = 1
where id = 1;

-- 2) La ampliación suma exactamente 1 día al plazo (RF-C04, política 2+1).
--    Idéntica a la versión anterior salvo el cálculo de la nueva fecha: parte de
--    la fecha estimada vigente (o de ahora, si ya venció) y le añade 1 día, para
--    que la ampliación nunca deje la fecha en el pasado.
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
        greatest(fecha_devolucion_estimada, now()) + make_interval(days => 1)
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

comment on function public.renew_loan(uuid) is
  'Amplía el préstamo (owner o bibliotecario) sumando 1 día al plazo; valida el máximo de ampliaciones y la multa pendiente. SECURITY DEFINER.';

revoke execute on function public.renew_loan(uuid) from public, anon;
grant  execute on function public.renew_loan(uuid) to authenticated;
