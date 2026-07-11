import { createClient } from "@/lib/supabase/server";
import type { Database, LoanStatus } from "@/lib/supabase/database.types";
import { daysBetween, isPastDate, toDate } from "@/lib/utils/dates";
import type { HistoryEstado } from "@/lib/validations/circulation";

/**
 * Servicio de préstamos (Módulo C): ÚNICA puerta a la tabla `loans`.
 * La lógica de negocio (validar stock, calcular fecha de devolución, decrementar
 * disponibilidad de forma atómica) vive en las RPC de Postgres (`create_loan`,
 * `return_loan`, `renew_loan`), no en la UI: es la única forma de garantizar
 * atomicidad frente a operaciones concurrentes (§2.3) y de sortear la RLS que
 * impide al estudiante tocar `books`.
 */

export type Loan = Database["public"]["Tables"]["loans"]["Row"];
type Book = Database["public"]["Tables"]["books"]["Row"];

/** Datos mínimos del libro que necesita la tabla de préstamos. */
export type LoanBook = Pick<Book, "id" | "titulo" | "autor">;

/** Un préstamo junto con su libro (o `null` si el libro ya no existe). */
export interface LoanWithBook {
  loan: Loan;
  book: LoanBook | null;
}

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

/**
 * Estado EFECTIVO de un préstamo para mostrar en la UI (metáfora del semáforo):
 * - devuelto: ya tiene fecha de devolución real.
 * - vencido: sigue activo y su fecha estimada quedó en el pasado (§7.2.3).
 * - activo: en curso y dentro de plazo (hoy aún cuenta como en plazo).
 * Se deriva en lectura para no depender de un `estado` persistido que podría
 * quedar desactualizado; D (F4.1) usa la misma regla al generar multas.
 */
export function effectiveLoanStatus(
  loan: Pick<Loan, "fecha_devolucion_real" | "fecha_devolucion_estimada">,
): LoanStatus {
  if (loan.fecha_devolucion_real) return "devuelto";
  if (isPastDate(loan.fecha_devolucion_estimada)) return "vencido";
  return "activo";
}

/** Motivo por el que un préstamo no puede renovarse (para tooltip/UI). */
export type RenewBlockReason = "returned" | "limit-reached" | "pending-fine";

/**
 * ¿Se puede renovar? (regla §7.2.5). No se puede si ya se devolvió, si alcanzó el
 * máximo de renovaciones, o si tiene una multa pendiente. La UI usa esto para
 * habilitar/deshabilitar el botón; la RPC `renew_loan` revalida lo mismo en BD.
 */
export function canRenew(
  loan: Pick<Loan, "fecha_devolucion_real" | "renovaciones">,
  maxRenovaciones: number,
  hasPendingFine: boolean,
): { allowed: boolean; reason: RenewBlockReason | null } {
  if (loan.fecha_devolucion_real) return { allowed: false, reason: "returned" };
  if (hasPendingFine) return { allowed: false, reason: "pending-fine" };
  if (loan.renovaciones >= maxRenovaciones) {
    return { allowed: false, reason: "limit-reached" };
  }
  return { allowed: true, reason: null };
}

/** Une cada préstamo con su libro (por id). Pura y testeable sin BD. */
export function mergeLoansWithBooks(
  loans: Loan[],
  books: LoanBook[],
): LoanWithBook[] {
  const byId = new Map(books.map((book) => [book.id, book]));
  return loans.map((loan) => ({
    loan,
    book: byId.get(loan.book_id) ?? null,
  }));
}

/** Tamaño de página del historial de préstamos (F3.3). */
export const HISTORY_PAGE_SIZE = 10;

/**
 * Filtra el historial por estado EFECTIVO y rango de fechas de préstamo.
 * El estado se compara con `effectiveLoanStatus` (no con el `estado` crudo) para
 * que el filtro coincida con lo que ve el usuario en la insignia. Fechas
 * comparadas por día completo; una fecha inválida en el filtro se ignora.
 */
export function filterLoanHistory(
  items: LoanWithBook[],
  filters: { estado: HistoryEstado; desde: string; hasta: string },
): LoanWithBook[] {
  const desde = toDate(filters.desde);
  const hasta = toDate(filters.hasta);
  return items.filter(({ loan }) => {
    if (
      filters.estado !== "todos" &&
      effectiveLoanStatus(loan) !== filters.estado
    ) {
      return false;
    }
    if (desde && daysBetween(desde, loan.fecha_prestamo) < 0) return false;
    if (hasta && daysBetween(loan.fecha_prestamo, hasta) < 0) return false;
    return true;
  });
}

export interface Paged<T> {
  items: T[];
  /** Página acotada al rango válido [1, totalPages]. */
  page: number;
  totalPages: number;
  total: number;
}

/** Pagina en memoria una lista ya filtrada, acotando la página al total real. */
export function paginateList<T>(
  items: T[],
  page: number,
  pageSize: number = HISTORY_PAGE_SIZE,
): Paged<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (clamped - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: clamped,
    totalPages,
    total,
  };
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

/** Motivo por el que renovar/devolver falló (para mensajes en la UI). */
export type RenewFailureReason =
  | "not-renewable" // BT100: inexistente, ajeno o ya devuelto
  | "limit-reached" // BT101: máximo de renovaciones
  | "pending-fine" // BT102: multa pendiente
  | "no-session" // BT000
  | "error";
export type ReturnFailureReason =
  | "not-returnable" // BT200: inexistente, ajeno o ya devuelto
  | "no-session" // BT000
  | "error";

export function mapRenewError(code: string | undefined): RenewFailureReason {
  switch (code) {
    case "BT100":
      return "not-renewable";
    case "BT101":
      return "limit-reached";
    case "BT102":
      return "pending-fine";
    case "BT000":
      return "no-session";
    default:
      return "error";
  }
}

export function mapReturnError(code: string | undefined): ReturnFailureReason {
  switch (code) {
    case "BT200":
      return "not-returnable";
    case "BT000":
      return "no-session";
    default:
      return "error";
  }
}

export type RenewResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: RenewFailureReason };
export type ReturnResult =
  | { ok: true; loan: Loan }
  | { ok: false; reason: ReturnFailureReason };

// ---------------------------------------------------------------------------
// Acceso a datos: listado, renovación, devolución
// ---------------------------------------------------------------------------

/**
 * Préstamos del usuario autenticado junto con su libro (RLS: solo los suyos).
 * `includeReturned=false` (por defecto) trae solo los que no están devueltos
 * (activos y vencidos) para "Mis préstamos"; `true` trae todo para el historial.
 * Dos pasos (loans → books por id) por la misma razón que en `books.listFavorites`
 * (los tipos escritos a mano no infieren joins embebidos de PostgREST).
 * Devuelve `null` ante error (→ ErrorState); `[]` cuando no hay préstamos.
 */
export async function listOwnLoansWithBooks(
  includeReturned = false,
): Promise<LoanWithBook[] | null> {
  const supabase = await createClient();
  let query = supabase
    .from("loans")
    .select("*")
    .order("fecha_prestamo", { ascending: false });
  if (!includeReturned) query = query.neq("estado", "devuelto");

  const { data: loans, error } = await query;
  if (error) return null;
  if (!loans || loans.length === 0) return [];

  const bookIds = [...new Set(loans.map((loan) => loan.book_id))];
  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("id, titulo, autor")
    .in("id", bookIds);
  if (booksError) return null;

  return mergeLoansWithBooks(loans, books ?? []);
}

/** Renueva un préstamo del usuario. Delega en la RPC atómica `renew_loan`. */
export async function renewLoan(loanId: string): Promise<RenewResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("renew_loan", {
    p_loan_id: loanId,
  });
  if (error) return { ok: false, reason: mapRenewError(error.code) };
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, loan: data };
}

/** Devuelve un préstamo del usuario y repone el stock (RPC `return_loan`). */
export async function returnLoan(loanId: string): Promise<ReturnResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("return_loan", {
    p_loan_id: loanId,
  });
  if (error) return { ok: false, reason: mapReturnError(error.code) };
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, loan: data };
}
