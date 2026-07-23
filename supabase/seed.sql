-- ==========================================================================
-- BiblioTEC · F1.2 · Datos semilla (seed)
-- Se aplica automáticamente tras las migraciones con `supabase db reset`.
--
-- PROCEDENCIA DE LOS DATOS (regla "no inventar datos del dominio"):
--   · Del contexto (ContextoInicial.md §9), EXACTOS:
--       - Libro "Bases de Datos" y "Sistemas Operativos Modernos" (datos completos).
--       - Usuaria María García López (código, carrera, correo, teléfono).
--       - Los títulos/autores de los otros 5 libros y los nombres de los otros usuarios.
--   · FIXTURES de demo (NO vienen del contexto; necesarios para que el seed corra
--     y para poder probar fases posteriores). Marcados con  -- [demo]:
--       - correos y códigos universitarios de Juan/Ana/Luis y del bibliotecario,
--       - contraseña común de todos los usuarios semilla,
--       - cantidades (total/disponible) de todos los libros,
--       - un préstamo y un favorito de ejemplo de María.
--   · Campos bibliográficos no dados por el contexto quedan en NULL (no se inventan).
--
-- Contraseña de TODOS los usuarios semilla (solo entorno local): Biblioteca123
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1) Usuarios de auth (auth.users + auth.identities) y sus profiles
-- --------------------------------------------------------------------------
-- Se crean con UUID fijos para poder referenciarlos en préstamos/favoritos.
-- El patrón de inserción en auth.users/identities es el estándar de Supabase
-- para seeds locales (email + password confirmados).

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'maria.garcia@univ.edu.pe', crypt('Biblioteca123', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'juan.perez@univ.edu.pe', crypt('Biblioteca123', gen_salt('bf')), now(), now(), now(),   -- [demo] correo
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
   'ana.torres@univ.edu.pe', crypt('Biblioteca123', gen_salt('bf')), now(), now(), now(),    -- [demo] correo
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated',
   'luis.diaz@univ.edu.pe', crypt('Biblioteca123', gen_salt('bf')), now(), now(), now(),     -- [demo] correo
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated',
   'admin@univ.edu.pe', crypt('Biblioteca123', gen_salt('bf')), now(), now(), now(),         -- [demo] correo
   '{"provider":"email","providers":["email"]}', '{}', '', '', '', '');

-- Identidades de proveedor 'email' (necesarias para el login por correo).
insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"maria.garcia@univ.edu.pe","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"juan.perez@univ.edu.pe","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"ana.torres@univ.edu.pe","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   '{"sub":"44444444-4444-4444-4444-444444444444","email":"luis.diaz@univ.edu.pe","email_verified":true}', 'email', now(), now(), now()),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   '{"sub":"55555555-5555-5555-5555-555555555555","email":"admin@univ.edu.pe","email_verified":true}', 'email', now(), now(), now());

-- profiles (rol por defecto estudiante; el bibliotecario se marca explícito).
insert into public.profiles (id, codigo_universitario, nombre, carrera, correo, telefono, rol)
values
  ('11111111-1111-1111-1111-111111111111', '202100123', 'María García López', 'Ingeniería de Sistemas', 'maria.garcia@univ.edu.pe', '987 654 321', 'estudiante'),
  ('22222222-2222-2222-2222-222222222222', '202100124', 'Juan Pérez',  null, 'juan.perez@univ.edu.pe', null, 'estudiante'),   -- [demo] código
  ('33333333-3333-3333-3333-333333333333', '202100125', 'Ana Torres',  null, 'ana.torres@univ.edu.pe', null, 'estudiante'),   -- [demo] código
  ('44444444-4444-4444-4444-444444444444', '202100126', 'Luis Díaz',   null, 'luis.diaz@univ.edu.pe',  null, 'estudiante'),   -- [demo] código
  ('55555555-5555-5555-5555-555555555555', 'ADMIN0001', 'Administrador de Biblioteca', null, 'admin@univ.edu.pe', null, 'bibliotecario');  -- [demo] código

-- --------------------------------------------------------------------------
-- 2) Configuración global (fila única)
-- --------------------------------------------------------------------------
-- Política de circulación de BiblioTEC: préstamo de 2 días y una única
-- ampliación de 1 día (max_renovaciones = 1).
insert into public.settings (id, dias_prestamo, multa_diaria, max_renovaciones)
values (1, 2, 1.00, 1);

-- --------------------------------------------------------------------------
-- 3) Catálogo de libros (títulos/autores del contexto §9)
--    Cantidades marcadas [demo]. "Inteligencia Artificial" queda sin stock
--    (disponible 0) para poder probar el flujo de reserva en fases futuras.
-- --------------------------------------------------------------------------
insert into public.books (id, titulo, autor, editorial, anio, isbn, categoria, ubicacion, descripcion, cantidad_total, cantidad_disponible)
values
  ('b0000000-0000-0000-0000-000000000001', 'Bases de Datos', 'Héctor García Molina', 'Pearson', 2020, '9780131873254', 'Ingeniería y Tecnología', 'Estantería 3 – Fila B',
   'Fundamentos de sistemas de bases de datos: modelado, SQL y transacciones.', 5, 5),                        -- [demo] cantidades
  ('b0000000-0000-0000-0000-000000000002', 'Algoritmos', 'T. Cormen', null, null, '9780262033848', 'Ingeniería y Tecnología', null,
   null, 4, 3),                                                                                                -- [demo] cantidades
  ('b0000000-0000-0000-0000-000000000003', 'Redes de Computadoras', 'A. Tanenbaum', null, null, '9780132126953', 'Ingeniería y Tecnología', null,
   null, 3, 2),                                                                                                -- [demo] cantidades
  ('b0000000-0000-0000-0000-000000000004', 'Inteligencia Artificial', 'S. Russell', null, null, '9780136042594', 'Ingeniería y Tecnología', null,
   null, 2, 0),                                                                                                -- [demo] sin stock (para reservas)
  ('b0000000-0000-0000-0000-000000000005', 'Sistemas Operativos Modernos', 'A. Tanenbaum', 'Pearson', 2023, '9780133591620', 'Ingeniería y Tecnología', 'Estantería 4 – Fila A',
   null, 4, 4),                                                                                                -- [demo] cantidades
  ('b0000000-0000-0000-0000-000000000006', 'Programación en Java', null, null, null, null, 'Ingeniería y Tecnología', null,
   null, 3, 3),                                                                                                -- autor no dado por el contexto -> NULL; [demo] cantidades
  ('b0000000-0000-0000-0000-000000000007', 'Estructuras de Datos', null, null, null, null, 'Ingeniería y Tecnología', null,
   null, 3, 2);                                                                                                -- autor no dado -> NULL; [demo] cantidades

-- 'Programación en Java' y 'Estructuras de Datos': el contexto no da autor.
-- autor es NOT NULL en el esquema, así que se registra el placeholder mínimo
-- 'Autor desconocido' (dato faltante explícito, no inventado).
update public.books set autor = 'Autor desconocido'
where id in ('b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007');

-- --------------------------------------------------------------------------
-- 4) [demo] Un préstamo activo y un favorito de María, para poder demostrar
--    "mis préstamos", historial y favoritos en fases posteriores.
--    El libro prestado (Redes) refleja la baja de disponibilidad ya arriba
--    (total 3, disponible 2).
-- --------------------------------------------------------------------------
insert into public.loans (id, book_id, user_id, fecha_prestamo, fecha_devolucion_estimada, estado, renovaciones)
values
  ('10000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   now(), now() + interval '2 days', 'activo', 0);  -- [demo] préstamo de 2 días

insert into public.favorites (user_id, book_id)
values
  ('11111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001');  -- [demo]
