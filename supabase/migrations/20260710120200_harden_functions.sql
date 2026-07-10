-- ==========================================================================
-- BiblioTEC · F1.2 · Endurecimiento de funciones (security advisors)
-- Corrige avisos de los linters de seguridad de Supabase tras la BD inicial:
--
--   1) function_search_path_mutable: set_updated_at no fijaba search_path.
--      Un search_path mutable permite secuestro de resolución de nombres.
--
--   2) anon_security_definer_function_executable: is_librarian() quedaba
--      expuesta como RPC pública (/rest/v1/rpc/is_librarian) al rol anon.
--      Se revoca EXECUTE de PUBLIC y anon.
--      OJO: las políticas RLS evalúan is_librarian() con el permiso del rol
--      INVOCANTE (probado: revocar de authenticated da "permission denied for
--      function"), así que hay que MANTENER el EXECUTE para authenticated.
--
-- Riesgo residual ACEPTADO (🟡 bajo): el aviso
-- authenticated_security_definer_function_executable sigue activo porque
-- authenticated puede llamar rpc/is_librarian. Solo revela el rol del PROPIO
-- llamante (nunca datos de otro usuario), por lo que no es una fuga real.
-- Endurecimiento futuro opcional: mover is_librarian() a un esquema no expuesto
-- por PostgREST (p. ej. `private`) y referenciarla desde las políticas.
-- ==========================================================================

alter function public.set_updated_at() set search_path = '';

revoke execute on function public.is_librarian() from public;
revoke execute on function public.is_librarian() from anon;
grant  execute on function public.is_librarian() to authenticated;
