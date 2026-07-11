"use server";

import { revalidatePath } from "next/cache";

import {
  renewLoan,
  returnLoan,
  type RenewFailureReason,
  type ReturnFailureReason,
} from "@/lib/services/loans";
import { parseLoanId } from "@/lib/validations/circulation";

/**
 * Server Actions de "Mis préstamos" (F3.2).
 * Revalidan el id de préstamo en el servidor (nunca confían en el cliente) y
 * delegan en la capa de servicios (RPC atómicas). Solo devuelven al cliente
 * datos serializables mínimos. Al mutar, revalidan las vistas afectadas.
 */

export type RenewActionResult =
  | { ok: true; fechaDevolucion: string }
  | { ok: false; reason: RenewFailureReason };

export async function renewAction(loanId: string): Promise<RenewActionResult> {
  const id = parseLoanId(loanId);
  if (!id) return { ok: false, reason: "not-renewable" };

  const result = await renewLoan(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath("/mis-prestamos");
  revalidatePath("/historial");
  return { ok: true, fechaDevolucion: result.loan.fecha_devolucion_estimada };
}

export type ReturnActionResult =
  | { ok: true }
  | { ok: false; reason: ReturnFailureReason };

export async function returnAction(
  loanId: string,
): Promise<ReturnActionResult> {
  const id = parseLoanId(loanId);
  if (!id) return { ok: false, reason: "not-returnable" };

  const result = await returnLoan(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  // La devolución repone stock: refresca préstamos, historial y catálogo.
  revalidatePath("/mis-prestamos");
  revalidatePath("/historial");
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${result.loan.book_id}`);
  return { ok: true };
}
