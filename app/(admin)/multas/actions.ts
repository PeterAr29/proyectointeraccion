"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { isCurrentUserLibrarian } from "@/lib/services/users";
import { markFinePaid } from "@/lib/services/fines";

/**
 * Marca una multa como pagada (Módulo E, F5.3). Revalida el rol en servidor; la
 * escritura la permite la RLS `fines_update_librarian`. Solo bibliotecario.
 */
export async function markFinePaidAction(
  fineId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isCurrentUserLibrarian())) {
    return { ok: false, error: "No tienes permisos para esta acción." };
  }

  const parsed = z.string().uuid().safeParse(fineId);
  if (!parsed.success) return { ok: false, error: "Multa inválida." };

  const result = await markFinePaid(parsed.data);
  if (!result.ok) {
    return {
      ok: false,
      error: "No se pudo registrar el pago. Inténtalo de nuevo.",
    };
  }

  revalidatePath("/multas");
  return { ok: true };
}
