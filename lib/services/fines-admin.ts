import { createClient } from "@/lib/supabase/server";
import type { Fine } from "@/lib/services/fines";
import type { LoanWithBook } from "@/lib/services/loans";

/**
 * Multas desde ADMINISTRACIÓN (Módulo E, F5.3). Parte del módulo D; se separa de
 * `fines.ts` por tamaño. El bibliotecario ve TODAS las multas (RLS
 * `fines_select_own_or_librarian`). El pago se registra con `fines.markFinePaid`
 * (RLS `fines_update_librarian`). La vista cruza cada multa con su libro (a
 * través del préstamo) y el nombre del usuario.
 */

/** Fila de multa lista para la tabla de admin. */
export interface AdminFineRow {
  id: string;
  userName: string;
  bookTitle: string;
  monto: number;
  diasRetraso: number;
  estado: Fine["estado"];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Lógica pura (sin BD)
// ---------------------------------------------------------------------------

/**
 * Cruza cada multa con el libro de su préstamo y el nombre del usuario. Pura y
 * testeable: recibe los préstamos (con libro) y los perfiles ya cargados.
 */
export function buildAdminFineRows(
  fines: Fine[],
  loans: LoanWithBook[],
  profiles: { id: string; nombre: string }[],
): AdminFineRow[] {
  const titleByLoanId = new Map(
    loans.map(({ loan, book }) => [
      loan.id,
      book?.titulo ?? "Libro no disponible",
    ]),
  );
  const nameById = new Map(profiles.map((p) => [p.id, p.nombre]));
  return fines.map((fine) => ({
    id: fine.id,
    userName: nameById.get(fine.user_id) ?? "Usuario desconocido",
    bookTitle: titleByLoanId.get(fine.loan_id) ?? "Libro no disponible",
    monto: fine.monto,
    diasRetraso: fine.dias_retraso,
    estado: fine.estado,
    createdAt: fine.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Lectura (admin: todas las multas)
// ---------------------------------------------------------------------------

/** Todas las multas, de la más reciente a la más antigua. `null` ante error. */
export async function listAllFines(): Promise<Fine[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return null;
  return data ?? [];
}
