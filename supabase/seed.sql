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
  ('b0000000-0000-0000-0000-000000000006', 'Effective Java', 'Joshua Bloch', 'Addison-Wesley', 2018, '9780134685991', 'Ingeniería y Tecnología', 'Estantería A',
   'Buenas prácticas y patrones idiomáticos para programar en Java.', 3, 3),
  ('b0000000-0000-0000-0000-000000000007', 'Data Structures and Algorithms in Java', 'Michael T. Goodrich, Roberto Tamassia, Michael H. Goldwasser', 'Wiley', 2014, '9781118771334', 'Ingeniería y Tecnología', 'Estantería A',
   'Estructuras de datos y algoritmos implementados en Java.', 3, 2);

-- --------------------------------------------------------------------------
-- 3b) Catálogo real por áreas (ISBN con carátula verificada en OpenLibrary).
--     La migración `..._catalog_areas.sql` corre antes del seed e inserta los
--     libros [demo] a1..a8; aquí se eliminan y se reemplazan por libros reales
--     que cubren las 5 áreas académicas. `books.categoria` es lista controlada
--     (lib/domain/areas.ts); todos los títulos/autores/ISBN son originales.
-- --------------------------------------------------------------------------
delete from public.books where id in (
  'b0000000-0000-0000-0000-0000000000a1','b0000000-0000-0000-0000-0000000000a2',
  'b0000000-0000-0000-0000-0000000000a3','b0000000-0000-0000-0000-0000000000a4',
  'b0000000-0000-0000-0000-0000000000a5','b0000000-0000-0000-0000-0000000000a6',
  'b0000000-0000-0000-0000-0000000000a7','b0000000-0000-0000-0000-0000000000a8'
);

insert into public.books (id, titulo, autor, editorial, anio, isbn, categoria, ubicacion, descripcion, cantidad_total, cantidad_disponible)
values
  -- Ingeniería y Tecnología (Estantería A)
  ('b0000000-0000-0000-0000-000000000101','Clean Code','Robert C. Martin','Prentice Hall',2008,'9780132350884','Ingeniería y Tecnología','Estantería A','Guía práctica para escribir código limpio, legible y mantenible.',4,4),
  ('b0000000-0000-0000-0000-000000000102','The Pragmatic Programmer','Andrew Hunt, David Thomas','Addison-Wesley',1999,'9780201616224','Ingeniería y Tecnología','Estantería A','Principios y hábitos para convertirse en un programador pragmático.',3,3),
  ('b0000000-0000-0000-0000-000000000103','Design Patterns','Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides','Addison-Wesley',1994,'9780201633610','Ingeniería y Tecnología','Estantería A','Los 23 patrones de diseño clásicos de la programación orientada a objetos.',3,3),
  ('b0000000-0000-0000-0000-000000000104','The C Programming Language','Brian W. Kernighan, Dennis M. Ritchie','Prentice Hall',1988,'9780131103627','Ingeniería y Tecnología','Estantería A','La referencia definitiva del lenguaje C, escrita por sus creadores.',4,4),
  ('b0000000-0000-0000-0000-000000000105','Structure and Interpretation of Computer Programs','Harold Abelson, Gerald Jay Sussman','MIT Press',1996,'9780262011532','Ingeniería y Tecnología','Estantería A','Fundamentos de la programación y la abstracción computacional (MIT).',3,3),
  ('b0000000-0000-0000-0000-000000000106','Compilers: Principles, Techniques, and Tools','Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman','Addison-Wesley',2006,'9780321486813','Ingeniería y Tecnología','Estantería A','El «libro del dragón»: teoría y práctica de la construcción de compiladores.',3,3),
  ('b0000000-0000-0000-0000-000000000107','Operating System Concepts','Abraham Silberschatz, Peter B. Galvin, Greg Gagne','Wiley',2012,'9781118063330','Ingeniería y Tecnología','Estantería A','Conceptos fundamentales de los sistemas operativos modernos.',4,4),
  ('b0000000-0000-0000-0000-000000000108','Computer Organization and Design','David A. Patterson, John L. Hennessy','Morgan Kaufmann',2016,'9780134494166','Ingeniería y Tecnología','Estantería A','La interfaz hardware/software: arquitectura de computadores desde cero.',3,3),
  -- Ciencias Agrarias (Estantería B)
  ('b0000000-0000-0000-0000-000000000201','The Nature and Properties of Soils','Nyle C. Brady, Ray R. Weil','Pearson',2016,'9780133254488','Ciencias Agrarias','Estantería B','Texto de referencia mundial sobre la ciencia y el manejo de los suelos.',4,4),
  ('b0000000-0000-0000-0000-000000000202','Plant Physiology and Development','Lincoln Taiz, Eduardo Zeiger, Ian Max Møller, Angus Murphy','Sinauer',2018,'9781605353531','Ciencias Agrarias','Estantería B','Fisiología y desarrollo de las plantas, base de la producción agrícola.',3,3),
  ('b0000000-0000-0000-0000-000000000203','Campbell Biology','Jane B. Reece, Lisa A. Urry, Michael L. Cain','Pearson',2013,'9780321775658','Ciencias Agrarias','Estantería B','El texto de biología general más usado en el mundo universitario.',4,4),
  ('b0000000-0000-0000-0000-000000000204','Chemistry: The Central Science','Theodore E. Brown, H. Eugene LeMay, Bruce E. Bursten','Pearson',2017,'9780134580999','Ciencias Agrarias','Estantería B','Química general con enfoque conceptual, base para las ciencias agrarias.',4,4),
  ('b0000000-0000-0000-0000-000000000205','Biochemistry','Lubert Stryer','W. H. Freeman',null,'9780716710073','Ciencias Agrarias','Estantería B','Bioquímica clásica: estructura y función de las biomoléculas.',3,3),
  -- Ciencias de la Salud (Estantería C)
  ('b0000000-0000-0000-0000-000000000301','Gray''s Anatomy for Students','Richard L. Drake, A. Wayne Vogl, Adam W. M. Mitchell','Elsevier',2019,'9780323393041','Ciencias de la Salud','Estantería C','Anatomía humana orientada a la clínica, ampliamente ilustrada.',4,4),
  ('b0000000-0000-0000-0000-000000000302','Fundamentals of Nursing','Patricia A. Potter, Anne Griffin Perry','Elsevier',2020,'9780323677721','Ciencias de la Salud','Estantería C','Bases teóricas y prácticas del cuidado de enfermería.',5,5),
  ('b0000000-0000-0000-0000-000000000303','Guyton and Hall Textbook of Medical Physiology','John E. Hall','Elsevier',2015,'9781455770052','Ciencias de la Salud','Estantería C','El texto de fisiología médica de referencia a nivel mundial.',3,3),
  ('b0000000-0000-0000-0000-000000000304','Robbins Basic Pathology','Vinay Kumar, Abul K. Abbas, Jon C. Aster','Elsevier',2017,'9780323353175','Ciencias de la Salud','Estantería C','Fundamentos de patología: mecanismos de la enfermedad.',3,3),
  ('b0000000-0000-0000-0000-000000000305','Human Anatomy & Physiology','Elaine N. Marieb, Katja Hoehn','Pearson',2018,'9780321927040','Ciencias de la Salud','Estantería C','Anatomía y fisiología humana integradas para ciencias de la salud.',4,4),
  ('b0000000-0000-0000-0000-000000000306','Brunner & Suddarth''s Textbook of Medical-Surgical Nursing','Janice L. Hinkle, Kerry H. Cheever','Wolters Kluwer',2017,'9781496344380','Ciencias de la Salud','Estantería C','Enfermería médico-quirúrgica: cuidado del paciente adulto.',3,3),
  -- Ciencias Empresariales (Estantería D)
  ('b0000000-0000-0000-0000-000000000401','Principles of Marketing','Philip Kotler, Gary Armstrong','Pearson',2015,'9780133795028','Ciencias Empresariales','Estantería D','Fundamentos del marketing y la creación de valor para el cliente.',4,4),
  ('b0000000-0000-0000-0000-000000000402','Principles of Economics','N. Gregory Mankiw','Cengage',2016,'9781305585126','Ciencias Empresariales','Estantería D','Introducción clara a la microeconomía y la macroeconomía.',4,4),
  ('b0000000-0000-0000-0000-000000000403','Management','Stephen P. Robbins, Mary Coulter','Pearson',2017,'9780134527604','Ciencias Empresariales','Estantería D','Teoría y práctica de la administración de organizaciones.',3,3),
  ('b0000000-0000-0000-0000-000000000404','Corporate Finance','Stephen A. Ross, Randolph W. Westerfield, Jeffrey Jaffe','McGraw-Hill',2015,'9780077861759','Ciencias Empresariales','Estantería D','Decisiones de inversión y financiamiento en la empresa.',3,3),
  ('b0000000-0000-0000-0000-000000000405','Horngren''s Financial Accounting','Tracie Miller-Nobles, Brenda Mattison, Ella Mae Matsumura','Pearson',2017,'9780134475585','Ciencias Empresariales','Estantería D','Contabilidad financiera: registro y análisis de la información contable.',3,3),
  ('b0000000-0000-0000-0000-000000000406','Marketing','Dhruv Grewal, Michael Levy','McGraw-Hill',2016,'9780078029233','Ciencias Empresariales','Estantería D','Enfoque práctico y actual del marketing basado en valor.',3,3),
  ('b0000000-0000-0000-0000-000000000407','Managerial Accounting','Ray H. Garrison, Eric W. Noreen, Peter C. Brewer','McGraw-Hill',2017,'9781259578540','Ciencias Empresariales','Estantería D','Contabilidad gerencial para la toma de decisiones.',3,3),
  -- Ciencias Sociales (Estantería E)
  ('b0000000-0000-0000-0000-000000000501','The Practice of Social Research','Earl R. Babbie','Cengage',2015,'9781305104945','Ciencias Sociales','Estantería E','Manual clásico de métodos de investigación en ciencias sociales.',4,4),
  ('b0000000-0000-0000-0000-000000000502','Sociology','John J. Macionis','Pearson',2016,'9780133753271','Ciencias Sociales','Estantería E','Introducción integral a la sociología y el análisis de la sociedad.',4,4),
  ('b0000000-0000-0000-0000-000000000503','Psychology','David G. Myers, C. Nathan DeWall','Worth Publishers',2018,'9781319050634','Ciencias Sociales','Estantería E','Introducción a la psicología científica y el comportamiento humano.',3,3),
  ('b0000000-0000-0000-0000-000000000504','Social Psychology','David G. Myers, Jean M. Twenge','McGraw-Hill',2016,'9780078035296','Ciencias Sociales','Estantería E','Cómo pensamos, influimos y nos relacionamos con los demás.',3,3),
  ('b0000000-0000-0000-0000-000000000505','Social Research Methods','Alan Bryman','Oxford University Press',2016,'9780199689453','Ciencias Sociales','Estantería E','Métodos cuantitativos y cualitativos de investigación social.',3,3),
  ('b0000000-0000-0000-0000-000000000506','The Social Work Skills Workbook','Barry R. Cournoyer','Cengage',2016,'9781452258065','Ciencias Sociales','Estantería E','Competencias y habilidades esenciales para la práctica del trabajo social.',3,3);

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
