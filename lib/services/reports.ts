import type { Fine } from "@/lib/services/fines";
import type { LoanWithBook } from "@/lib/services/loans";
import { listAllLoansWithBooks } from "@/lib/services/loans-admin";
import { listAllFines } from "@/lib/services/fines-admin";

/**
 * Reportes de administración (Módulo E, F5.4). NO accede a ninguna tabla: compone
 * los reads de `loans-admin`/`fines-admin` y agrega los datos con funciones puras
 * (testeables). Los reportes son de solo lectura; la exportación a CSV la hace el
 * cliente con `lib/utils/csv`.
 */

export interface MonthCount {
  /** Mes en formato `YYYY-MM`. */
  month: string;
  count: number;
}
export interface BookCount {
  title: string;
  count: number;
}
export interface FinesSummary {
  countPendiente: number;
  montoPendiente: number;
  countPagada: number;
  montoPagada: number;
}

export interface ReportData {
  totalLoans: number;
  loansByMonth: MonthCount[];
  topBooks: BookCount[];
  fines: FinesSummary;
}

// ---------------------------------------------------------------------------
// Agregaciones puras (sin BD): exportadas para testear sin Supabase.
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Préstamos agrupados por mes (`YYYY-MM`) de la fecha de préstamo, ascendente. */
export function loansByMonth(items: LoanWithBook[]): MonthCount[] {
  const counts = new Map<string, number>();
  for (const { loan } of items) {
    const month = loan.fecha_prestamo.slice(0, 7); // "YYYY-MM"
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Libros más prestados (por título), del más prestado al menos, hasta `topN`. */
export function topBorrowedBooks(
  items: LoanWithBook[],
  topN = 10,
): BookCount[] {
  const counts = new Map<string, number>();
  for (const { book } of items) {
    const title = book?.titulo ?? "Libro no disponible";
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, topN);
}

/** Resumen de multas: cantidad y monto por estado (pendiente/pagada). */
export function summarizeFines(fines: Fine[]): FinesSummary {
  const summary: FinesSummary = {
    countPendiente: 0,
    montoPendiente: 0,
    countPagada: 0,
    montoPagada: 0,
  };
  for (const fine of fines) {
    if (fine.estado === "pagada") {
      summary.countPagada += 1;
      summary.montoPagada += fine.monto;
    } else {
      summary.countPendiente += 1;
      summary.montoPendiente += fine.monto;
    }
  }
  summary.montoPendiente = round2(summary.montoPendiente);
  summary.montoPagada = round2(summary.montoPagada);
  return summary;
}

// ---------------------------------------------------------------------------
// Composición (servidor)
// ---------------------------------------------------------------------------

/** Reúne los datos de todos los reportes. `null` si falla alguna lectura. */
export async function getReportData(): Promise<ReportData | null> {
  const [loans, fines] = await Promise.all([
    listAllLoansWithBooks(),
    listAllFines(),
  ]);
  if (loans === null || fines === null) return null;

  return {
    totalLoans: loans.length,
    loansByMonth: loansByMonth(loans),
    topBooks: topBorrowedBooks(loans),
    fines: summarizeFines(fines),
  };
}
