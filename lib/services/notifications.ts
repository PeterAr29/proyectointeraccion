import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, NotificationType } from "@/lib/supabase/database.types";
import { daysBetween, formatDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/currency";

/**
 * Servicio de notificaciones (Módulo D): ÚNICA puerta a la tabla `notifications`.
 * Genera avisos in-app de tres tipos (§F4.2):
 *   · multa_generada      — al crear una multa (lo dispara fines.ts).
 *   · vencimiento_proximo — préstamo por vencer dentro de N días.
 *   · reserva_disponible  — libro reservado que vuelve a tener stock.
 * La GENERACIÓN la hace el sistema, no el estudiante: la RLS de `notifications`
 * solo deja INSERT al bibliotecario, así que la creación usa el cliente admin
 * (service role, server-only). Las LECTURAS y el "marcar leída" van con la sesión
 * del usuario (RLS `notifications_*_own_or_librarian`). No se loggea PII.
 *
 * Los barridos (`sync*`) corren en el render de la vista, como el de multas de
 * F4.1: son idempotentes gracias a los marcadores de las filas origen
 * (loans.vencimiento_notificado_en, reservations.notificada_disponible_en).
 * En producción convendría moverlos a un job programado (deuda anotada).
 */

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

/** Días de antelación con que se avisa el vencimiento de un préstamo. */
export const DUE_SOON_THRESHOLD_DAYS = 3;

// ---------------------------------------------------------------------------
// Lógica pura (sin BD): mensajes y selección. Exportada aparte para testear.
// ---------------------------------------------------------------------------

/** Mensaje del aviso de multa recién generada (monto en soles). */
export function fineGeneratedMessage(titulo: string, monto: number): string {
  return `Se generó una multa de ${formatCurrency(monto)} por el retraso en la devolución de «${titulo}».`;
}

/** Mensaje del aviso de préstamo por vencer. */
export function dueSoonMessage(
  titulo: string,
  fechaEstimada: string | Date,
): string {
  return `El préstamo de «${titulo}» vence el ${formatDate(fechaEstimada)}. Renuévalo o devuélvelo a tiempo para evitar una multa.`;
}

/** Mensaje del aviso de reserva disponible. */
export function reservationAvailableMessage(titulo: string): string {
  return `El libro «${titulo}» que reservaste ya está disponible. Pásalo a préstamo antes de que se agote.`;
}

/** Número de notificaciones sin leer. Pura y testeable. */
export function unreadCount(items: Pick<Notification, "leida">[]): number {
  return items.reduce((total, n) => (n.leida ? total : total + 1), 0);
}

/** Préstamo mínimo para decidir si toca avisar de su vencimiento próximo. */
export interface DueSoonCandidate {
  fecha_devolucion_real: string | null;
  fecha_devolucion_estimada: string | Date;
  vencimiento_notificado_en: string | null;
}

/**
 * ¿Toca avisar del vencimiento de este préstamo? Sí cuando sigue activo (sin
 * devolución), no se avisó todavía y su fecha estimada cae dentro de la ventana
 * [hoy, hoy + `threshold`] (aún no vencido; el retraso ya lo cubre la multa).
 */
export function isDueSoon(
  loan: DueSoonCandidate,
  now: Date = new Date(),
  threshold: number = DUE_SOON_THRESHOLD_DAYS,
): boolean {
  if (loan.fecha_devolucion_real || loan.vencimiento_notificado_en) {
    return false;
  }
  const dias = daysBetween(now, loan.fecha_devolucion_estimada);
  return dias >= 0 && dias <= threshold;
}

// ---------------------------------------------------------------------------
// Lectura (sesión del usuario; RLS acota a lo propio)
// ---------------------------------------------------------------------------

/** Notificaciones del usuario, de la más reciente a la más antigua (RLS). */
export async function listOwnNotifications(): Promise<Notification[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return null;
  return data ?? [];
}

/** Cantidad de notificaciones sin leer del usuario (para la campana del Topbar). */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("leida", false);
  if (error || count == null) return 0;
  return count;
}

/** Marca una notificación propia como leída (RLS: solo las suyas). */
export async function markNotificationRead(
  id: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ leida: true })
    .eq("id", id);
  return { ok: !error };
}

/** Marca como leídas todas las notificaciones no leídas del usuario. */
export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ leida: true })
    .eq("leida", false);
  return { ok: !error };
}

// ---------------------------------------------------------------------------
// Generación (sistema; cliente admin, ignora RLS)
// ---------------------------------------------------------------------------

type AdminClient = ReturnType<typeof createAdminClient>;

/** Inserta una notificación para un usuario (uso interno; cliente admin). */
async function insertNotification(
  admin: AdminClient,
  userId: string,
  tipo: NotificationType,
  mensaje: string,
): Promise<void> {
  await admin.from("notifications").insert({ user_id: userId, tipo, mensaje });
}

/**
 * Notifica una multa recién generada. Lo invoca `fines.syncFineForLoan` en el
 * momento en que CREA la multa (no al actualizar el monto), así el aviso sale
 * una sola vez. Reusa el cliente admin del llamante para no abrir otro.
 */
export async function notifyFineGenerated(
  admin: AdminClient,
  userId: string,
  bookTitle: string,
  monto: number,
): Promise<void> {
  await insertNotification(
    admin,
    userId,
    "multa_generada",
    fineGeneratedMessage(bookTitle, monto),
  );
}

/**
 * Asegura los avisos de "vencimiento próximo" del usuario autenticado.
 * Lee sus préstamos activos con la sesión (RLS: solo los suyos), selecciona los
 * que vencen dentro de la ventana y aún no se avisaron, crea la notificación y
 * marca el préstamo (`vencimiento_notificado_en`) para no repetir. Idempotente.
 */
export async function syncOwnDueSoonNotifications(
  now: Date = new Date(),
): Promise<void> {
  const supabase = await createClient();
  const { data: loans, error } = await supabase
    .from("loans")
    .select(
      "id, user_id, book_id, fecha_devolucion_estimada, fecha_devolucion_real, vencimiento_notificado_en",
    )
    .is("fecha_devolucion_real", null)
    .is("vencimiento_notificado_en", null);
  if (error || !loans) return;

  const dueSoon = loans.filter((loan) => isDueSoon(loan, now));
  if (dueSoon.length === 0) return;

  const bookIds = [...new Set(dueSoon.map((loan) => loan.book_id))];
  const { data: books } = await supabase
    .from("books")
    .select("id, titulo")
    .in("id", bookIds);
  const titleById = new Map((books ?? []).map((b) => [b.id, b.titulo]));

  const admin = createAdminClient();
  const nowIso = now.toISOString();
  await Promise.all(
    dueSoon.map(async (loan) => {
      const titulo = titleById.get(loan.book_id) ?? "tu libro";
      await insertNotification(
        admin,
        loan.user_id,
        "vencimiento_proximo",
        dueSoonMessage(titulo, loan.fecha_devolucion_estimada),
      );
      await admin
        .from("loans")
        .update({ vencimiento_notificado_en: nowIso })
        .eq("id", loan.id);
    }),
  );
}

/**
 * Asegura los avisos de "reserva disponible". Barrido del sistema (cliente
 * admin): recorre las reservas activas aún sin avisar cuyo libro volvió a tener
 * stock y notifica al frente de la cola (por antigüedad) hasta el número de
 * ejemplares disponibles. Marca la reserva (`notificada_disponible_en`) para no
 * repetir. Requiere ver reservas de todos los usuarios → cliente admin.
 */
export async function syncAvailableReservations(
  now: Date = new Date(),
): Promise<void> {
  const admin = createAdminClient();
  const { data: reservations, error } = await admin
    .from("reservations")
    .select("id, user_id, book_id, fecha_reserva")
    .eq("estado", "activa")
    .is("notificada_disponible_en", null)
    .order("fecha_reserva", { ascending: true });
  if (error || !reservations || reservations.length === 0) return;

  const bookIds = [...new Set(reservations.map((r) => r.book_id))];
  const { data: books } = await admin
    .from("books")
    .select("id, titulo, cantidad_disponible")
    .in("id", bookIds);
  const bookById = new Map((books ?? []).map((b) => [b.id, b]));

  // Cupos por libro = ejemplares disponibles ahora mismo. Las reservas vienen
  // ordenadas por antigüedad, así que se sirve al frente de la cola primero.
  const cupos = new Map<string, number>();
  const nowIso = now.toISOString();
  for (const reservation of reservations) {
    const book = bookById.get(reservation.book_id);
    if (!book) continue;
    const restante = cupos.get(reservation.book_id) ?? book.cantidad_disponible;
    if (restante <= 0) continue;

    await insertNotification(
      admin,
      reservation.user_id,
      "reserva_disponible",
      reservationAvailableMessage(book.titulo),
    );
    await admin
      .from("reservations")
      .update({ notificada_disponible_en: nowIso })
      .eq("id", reservation.id);
    cupos.set(reservation.book_id, restante - 1);
  }
}
