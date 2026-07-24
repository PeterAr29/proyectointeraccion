"use server";

import { revalidatePath } from "next/cache";

import {
  renewLoan,
  requestReturn,
  cancelReturnRequest,
  type RenewFailureReason,
  type RequestReturnFailureReason,
  type CancelReturnFailureReason,
} from "@/lib/services/loans";
import { parseLoanId } from "@/lib/validations/circulation";

/**
 * Server Actions de "Mis préstamos" (F3.2 + devolución en 2 pasos).
 * Revalidan el id de préstamo en el servidor (nunca confían en el cliente) y
 * delegan en la capa de servicios (RPC atómicas). Solo devuelven al cliente
 * datos serializables mínimos. Al mutar, revalidan las vistas afectadas.
 *
 * El estudiante ya NO cierra la devolución: solo la SOLICITA (o la cancela). El
 * bibliotecario la confirma en `/devoluciones`. Por eso estas acciones NO tocan
 * el stock ni revalidan el catálogo.
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

export type RequestReturnActionResult =
  | { ok: true }
  | { ok: false; reason: RequestReturnFailureReason };

export async function requestReturnAction(
  loanId: string,
): Promise<RequestReturnActionResult> {
  const id = parseLoanId(loanId);
  if (!id) return { ok: false, reason: "not-requestable" };

  const result = await requestReturn(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  // Marca intención: no repone stock (no se toca el catálogo).
  revalidatePath("/mis-prestamos");
  revalidatePath("/historial");
  return { ok: true };
}

export type CancelReturnActionResult =
  | { ok: true }
  | { ok: false; reason: CancelReturnFailureReason };

export async function cancelReturnAction(
  loanId: string,
): Promise<CancelReturnActionResult> {
  const id = parseLoanId(loanId);
  if (!id) return { ok: false, reason: "not-cancelable" };

  const result = await cancelReturnRequest(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath("/mis-prestamos");
  revalidatePath("/historial");
  return { ok: true };
}
