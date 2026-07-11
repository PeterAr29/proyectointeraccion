-- ==========================================================================
-- BiblioTEC · F5.2 · Baja lógica de libros + Storage de portadas (Módulo E)
-- - books.activo: baja lógica del catálogo (no se borra en duro; se preserva el
--   historial de préstamos, que además está protegido por on delete restrict).
--   El catálogo del estudiante oculta los inactivos; el admin los ve y reactiva.
-- - Bucket `book-covers`: portadas subidas por el bibliotecario. Lectura pública
--   (bucket público → URL directa); escritura (insert/update/delete) solo
--   bibliotecario, reutilizando is_librarian().
-- ==========================================================================

-- --------------------------------------------------------------------------
-- books.activo — baja lógica
-- --------------------------------------------------------------------------
alter table public.books
  add column if not exists activo boolean not null default true;

comment on column public.books.activo is 'Baja lógica del catálogo (F5.2). false = retirado; el estudiante no lo ve, el historial se conserva.';

-- Índice parcial: el catálogo del estudiante filtra por activo con frecuencia.
create index if not exists books_activo_idx on public.books (activo) where activo = true;

-- --------------------------------------------------------------------------
-- Storage: bucket de portadas
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

-- Lectura pública de las portadas (bucket público; la política habilita la API).
drop policy if exists "book_covers_read" on storage.objects;
create policy "book_covers_read"
  on storage.objects for select to public
  using (bucket_id = 'book-covers');

-- Subir/reemplazar/borrar portadas: solo bibliotecario (A01).
drop policy if exists "book_covers_insert_librarian" on storage.objects;
create policy "book_covers_insert_librarian"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'book-covers' and public.is_librarian());

drop policy if exists "book_covers_update_librarian" on storage.objects;
create policy "book_covers_update_librarian"
  on storage.objects for update to authenticated
  using (bucket_id = 'book-covers' and public.is_librarian())
  with check (bucket_id = 'book-covers' and public.is_librarian());

drop policy if exists "book_covers_delete_librarian" on storage.objects;
create policy "book_covers_delete_librarian"
  on storage.objects for delete to authenticated
  using (bucket_id = 'book-covers' and public.is_librarian());
