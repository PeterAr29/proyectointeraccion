-- ==========================================================================
-- BiblioTEC · F5.2 · Guard anti-escalada de privilegios en profiles (A01)
-- Corrige un hueco latente desde F1.2: la política RLS
-- `profiles_update_own_or_librarian` permite al DUEÑO actualizar su propia fila
-- con `with check (id = auth.uid())`, lo que incluía las columnas sensibles
-- `rol` y `activo`. Un estudiante podía, hablando directo con PostgREST (anon key
-- público + su token), auto-promocionarse a bibliotecario o reactivarse.
--
-- Este trigger BLOQUEA cualquier cambio de `rol` o `activo` hecho por un usuario
-- autenticado que NO sea bibliotecario. El service role (auth.uid() nulo) y el
-- bibliotecario (is_librarian()) siguen pudiendo gestionarlos: son las rutas
-- legítimas (alta con cliente admin; edición desde el panel, F5.2).
-- ==========================================================================

create or replace function public.prevent_self_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo actúa sobre cambios hechos por un usuario autenticado no-bibliotecario.
  -- service role: auth.uid() es null → se permite (crea/gestiona la plataforma).
  if auth.uid() is not null and not public.is_librarian() then
    if new.rol is distinct from old.rol
       or new.activo is distinct from old.activo then
      raise exception 'No autorizado a cambiar el rol o la activación de la cuenta'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

comment on function public.prevent_self_privilege_change() is 'Impide que un usuario no-bibliotecario cambie rol/activo (evita auto-escalada de privilegios). F5.2, A01.';

drop trigger if exists profiles_guard_privilege on public.profiles;
create trigger profiles_guard_privilege
  before update on public.profiles
  for each row execute function public.prevent_self_privilege_change();
