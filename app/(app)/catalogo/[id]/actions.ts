"use server";

import { revalidatePath } from "next/cache";

import { borrowBook, type BorrowFailureReason } from "@/lib/services/loans";
import {
  reserveBook,
  type ReserveFailureReason,
} from "@/lib/services/reservations";
import { parseBookId } from "@/lib/validations/circulation";

/**
 * Server Actions de circulación (F3.1).
 * Revalidan el id en el servidor (nunca confían en el cliente) y delegan en la
 * capa de servicios, donde vive la lógica transaccional. La autorización real la
 * dan la sesión y la RPC (`auth.uid()`), no la UI. Solo devuelven al cliente
 * datos serializables mínimos (la fecha de devolución), no la fila completa.
 */

export type BorrowActionResult =
  | { ok: true; fechaDevolucion: string }
  | { ok: false; reason: BorrowFailureReason };

export async function borrowAction(
  bookId: string,
): Promise<BorrowActionResult> {
  const id = parseBookId(bookId);
  if (!id) return { ok: false, reason: "not-found" };

  const result = await borrowBook(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  // El stock cambió: refresca detalle, catálogo y "mis préstamos".
  revalidatePath(`/catalogo/${id}`);
  revalidatePath("/catalogo");
  revalidatePath("/mis-prestamos");
  return { ok: true, fechaDevolucion: result.loan.fecha_devolucion_estimada };
}

export type ReserveActionResult =
  | { ok: true; fechaEstimada: string | null }
  | { ok: false; reason: ReserveFailureReason };

export async function reserveAction(
  bookId: string,
): Promise<ReserveActionResult> {
  const id = parseBookId(bookId);
  if (!id) return { ok: false, reason: "not-found" };

  const result = await reserveBook(id);
  if (!result.ok) return { ok: false, reason: result.reason };

  revalidatePath(`/catalogo/${id}`);
  revalidatePath("/catalogo");
  return {
    ok: true,
    fechaEstimada: result.reservation.fecha_estimada_disponibilidad,
  };
}
