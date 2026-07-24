import { createClient } from "@/lib/supabase/server";
import {
  effectiveLoanStatus,
  mergeLoansWithBooks,
  returnLoan,
  type EffectiveLoanStatus,
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
 * `loans_select_own_or_librarian` vía `is_librarian()`) y CONFIRMA devoluciones
 * de cualquier usuario. Devolución en dos pasos: la RPC `return_loan` exige rol
 * bibliotecario (el estudiante solo puede SOLICITAR con `request_return`). La
 * confirmación integra el cálculo de multa (Módulo D) antes de reponer el stock.
 */

/** Fila de préstamo lista para las tablas de admin (préstamos/devoluciones). */
export interface AdminLoanRow {
  id: string;
  bookTitle: string;
  userName: string;
  fechaPrestamo: string;
  fechaDevolucionEstimada: string;
  fechaDevolucionReal: string | null;
  estado: EffectiveLoanStatus;
  renovaciones: number;
  /** El estudiante solicitó devolver y falta confirmar la recepción física. */
  devolucionSolicitada: boolean;
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
    devolucionSolicitada:
      Boolean(loan.devolucion_solicitada_en) && !loan.fecha_devolucion_real,
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
  estado: EffectiveLoanStatus;
  /** Días de retraso a hoy (0 si aún en plazo). */
  overdueDays: number;
  /** Multa que se generaría al devolver hoy (0 si no hay retraso). */
  estimatedFine: number;
  /** El estudiante ya solicitó la devolución (falta confirmar recepción física). */
  devolucionSolicitada: boolean;
  /** Cuándo se solicitó (null si es una devolución "walk-up" sin solicitud). */
  fechaSolicitud: string | null;
}

/**
 * Filas de devolución: solo préstamos NO devueltos, con la multa estimada a hoy.
 * Las devoluciones YA SOLICITADAS por el estudiante van primero (cola de
 * verificación); dentro de cada grupo, las más antiguas primero.
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
        devolucionSolicitada: Boolean(loan.devolucion_solicitada_en),
        fechaSolicitud: loan.devolucion_solicitada_en,
      };
    })
    .sort((a, b) => {
      // Solicitadas primero; luego por fecha de solicitud / vencimiento ascendente.
      if (a.devolucionSolicitada !== b.devolucionSolicitada) {
        return a.devolucionSolicitada ? -1 : 1;
      }
      const aKey = a.fechaSolicitud ?? a.fechaDevolucionEstimada;
      const bKey = b.fechaSolicitud ?? b.fechaDevolucionEstimada;
      return aKey.localeCompare(bKey);
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
