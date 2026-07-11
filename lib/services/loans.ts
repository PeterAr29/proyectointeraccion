import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Servicio de préstamos (Módulo C): ÚNICA puerta a la tabla `loans`.
 * La lógica de negocio (validar stock, calcular fecha de devolución, decrementar
 * disponibilidad de forma atómica) vive en la RPC `create_loan` de Postgres, no
 * en la UI: es la única forma de garantizar atomicidad frente a préstamos
 * concurrentes (§2.3) y de sortear la RLS que impide al estudiante tocar `books`.
 */

export type Loan = Database["public"]["Tables"]["loans"]["Row"];

// ---------------------------------------------------------------------------
// Lógica pura (sin BD): exportada aparte para testear sin Supabase.
// ---------------------------------------------------------------------------

/**
 * Calcula la fecha de devolución estimada = `from` + `diasPrestamo` días.
 * La fuente de verdad del préstamo real es la RPC (usa `now()` del servidor);
 * esta función replica la regla para poder mostrarla y probarla de forma pura.
 */
export function computeDueDate(from: Date, diasPrestamo: number): Date {
  const due = new Date(from.getTime());
  due.setDate(due.getDate() + Math.trunc(diasPrestamo));
  return due;
}

/** Motivo por el que un préstamo no pudo registrarse (para mensajes en la UI). */
export type BorrowFailureReason =
  | "no-stock" // BT001: no quedan ejemplares (→ ofrecer reservar)
  | "already-loaned" // BT002: el usuario ya tiene este libro prestado
  | "not-found" // BT404: el libro no existe
  | "no-session" // BT000: sesión ausente
  | "error"; // cualquier otro fallo de BD

/** Traduce el SQLSTATE que devuelve la RPC a un motivo de negocio conocido. */
export function mapCreateLoanError(
  code: string | undefined,
): BorrowFailureReason {
  switch (code) {
    case "BT001":
      return "no-stock";
    case "BT002":
      return "already-loaned";
    case "BT404":
      return "not-found";
    case "BT000":
      return "no-session";
    default:
      return "error";
  }
}

export type BorrowResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: BorrowFailureReason };

// ---------------------------------------------------------------------------
// Acceso a datos
// ---------------------------------------------------------------------------

/**
 * Presta el libro `bookId` al usuario autenticado.
 * Delega en la RPC atómica `create_loan`; nunca decrementa el stock por su
 * cuenta. Devuelve un resultado tipado: `no-stock` es el caso esperado que la
 * UI convierte en la oferta de reservar (RF-C01).
 */
export async function borrowBook(bookId: string): Promise<BorrowResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_loan", {
    p_book_id: bookId,
  });

  if (error) return { ok: false, reason: mapCreateLoanError(error.code) };
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, loan: data };
}

/** Préstamos del usuario autenticado por estado (RLS garantiza que solo ve los suyos). */
export async function listOwnLoans(
  estado?: Loan["estado"],
): Promise<Loan[] | null> {
  const supabase = await createClient();
  let query = supabase
    .from("loans")
    .select("*")
    .order("fecha_prestamo", { ascending: false });
  if (estado) query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) return null;
  return data ?? [];
}
