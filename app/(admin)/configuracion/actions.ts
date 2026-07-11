"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserLibrarian } from "@/lib/services/users";
import { updateCirculationSettings } from "@/lib/services/settings";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

/**
 * Guarda la configuración de circulación (Módulo E, F5.4). Revalida el rol en
 * servidor; la escritura la permite la RLS `settings_update_librarian`. Los
 * cambios afectan a los préstamos nuevos, no a los ya emitidos.
 */
export async function updateSettingsAction(
  input: SettingsInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isCurrentUserLibrarian())) {
    return { ok: false, error: "No tienes permisos para esta acción." };
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los valores del formulario." };
  }

  const result = await updateCirculationSettings({
    diasPrestamo: parsed.data.diasPrestamo,
    multaDiaria: parsed.data.multaDiaria,
    maxRenovaciones: parsed.data.maxRenovaciones,
  });
  if (!result.ok) {
    return { ok: false, error: "No se pudo guardar la configuración." };
  }

  revalidatePath("/configuracion");
  return { ok: true };
}
