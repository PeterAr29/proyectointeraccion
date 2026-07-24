import { countBooks } from "@/lib/services/books";
import { countUsers, getProfilesByIds } from "@/lib/services/users";
import {
  countActiveLoans,
  effectiveLoanStatus,
  listRecentLoansWithBooks,
  type EffectiveLoanStatus,
  type LoanWithBook,
} from "@/lib/services/loans";
import { countPendingFines } from "@/lib/services/fines";

/**
 * Agregador del dashboard de administración (Módulo E, F5.1).
 * NO accede a ninguna tabla directamente: compone las funciones de los services
 * de cada módulo (books, users, loans, fines), que son la única puerta a sus
 * datos. Así respeta la frontera entre módulos. La autorización real la impone
 * la RLS (el bibliotecario ve todo) más el guard de rol del layout `(admin)`.
 */

/** Un KPI puede ser `null` si su consulta falló (la tarjeta muestra un guion). */
export interface DashboardKpis {
  totalBooks: number | null;
  totalUsers: number | null;
  activeLoans: number | null;
  pendingFines: number | null;
}

/** Fila lista para pintar en la tabla de préstamos recientes del dashboard. */
export interface RecentLoanRow {
  id: string;
  bookTitle: string;
  userName: string;
  fechaPrestamo: string;
  fechaDevolucionEstimada: string;
  /** Estado EFECTIVO (derivado de las fechas), coincide con la insignia. */
  estado: EffectiveLoanStatus;
}

export interface DashboardData {
  kpis: DashboardKpis;
  /** `null` si el listado falló (→ ErrorState en esa sección). */
  recentLoans: RecentLoanRow[] | null;
}

/** Cuántos préstamos recientes muestra el dashboard. */
export const RECENT_LOANS_LIMIT = 5;

// ---------------------------------------------------------------------------
// Lógica pura (sin BD): exportada aparte para testear la agregación.
// ---------------------------------------------------------------------------

/**
 * Cruza cada préstamo (con su libro) con el nombre de su usuario para armar las
 * filas de la tabla. Pura y testeable: no toca Supabase. Si falta el libro o el
 * perfil (borrado), degrada con un texto legible en lugar de romper.
 */
export function buildRecentLoanRows(
  items: LoanWithBook[],
  profiles: { id: string; nombre: string }[],
): RecentLoanRow[] {
  const nameById = new Map(profiles.map((p) => [p.id, p.nombre]));
  return items.map(({ loan, book }) => ({
    id: loan.id,
    bookTitle: book?.titulo ?? "Libro no disponible",
    userName: nameById.get(loan.user_id) ?? "Usuario desconocido",
    fechaPrestamo: loan.fecha_prestamo,
    fechaDevolucionEstimada: loan.fecha_devolucion_estimada,
    estado: effectiveLoanStatus(loan),
  }));
}

// ---------------------------------------------------------------------------
// Composición (servidor): reúne KPIs y préstamos recientes.
// ---------------------------------------------------------------------------

/**
 * Reúne todos los datos del dashboard. Lanza las cuatro consultas de KPI en
 * paralelo; los préstamos recientes se resuelven aparte porque necesitan un
 * segundo paso (nombres de usuario). Un KPI que falla queda en `null` sin tumbar
 * el resto de la vista.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [totalBooks, totalUsers, activeLoans, pendingFines, recent] =
    await Promise.all([
      countBooks(),
      countUsers(),
      countActiveLoans(),
      countPendingFines(),
      listRecentLoansWithBooks(RECENT_LOANS_LIMIT),
    ]);

  let recentLoans: RecentLoanRow[] | null;
  if (recent === null) {
    recentLoans = null;
  } else if (recent.length === 0) {
    recentLoans = [];
  } else {
    const userIds = [...new Set(recent.map((item) => item.loan.user_id))];
    const profiles = await getProfilesByIds(userIds);
    recentLoans = buildRecentLoanRows(recent, profiles);
  }

  return {
    kpis: { totalBooks, totalUsers, activeLoans, pendingFines },
    recentLoans,
  };
}
