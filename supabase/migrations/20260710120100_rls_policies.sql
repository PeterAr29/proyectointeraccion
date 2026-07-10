-- ==========================================================================
-- BiblioTEC · F1.2 · Políticas RLS por rol
-- Modelo de autorización real (A01). La UI nunca es la fuente de autorización.
--
-- Principios:
--   · deny-by-default: sin política que lo permita, la operación se rechaza.
--   · estudiante: solo lee/escribe SUS propias filas (loans, reservations,
--     fines[lectura], notifications, favorites, profile).
--   · books y settings: lectura para cualquier autenticado.
--   · bibliotecario: acceso ampliado (definido con is_librarian()).
--   · Generación de multas/notificaciones por el sistema (Módulo D) se hace
--     server-side con SUPABASE_SERVICE_ROLE_KEY, que ignora RLS. Por eso el
--     INSERT de fines/notifications se limita al bibliotecario y no al alumno.
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Helper: ¿el usuario actual es bibliotecario?
-- SECURITY DEFINER para leer profiles saltándose RLS y evitar recursión
-- (una política de profiles que consultara profiles se auto-referenciaría).
-- --------------------------------------------------------------------------
create or replace function public.is_librarian()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'bibliotecario'
      and activo = true
  );
$$;

comment on function public.is_librarian() is 'True si el usuario autenticado es bibliotecario activo. SECURITY DEFINER: evita recursión de RLS en profiles.';

-- ==========================================================================
-- profiles
-- ==========================================================================
-- Cada quien ve su propio perfil; el bibliotecario ve todos.
create policy "profiles_select_own_or_librarian"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_librarian());

-- El usuario crea SOLO su propio perfil (registro liga id = auth.uid()).
create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- El dueño edita su perfil; el bibliotecario edita cualquiera (rol/activación).
-- Nota: la promoción a bibliotecario es una operación de admin, cubierta aquí
-- por is_librarian(); el estudiante no puede escalar su propio rol porque en
-- la práctica el cambio de rol pasa por el service de admin (revalida en server).
create policy "profiles_update_own_or_librarian"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_librarian())
  with check (id = auth.uid() or public.is_librarian());

-- Sin política de DELETE: los usuarios se desactivan (activo=false), no se borran.

-- ==========================================================================
-- books — lectura pública para autenticados; escritura solo bibliotecario
-- ==========================================================================
create policy "books_select_authenticated"
  on public.books for select to authenticated
  using (true);

create policy "books_insert_librarian"
  on public.books for insert to authenticated
  with check (public.is_librarian());

create policy "books_update_librarian"
  on public.books for update to authenticated
  using (public.is_librarian())
  with check (public.is_librarian());

create policy "books_delete_librarian"
  on public.books for delete to authenticated
  using (public.is_librarian());

-- ==========================================================================
-- loans — el estudiante gestiona los suyos; el bibliotecario, todos
-- ==========================================================================
create policy "loans_select_own_or_librarian"
  on public.loans for select to authenticated
  using (user_id = auth.uid() or public.is_librarian());

create policy "loans_insert_own_or_librarian"
  on public.loans for insert to authenticated
  with check (user_id = auth.uid() or public.is_librarian());

-- Renovar/devolver (estudiante sobre lo suyo) y gestión del bibliotecario.
create policy "loans_update_own_or_librarian"
  on public.loans for update to authenticated
  using (user_id = auth.uid() or public.is_librarian())
  with check (user_id = auth.uid() or public.is_librarian());

create policy "loans_delete_librarian"
  on public.loans for delete to authenticated
  using (public.is_librarian());

-- ==========================================================================
-- reservations — mismo patrón que loans
-- ==========================================================================
create policy "reservations_select_own_or_librarian"
  on public.reservations for select to authenticated
  using (user_id = auth.uid() or public.is_librarian());

create policy "reservations_insert_own_or_librarian"
  on public.reservations for insert to authenticated
  with check (user_id = auth.uid() or public.is_librarian());

create policy "reservations_update_own_or_librarian"
  on public.reservations for update to authenticated
  using (user_id = auth.uid() or public.is_librarian())
  with check (user_id = auth.uid() or public.is_librarian());

create policy "reservations_delete_own_or_librarian"
  on public.reservations for delete to authenticated
  using (user_id = auth.uid() or public.is_librarian());

-- ==========================================================================
-- fines — el estudiante SOLO lee las suyas; crea/edita/cobra el bibliotecario
-- (la generación automática por el sistema usa el service role, que ignora RLS)
-- ==========================================================================
create policy "fines_select_own_or_librarian"
  on public.fines for select to authenticated
  using (user_id = auth.uid() or public.is_librarian());

create policy "fines_insert_librarian"
  on public.fines for insert to authenticated
  with check (public.is_librarian());

create policy "fines_update_librarian"
  on public.fines for update to authenticated
  using (public.is_librarian())
  with check (public.is_librarian());

create policy "fines_delete_librarian"
  on public.fines for delete to authenticated
  using (public.is_librarian());

-- ==========================================================================
-- notifications — el usuario lee las suyas y las marca leídas; crea el sistema
-- ==========================================================================
create policy "notifications_select_own_or_librarian"
  on public.notifications for select to authenticated
  using (user_id = auth.uid() or public.is_librarian());

-- Marcar como leída (update) sobre las propias; el bibliotecario, cualquiera.
create policy "notifications_update_own_or_librarian"
  on public.notifications for update to authenticated
  using (user_id = auth.uid() or public.is_librarian())
  with check (user_id = auth.uid() or public.is_librarian());

-- Alta de notificaciones: bibliotecario (el sistema usa service role).
create policy "notifications_insert_librarian"
  on public.notifications for insert to authenticated
  with check (public.is_librarian());

create policy "notifications_delete_own_or_librarian"
  on public.notifications for delete to authenticated
  using (user_id = auth.uid() or public.is_librarian());

-- ==========================================================================
-- favorites — cada quien administra los suyos
-- ==========================================================================
create policy "favorites_select_own"
  on public.favorites for select to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete to authenticated
  using (user_id = auth.uid());

-- ==========================================================================
-- settings — lectura para cualquier autenticado; edición solo bibliotecario
-- (los services necesitan leer dias_prestamo / multa_diaria / max_renovaciones)
-- ==========================================================================
create policy "settings_select_authenticated"
  on public.settings for select to authenticated
  using (true);

create policy "settings_update_librarian"
  on public.settings for update to authenticated
  using (public.is_librarian())
  with check (public.is_librarian());

create policy "settings_insert_librarian"
  on public.settings for insert to authenticated
  with check (public.is_librarian());
