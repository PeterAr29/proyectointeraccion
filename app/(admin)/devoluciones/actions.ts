"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { isCurrentUserLibrarian } from "@/lib/services/users";
import { registerReturn } from "@/lib/services/loans-admin";

type ReturnActionResult =
  | { ok: true; fineAmount: number | null }
  | { ok: false; error: string };

const GENERIC = "No se pudo registrar la devolución. Inténtalo de nuevo.";
const REASON_TEXT: Record<string, string> = {
  "not-returnable": "Este préstamo ya no puede devolverse.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: GENERIC,
};

/**
 * Registra la devolución de un préstamo (cualquier usuario). Revalida el rol en
 * el servidor. La orquestación multa→devolución vive en `loans-admin.registerReturn`.
 */
export async function registerReturnAction(
  loanId: string,
): Promise<ReturnActionResult> {
  if (!(await isCurrentUserLibrarian())) {
    return { ok: false, error: "No tienes permisos para esta acción." };
  }

  const parsed = z.string().uuid().safeParse(loanId);
  if (!parsed.success) {
    return { ok: false, error: "Préstamo inválido." };
  }

  const result = await registerReturn(parsed.data);
  if (!result.ok) {
    return { ok: false, error: REASON_TEXT[result.reason] ?? GENERIC };
  }

  // Confirmar repone stock: refresca devoluciones, préstamos, multas y catálogo.
  revalidatePath("/devoluciones");
  revalidatePath("/prestamos");
  revalidatePath("/multas");
  revalidatePath("/catalogo");
  return { ok: true, fineAmount: result.fineAmount };
}
