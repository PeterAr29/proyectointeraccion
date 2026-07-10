"use server";

import { revalidatePath } from "next/cache";

import { updateOwnProfile } from "@/lib/services/users";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/auth";

/**
 * Server Action para editar el propio perfil (derecho de rectificación,
 * Ley 29733). Revalida con Zod en servidor y delega en el service, que aplica
 * la escritura bajo RLS (solo la propia fila).
 */
export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los datos del formulario." };
  }

  const result = await updateOwnProfile(parsed.data);
  if (!result.ok) return { ok: false, error: result.message };

  revalidatePath("/perfil");
  return { ok: true };
}
