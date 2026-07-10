import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, UserRole } from "@/lib/supabase/database.types";
import type { UpdateProfileInput } from "@/lib/validations/auth";

/**
 * Servicio de usuarios: ÚNICA puerta a la tabla `profiles`.
 * - Lecturas/escrituras del propio perfil van con la sesión del usuario (RLS
 *   garantiza que solo accede a lo suyo).
 * - Las operaciones de plataforma (resolver correo por código, crear cuenta)
 *   usan el cliente admin porque ocurren ANTES de haber sesión; están acotadas
 *   a lo mínimo y nunca devuelven datos de dominio de terceros.
 */

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Perfil del usuario autenticado, o null si no hay sesión / no tiene perfil. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return data;
}

/** Actualiza el perfil del propio usuario (acceso/rectificación, Ley 29733). */
export async function updateOwnProfile(
  input: UpdateProfileInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No hay una sesión activa." };

  const { error } = await supabase
    .from("profiles")
    .update({
      nombre: input.nombre,
      carrera: input.carrera ? input.carrera : null,
      correo: input.correo,
      telefono: input.telefono ? input.telefono : null,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "No se pudo actualizar tu perfil." };
  }
  return { ok: true };
}

/**
 * Resuelve el correo y estado a partir del código universitario.
 * Solo para el login/recuperación (previo a la sesión). Devuelve null si no
 * existe, sin distinguir para no facilitar la enumeración de usuarios.
 */
export async function resolveAccountByCodigo(
  codigo: string,
): Promise<{ correo: string; activo: boolean } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("correo, activo")
    .eq("codigo_universitario", codigo)
    .maybeSingle();

  if (error || !data) return null;
  return { correo: data.correo, activo: data.activo };
}

/** True si el código universitario ya está registrado. */
export async function isCodigoTaken(codigo: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("codigo_universitario", codigo)
    .maybeSingle();
  return Boolean(data);
}

/** True si el correo ya está registrado en un perfil. */
export async function isCorreoTaken(correo: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("correo", correo)
    .maybeSingle();
  return Boolean(data);
}

export interface NewAccount {
  nombre: string;
  codigo: string;
  carrera?: string | null;
  correo: string;
  telefono?: string | null;
}

/**
 * Crea la cuenta de un estudiante: usuario de Auth (correo confirmado) + su
 * `profiles`. Rol forzado a `estudiante` (la promoción a bibliotecario es
 * administrativa, no autoservicio — especificaciones §2.2).
 */
export async function createStudentAccount(
  input: NewAccount,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createAdminClient();

  const { data: created, error: authError } = await admin.auth.admin.createUser(
    {
      email: input.correo,
      password,
      email_confirm: true,
    },
  );

  if (authError || !created.user) {
    return { ok: false, message: "No se pudo crear la cuenta de acceso." };
  }

  const rol: UserRole = "estudiante";
  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    codigo_universitario: input.codigo,
    nombre: input.nombre,
    carrera: input.carrera ? input.carrera : null,
    correo: input.correo,
    telefono: input.telefono ? input.telefono : null,
    rol,
  });

  if (profileError) {
    // Compensación: si falla el perfil, no dejar un usuario de Auth huérfano.
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, message: "No se pudo registrar el perfil." };
  }

  return { ok: true };
}
