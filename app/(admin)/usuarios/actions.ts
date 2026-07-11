"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import {
  getCurrentProfile,
  isCurrentUserLibrarian,
} from "@/lib/services/users";
import {
  adminCreateUser,
  adminUpdateUser,
  setUserActive,
  type UserMutationResult,
} from "@/lib/services/users-admin";
import {
  adminCreateUserSchema,
  adminEditUserSchema,
  type AdminCreateUserInput,
  type AdminEditUserInput,
} from "@/lib/validations/admin-users";

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

const DENIED = "No tienes permisos para esta acción.";
const INVALID = "Revisa los datos del formulario.";
const SELF = "No puedes desactivar ni cambiar el rol de tu propia cuenta.";

const REASON_TEXT: Record<string, string> = {
  "codigo-taken": "Ya existe un usuario con ese código universitario.",
  "correo-taken": "Ya existe un usuario con ese correo.",
  "not-found": "El usuario ya no existe.",
  error: "No se pudo guardar el usuario. Inténtalo de nuevo.",
};

const GENERIC = "No se pudo guardar el usuario. Inténtalo de nuevo.";
const NOT_FOUND = "El usuario ya no existe.";

function toActionResult(result: UserMutationResult): ActionResult {
  if (result.ok) return { ok: true, id: result.id };
  return { ok: false, error: REASON_TEXT[result.reason] ?? GENERIC };
}

function parseUserId(id: string): string | null {
  const r = z.string().uuid().safeParse(id);
  return r.success ? r.data : null;
}

/** Crea una cuenta (estudiante o bibliotecario). */
export async function adminCreateUserAction(
  input: AdminCreateUserInput,
): Promise<ActionResult> {
  if (!(await isCurrentUserLibrarian())) return { ok: false, error: DENIED };

  const parsed = adminCreateUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const result = await adminCreateUser(parsed.data);
  if (result.ok) revalidatePath("/usuarios");
  return toActionResult(result);
}

/** Edita contacto + rol + activación de un usuario. */
export async function adminUpdateUserAction(
  id: string,
  input: AdminEditUserInput,
): Promise<ActionResult> {
  const self = await getCurrentProfile();
  if (!self || self.rol !== "bibliotecario" || !self.activo) {
    return { ok: false, error: DENIED };
  }

  const userId = parseUserId(id);
  if (!userId) return { ok: false, error: NOT_FOUND };

  const parsed = adminEditUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  // Evita que el admin se auto-bloquee (desactivarse o dejar de ser bibliotecario).
  if (
    userId === self.id &&
    (!parsed.data.activo || parsed.data.rol !== "bibliotecario")
  ) {
    return { ok: false, error: SELF };
  }

  const result = await adminUpdateUser(userId, parsed.data);
  if (result.ok) {
    revalidatePath("/usuarios");
    revalidatePath(`/usuarios/${userId}`);
  }
  return toActionResult(result);
}

/** Activa/desactiva un usuario (baja lógica). No permite auto-desactivarse. */
export async function setUserActiveAction(
  id: string,
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const self = await getCurrentProfile();
  if (!self || self.rol !== "bibliotecario" || !self.activo) {
    return { ok: false, error: DENIED };
  }

  const userId = parseUserId(id);
  if (!userId) return { ok: false, error: NOT_FOUND };

  if (userId === self.id && !activo) return { ok: false, error: SELF };

  const result = await setUserActive(userId, activo);
  if (result.ok) revalidatePath("/usuarios");
  return { ok: result.ok, error: result.ok ? undefined : REASON_TEXT.error };
}
