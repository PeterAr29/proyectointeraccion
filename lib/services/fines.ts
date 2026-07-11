import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { daysBetween } from "@/lib/utils/dates";

/**
 * Servicio de multas (Módulo D): ÚNICA puerta a la tabla `fines`.
 * Regla de negocio (§7.2.4): multa = `dias_retraso × multa_diaria` (soles).
 * La GENERACIÓN de multas la hace el sistema, no el estudiante: la RLS de `fines`
 * solo permite escribir al bibliotecario, así que la creación/actualización usa
 * el cliente admin (service role, server-only). Las LECTURAS del propio usuario
 * van con su sesión (RLS `fines_select_own_or_librarian`). No se loggea PII.
 */

export type Fine = Database["public"]["Tables"]["fines"]["Row"];

// ---------------------------------------------------------------------------
// Lógica pura (sin BD): exportada aparte para testear el cálculo sin Supabase.
// ---------------------------------------------------------------------------

/**
 * Días de retraso de un préstamo: días completos entre su fecha de devolución
 * estimada y `now`. 0 si aún no ha vencido (hoy no cuenta como retraso).
 */
export function computeDaysOverdue(
  fechaDevolucionEstimada: string | Date,
  now: Date = new Date(),
): number {
  const dias = daysBetween(fechaDevolucionEstimada, now);
  return dias > 0 ? dias : 0;
}

/**
 * Monto de la multa = `dias_retraso × multa_diaria`, redondeado a 2 decimales
 * (moneda S/). Nunca negativo; los días fraccionarios se truncan.
 */
export function computeFineAmount(
  diasRetraso: number,
  multaDiaria: number,
): number {
  const dias = Math.max(0, Math.trunc(diasRetraso));
  const diaria = multaDiaria > 0 ? multaDiaria : 0;
  const raw = dias * diaria;
  return Math.round((raw + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Lectura (sesión del usuario; RLS acota a lo propio)
// ---------------------------------------------------------------------------

/**
 * Ids de préstamos del usuario con una multa PENDIENTE. Es el "checker" que
 * consume el Módulo C (§7.2.5: no renovar con multa pendiente): la vista de
 * "Mis préstamos" lo pasa a `canRenew`. La RPC `renew_loan` revalida en BD.
 */
export async function getPendingFineLoanIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select("loan_id")
    .eq("estado", "pendiente");
  if (error || !data) return [];
  return data.map((row) => row.loan_id);
}

/** Multas del usuario autenticado, de la más reciente a la más antigua (RLS). */
export async function listOwnFines(): Promise<Fine[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fines")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return null;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Generación (sistema; cliente admin, ignora RLS)
// ---------------------------------------------------------------------------

/**
 * Asegura la multa de un préstamo vencido (buscar-o-crear/actualizar):
 * - Si el préstamo no está vencido (o ya se devolvió), no hace nada → `null`.
 * - Si está vencido, marca el préstamo como `vencido` (persiste el estado que la
 *   UI ya derivaba) y crea/actualiza su multa `pendiente` con el monto vigente.
 * - Si la multa ya está `pagada`, la respeta (no la "resucita").
 * Usa el cliente admin porque el estudiante no puede escribir en `fines`/marcar
 * vencidos (RLS). Devuelve la multa vigente del préstamo, o `null` si no aplica.
 */
export async function syncFineForLoan(
  loanId: string,
  multaDiaria: number,
  now: Date = new Date(),
): Promise<Fine | null> {
  const admin = createAdminClient();

  const { data: loan } = await admin
    .from("loans")
    .select(
      "id, user_id, estado, fecha_devolucion_estimada, fecha_devolucion_real",
    )
    .eq("id", loanId)
    .maybeSingle();
  if (!loan || loan.fecha_devolucion_real) return null;

  const dias = computeDaysOverdue(loan.fecha_devolucion_estimada, now);
  if (dias <= 0) return null;

  const monto = computeFineAmount(dias, multaDiaria);

  if (loan.estado !== "vencido") {
    await admin.from("loans").update({ estado: "vencido" }).eq("id", loanId);
  }

  const { data: existing } = await admin
    .from("fines")
    .select("*")
    .eq("loan_id", loanId)
    .maybeSingle();

  if (existing) {
    if (existing.estado === "pagada") return existing;
    const { data: updated } = await admin
      .from("fines")
      .update({ dias_retraso: dias, monto })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    return updated ?? existing;
  }

  const { data: created } = await admin
    .from("fines")
    .insert({
      loan_id: loanId,
      user_id: loan.user_id,
      dias_retraso: dias,
      monto,
      estado: "pendiente",
    })
    .select("*")
    .maybeSingle();
  return created ?? null;
}

/**
 * Sincroniza las multas de los préstamos vencidos del usuario autenticado.
 * Lee sus préstamos con la sesión (RLS: solo los suyos), detecta los vencidos y
 * asegura su multa. Idempotente. Lo invoca la vista de "Mis préstamos" para que
 * el checker de renovación refleje la realidad.
 */
export async function syncOwnOverdueFines(
  multaDiaria: number,
  now: Date = new Date(),
): Promise<void> {
  const supabase = await createClient();
  const { data: loans, error } = await supabase
    .from("loans")
    .select("id, fecha_devolucion_estimada, fecha_devolucion_real")
    .is("fecha_devolucion_real", null);
  if (error || !loans) return;

  const overdue = loans.filter(
    (loan) => computeDaysOverdue(loan.fecha_devolucion_estimada, now) > 0,
  );
  await Promise.all(
    overdue.map((loan) => syncFineForLoan(loan.id, multaDiaria, now)),
  );
}

// ---------------------------------------------------------------------------
// Pago (lo registra el bibliotecario en F5.3; aquí queda la función lista)
// ---------------------------------------------------------------------------

/**
 * Marca una multa como `pagada`. Operación del bibliotecario: la RLS
 * (`fines_update_librarian`) garantiza que solo un bibliotecario la efectúe;
 * F5.3 la invoca revalidando el rol en el servidor. El estudiante solo lee.
 */
export async function markFinePaid(fineId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fines")
    .update({ estado: "pagada" })
    .eq("id", fineId);
  return { ok: !error };
}
