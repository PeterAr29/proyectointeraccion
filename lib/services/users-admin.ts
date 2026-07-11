import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/services/users";
import type {
  AdminCreateUserInput,
  AdminEditUserInput,
} from "@/lib/validations/admin-users";

/**
 * Gestión de usuarios por el bibliotecario (Módulo E, F5.2). Parte del módulo A
 * (dominio `profiles`); se separa de `users.ts` por tamaño. La LECTURA y la
 * edición de perfil van con la sesión del bibliotecario (RLS
 * `profiles_*_own_or_librarian`). El ALTA usa el cliente admin porque crea la
 * cuenta de Auth (ocurre a nivel de plataforma). Nunca se BORRA en duro: los
 * usuarios se desactivan (`activo=false`) para conservar su historial.
 */

export type UserMutationError =
  | "codigo-taken"
  | "correo-taken"
  | "not-found"
  | "error";

export type UserMutationResult =
  | { ok: true; id: string }
  | { ok: false; reason: UserMutationError };

// ---------------------------------------------------------------------------
// Lectura (RLS: el bibliotecario ve todos los perfiles)
// ---------------------------------------------------------------------------

/** Todos los usuarios, por nombre. `null` ante error (→ ErrorState). */
export async function listUsers(): Promise<Profile[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) return null;
  return data ?? [];
}

/** Un usuario por id (RLS: el bibliotecario ve cualquiera). */
export async function getUserById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Alta (cliente admin: crea la cuenta de Auth + su perfil con el rol elegido)
// ---------------------------------------------------------------------------

/**
 * Crea una cuenta (estudiante o bibliotecario). Comprueba unicidad de código y
 * correo antes de tocar Auth; si falla el perfil, revierte el usuario de Auth
 * para no dejarlo huérfano (misma compensación que `createStudentAccount`).
 */
export async function adminCreateUser(
  input: AdminCreateUserInput,
): Promise<UserMutationResult> {
  const admin = createAdminClient();

  const { data: dupCodigo } = await admin
    .from("profiles")
    .select("id")
    .eq("codigo_universitario", input.codigo)
    .maybeSingle();
  if (dupCodigo) return { ok: false, reason: "codigo-taken" };

  const { data: dupCorreo } = await admin
    .from("profiles")
    .select("id")
    .eq("correo", input.correo)
    .maybeSingle();
  if (dupCorreo) return { ok: false, reason: "correo-taken" };

  const { data: created, error: authError } = await admin.auth.admin.createUser(
    {
      email: input.correo,
      password: input.password,
      email_confirm: true,
    },
  );
  if (authError || !created.user) return { ok: false, reason: "error" };

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    codigo_universitario: input.codigo,
    nombre: input.nombre,
    carrera: input.carrera ? input.carrera : null,
    correo: input.correo,
    telefono: input.telefono ? input.telefono : null,
    rol: input.rol,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, reason: "error" };
  }

  return { ok: true, id: created.user.id };
}

// ---------------------------------------------------------------------------
// Edición y activación (sesión del bibliotecario; RLS)
// ---------------------------------------------------------------------------

/** Edita contacto + rol + activación de un usuario (no toca correo/código). */
export async function adminUpdateUser(
  id: string,
  input: AdminEditUserInput,
): Promise<UserMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nombre: input.nombre,
      carrera: input.carrera ? input.carrera : null,
      telefono: input.telefono ? input.telefono : null,
      rol: input.rol,
      activo: input.activo,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, reason: "error" };
  if (!data) return { ok: false, reason: "not-found" };
  return { ok: true, id: data.id };
}

/** Activa/desactiva un usuario (baja lógica; conserva su historial). */
export async function setUserActive(
  id: string,
  activo: boolean,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ activo })
    .eq("id", id);
  return { ok: !error };
}
