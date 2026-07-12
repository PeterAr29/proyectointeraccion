-- ==========================================================================
-- BiblioTEC · Catálogo por áreas académicas
--
-- El catálogo se organiza por ÁREA (campo `books.categoria`, lista controlada
-- en lib/domain/areas.ts). Este cambio:
--   1) Reclasifica los libros existentes de 'Ingeniería' a 'Ingeniería y
--      Tecnología' (nueva etiqueta de área).
--   2) Agrega libros [demo] en las demás áreas para que el hub del catálogo no
--      quede vacío en la demo. Son fixtures marcados; el bibliotecario puede
--      darlos de baja (baja lógica) desde /libros. Autor 'Autor desconocido'
--      (placeholder, no se inventan datos); ISBN/editorial/año quedan en NULL.
--
-- Idempotente: la reclasificación no reincide y las inserciones usan
-- ON CONFLICT DO NOTHING (UUID fijos). En un `db reset` local corre antes del
-- seed (tabla vacía): el UPDATE es no-op y el seed añade el resto del catálogo.
-- ==========================================================================

update public.books
set categoria = 'Ingeniería y Tecnología'
where categoria = 'Ingeniería';

insert into public.books
  (id, titulo, autor, categoria, cantidad_total, cantidad_disponible)
values
  ('b0000000-0000-0000-0000-0000000000a1', 'Fundamentos de Agronomía',              'Autor desconocido', 'Ciencias Agrarias',       3, 3),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a2', 'Manejo de Suelos y Fertilidad',         'Autor desconocido', 'Ciencias Agrarias',       2, 1),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a3', 'Fundamentos de Enfermería',             'Autor desconocido', 'Ciencias de la Salud',    4, 3),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a4', 'Anatomía Humana',                       'Autor desconocido', 'Ciencias de la Salud',    3, 2),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a5', 'Contabilidad General',                  'Autor desconocido', 'Ciencias Empresariales',  3, 3),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a6', 'Fundamentos de Administración',         'Autor desconocido', 'Ciencias Empresariales',  4, 2),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a7', 'Introducción al Trabajo Social',        'Autor desconocido', 'Ciencias Sociales',       3, 3),  -- [demo]
  ('b0000000-0000-0000-0000-0000000000a8', 'Metodología de la Investigación Social','Autor desconocido', 'Ciencias Sociales',       2, 2)   -- [demo]
on conflict (id) do nothing;
