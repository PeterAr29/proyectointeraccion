-- =============================================================================
-- Kit SUS · preparar-datos.sql
-- Deja UNA cuenta de estudiante en estado LISTO para una sesión del estudio SUS,
-- de modo que las 4 tareas críticas (cuestionario-sus.md, Parte A) sean posibles:
--
--   T1 buscar + prestar  → hay libros con stock (no lo toca este script)
--   T2 ampliar           → la cuenta queda con 2 préstamos ACTIVOS, 0 ampliaciones
--                          usadas y SIN multa pendiente (si no, "Ampliar" sale
--                          deshabilitado; política 2 días + 1 ampliación de 1 día).
--   T3 devolver          → esos mismos préstamos activos se pueden devolver.
--   T4 reservar          → garantiza que exista ≥1 libro con 0 ejemplares.
--
-- CUÁNDO CORRERLO: ANTES de cada participante (cada sesión "consume" los préstamos
-- de la cuenta al ampliar/devolver). Reutiliza la misma cuenta de prueba entre
-- participantes corriendo este script antes de cada uno, o usa una cuenta por
-- participante cambiando el correo de abajo.
--
-- CÓMO CORRERLO:
--   · Panel de Supabase → SQL Editor → pega y ejecuta, O
--   · psql "$DATABASE_URL" -f docs/sus-kit/preparar-datos.sql
--
-- ⚠️ DESTRUCTIVO **solo para la cuenta indicada**: borra sus préstamos, reservas y
--    multas (repone el stock de sus préstamos activos) y le crea 2 préstamos nuevos.
--    No toca a ningún otro usuario. Todo el bloque es ATÓMICO: si algo falla, no
--    aplica nada. Es un entorno de PILOTO académico, no producción con datos reales.
--
-- 👉 EDITA UNA SOLA LÍNEA: el correo de la cuenta de prueba (v_email, abajo).
--    Cuenta recomendada para T2/T3: fcerna@unitru.edu.pe (Frank Cerna).
-- =============================================================================

do $$
declare
  v_email  text := 'fcerna@unitru.edu.pe';   -- << EDITA ESTE CORREO
  v_user   uuid;
  v_dias   int;
  v_books  uuid[];
  v_bid    uuid;
  v_t4_id  uuid;
  v_t4_tit text;
begin
  -- 1) Resolver la cuenta de prueba
  select id into v_user from profiles where correo = v_email and rol = 'estudiante';
  if v_user is null then
    raise exception 'No existe un estudiante con correo %. Corrige v_email.', v_email;
  end if;

  -- Plazo de préstamo vigente (para fijar una fecha de devolución futura → no vencido)
  select dias_prestamo into v_dias from settings order by id limit 1;
  v_dias := coalesce(v_dias, 2);

  -- 2) Limpiar el estado previo de ESTA cuenta (solo la suya)
  delete from fines        where user_id = v_user;   -- multas (FK a loans) primero
  delete from reservations where user_id = v_user;   -- reservas previas → T4 fresca

  -- Reponer el stock de sus préstamos aún abiertos antes de borrarlos
  update books b
     set cantidad_disponible = least(b.cantidad_total, b.cantidad_disponible + 1)
    from loans l
   where l.book_id = b.id and l.user_id = v_user and l.estado in ('activo','vencido');

  delete from loans where user_id = v_user;

  -- 3) Elegir 2 libros con stock y crearle 2 préstamos activos y ampliables
  select array(
    select id from books
     where activo and cantidad_disponible >= 1
     order by titulo
     limit 2
  ) into v_books;

  if coalesce(array_length(v_books, 1), 0) < 2 then
    raise exception 'No hay 2 libros con stock disponibles para crear los préstamos de prueba.';
  end if;

  foreach v_bid in array v_books loop
    update books set cantidad_disponible = cantidad_disponible - 1 where id = v_bid;
    insert into loans (book_id, user_id, fecha_prestamo, fecha_devolucion_estimada,
                       estado, renovaciones, vencimiento_notificado_en)
    values (v_bid, v_user, current_date, current_date + v_dias, 'activo', 0, null);
  end loop;

  -- 4) Garantizar un libro con 0 ejemplares para T4 (si ya lo hay, no hace nada)
  if not exists (select 1 from books where activo and cantidad_disponible = 0) then
    select id, titulo into v_t4_id, v_t4_tit
      from books
     where activo and cantidad_disponible = cantidad_total and id <> all(v_books)
     order by titulo
     limit 1;
    if v_t4_id is not null then
      update books set cantidad_disponible = 0 where id = v_t4_id;
      raise notice 'T4: se dejó "%" con 0 ejemplares para poder reservar.', v_t4_tit;
    else
      raise warning 'T4: no pude fijar un libro con 0 ejemplares; revisa el catálogo manualmente.';
    end if;
  end if;

  raise notice 'Cuenta % lista: 2 préstamos activos (0 ampliaciones, sin multa), plazo % días.',
    v_email, v_dias;
end $$;

-- ---------------------------------------------------------------------------
-- Verificación (opcional). Usa el MISMO correo que arriba.
-- Debe mostrar 2 préstamos activos, 0 multas pendientes, y ≥1 libro con 0 stock.
-- ---------------------------------------------------------------------------
select
  (select count(*) from loans l join profiles p on p.id = l.user_id
     where p.correo = 'fcerna@unitru.edu.pe' and l.estado <> 'devuelto')      as prestamos_activos,
  (select count(*) from fines f join profiles p on p.id = f.user_id
     where p.correo = 'fcerna@unitru.edu.pe' and f.estado = 'pendiente')      as multas_pendientes,
  (select count(*) from books where activo and cantidad_disponible = 0)       as libros_para_reservar;
