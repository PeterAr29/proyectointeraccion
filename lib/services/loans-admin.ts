import { createClient } from "@/lib/supabase/server";
import type { LoanStatus } from "@/lib/supabase/database.types";
import {
  effectiveLoanStatus,
  mergeLoansWithBooks,
  returnLoan,
  type LoanWithBook,
  type ReturnFailureReason,
} from "@/lib/services/loans";
import {
  computeDaysOverdue,
  computeFineAmount,
  syncFineForLoan,
} from "@/lib/services/fines";
import { getCirculationSettings } from "@/lib/services/settings";

/**
 * Circulación desde ADMINISTRACIÓN (Módulo E, F5.3). Parte del módulo C; se
 * separa de `loans.ts` por tamaño. El bibliotecario ve TODOS los préstamos (RLS
 * `loans_select_own_or_librarian` vía `is_librarian()`) y registra devoluciones
 * de cualquier usuario (la RPC `return_loan` acepta owner o bibliotecario). La
 * devolución integra el cálculo de multa (Módulo D) antes de reponer el stock.
 */

/** Fila de préstamo lista para las tablas de admin (préstamos/devoluciones). */
export interface AdminLoanRow {
  id: string;
  bookTitle: string;
  userName: string;
  fechaPrestamo: string;
  fechaDevolucionEstimada: string;
  fechaDevolucionReal: string | null;
  estado: LoanStatus;
  renovaciones: number;
}

// ---------------------------------------------------------------------------
// Lógica pura (sin BD)
// ---------------------------------------------------------------------------

/** Cruza préstamos (con libro) con el nombre del usuario. Pura y testeable. */
export function buildAdminLoanRows(
  items: LoanWithBook[],
  profiles: { id: string; nombre: string }[],
): AdminLoanRow[] {
  const nameById = new Map(profiles.map((p) => [p.id, p.nombre]));
  return items.map(({ loan, book }) => ({
    id: loan.id,
    bookTitle: book?.titulo ?? "Libro no disponible",
    userName: nameById.get(loan.user_id) ?? "Usuario desconocido",
    fechaPrestamo: loan.fecha_prestamo,
    fechaDevolucionEstimada: loan.fecha_devolucion_estimada,
    fechaDevolucionReal: loan.fecha_devolucion_real,
    estado: effectiveLoanStatus(loan),
    renovaciones: loan.renovaciones,
  }));
}

/**
 * Estima la multa que generaría devolver hoy un préstamo (para el diálogo de
 * confirmación). Pura: replica la regla §7.2.4 sin tocar la BD.
 */
export function estimateReturnFine(
  fechaDevolucionEstimada: string,
  multaDiaria: number,
  now: Date = new Date(),
): { dias: number; monto: number } {
  const dias = computeDaysOverdue(fechaDevolucionEstimada, now);
  return { dias, monto: computeFineAmount(dias, multaDiaria) };
}

/** Fila para la vista de devoluciones (préstamos pendientes de devolver). */
export interface ReturnRow {
  id: string;
  bookTitle: string;
  userName: string;
  fechaDevolucionEstimada: string;
  estado: LoanStatus;
  /** Días de retraso a hoy (0 si aún en plazo). */
  overdueDays: number;
  /** Multa que se generaría al devolver hoy (0 si no hay retraso). */
  estimatedFine: number;
}

/**
 * Filas de devolución: solo préstamos NO devueltos, con la multa estimada a hoy.
 * Pura y testeable (recibe préstamos, perfiles y la multa diaria vigente).
 */
export function buildReturnRows(
  items: LoanWithBook[],
  profiles: { id: string; nombre: string }[],
  multaDiaria: number,
  now: Date = new Date(),
): ReturnRow[] {
  const nameById = new Map(profiles.map((p) => [p.id, p.nombre]));
  return items
    .filter(({ loan }) => !loan.fecha_devolucion_real)
    .map(({ loan, book }) => {
      const { dias, monto } = estimateReturnFine(
        loan.fecha_devolucion_estimada,
        multaDiaria,
        now,
      );
      return {
        id: loan.id,
        bookTitle: book?.titulo ?? "Libro no disponible",
        userName: nameById.get(loan.user_id) ?? "Usuario desconocido",
        fechaDevolucionEstimada: loan.fecha_devolucion_estimada,
        estado: effectiveLoanStatus(loan),
        overdueDays: dias,
        estimatedFine: monto,
      };
    });
}

// ---------------------------------------------------------------------------
// Lectura (admin: todos los préstamos)
// ---------------------------------------------------------------------------

/** Une una lista de préstamos con sus libros (dos pasos, como en `loans.ts`). */
async function attachBooks(
  loans: LoanWithBook["loan"][],
): Promise<LoanWithBook[] | null> {
  if (loans.length === 0) return [];
  const supabase = await createClient();
  const bookIds = [...new Set(loans.map((loan) => loan.book_id))];
  const { data: books, error } = await supabase
    .from("books")
    .select("id, titulo, autor")
    .in("id", bookIds);
  if (error) return null;
  return mergeLoansWithBooks(loans, books ?? []);
}

/** Todos los préstamos con su libro, del más reciente al más antiguo. */
export async function listAllLoansWithBooks(): Promise<LoanWithBook[] | null> {
  const supabase = await createClient();
  const { data: loans, error } = await supabase
    .from("loans")
    .select("*")
    .order("fecha_prestamo", { ascending: false });
  if (error) return null;
  return attachBooks(loans ?? []);
}

/** Préstamos (con libro) para un conjunto de ids (para la vista de multas). */
export async function getLoansWithBooksByIds(
  ids: string[],
): Promise<LoanWithBook[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data: loans, error } = await supabase
    .from("loans")
    .select("*")
    .in("id", ids);
  if (error || !loans) return [];
  return (await attachBooks(loans)) ?? [];
}

// ---------------------------------------------------------------------------
// Devolución integrada con multa (orquesta C + D)
// ---------------------------------------------------------------------------

export type AdminReturnResult =
  | { ok: true; fineAmount: number | null }
  | { ok: false; reason: ReturnFailureReason };

/**
 * Registra la devolución de un préstamo (cualquier usuario). Si está vencido,
 * primero asegura la multa (`syncFineForLoan`, Módulo D) para congelar los días
 * de retraso ANTES de marcar la devolución; luego devuelve y repone el stock
 * (`return_loan`). Devuelve el monto de la multa generada, o `null` si no hubo.
 */
export async function registerReturn(
  loanId: string,
): Promise<AdminReturnResult> {
  const settings = await getCirculationSettings();
  const fine = await syncFineForLoan(loanId, settings.multaDiaria);
  const result = await returnLoan(loanId);
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true, fineAmount: fine?.monto ?? null };
}
