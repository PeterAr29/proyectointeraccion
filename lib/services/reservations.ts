import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Servicio de reservas (Módulo C): ÚNICA puerta a la tabla `reservations`.
 * Reservar solo aplica a libros SIN stock (RF-C03): si hay ejemplares, el flujo
 * correcto es prestar. La RPC `create_reservation` valida esa regla, evita
 * reservas duplicadas y estima la fecha de disponibilidad leyendo los préstamos
 * activos del libro (algo que el estudiante no puede ver directamente por RLS).
 */

export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];

/** Motivo por el que una reserva no pudo registrarse (para mensajes en la UI). */
export type ReserveFailureReason =
  | "has-stock" // BT003: el libro sí tiene ejemplares (→ prestar, no reservar)
  | "already-reserved" // BT004: el usuario ya reservó este libro
  | "not-found" // BT404: el libro no existe
  | "no-session" // BT000: sesión ausente
  | "error"; // cualquier otro fallo de BD

/** Traduce el SQLSTATE que devuelve la RPC a un motivo de negocio conocido. */
export function mapCreateReservationError(
  code: string | undefined,
): ReserveFailureReason {
  switch (code) {
    case "BT003":
      return "has-stock";
    case "BT004":
      return "already-reserved";
    case "BT404":
      return "not-found";
    case "BT000":
      return "no-session";
    default:
      return "error";
  }
}

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: ReserveFailureReason };

/**
 * Reserva el libro `bookId` para el usuario autenticado.
 * Delega en la RPC `create_reservation`; `has-stock` es el caso esperado cuando
 * el libro dejó de estar agotado entre que se pintó la vista y se pulsó el botón.
 */
export async function reserveBook(bookId: string): Promise<ReserveResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_reservation", {
    p_book_id: bookId,
  });

  if (error)
    return { ok: false, reason: mapCreateReservationError(error.code) };
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, reservation: data };
}

/** Reservas del usuario autenticado por estado (RLS: solo las suyas). */
export async function listOwnReservations(
  estado?: Reservation["estado"],
): Promise<Reservation[] | null> {
  const supabase = await createClient();
  let query = supabase
    .from("reservations")
    .select("*")
    .order("fecha_reserva", { ascending: false });
  if (estado) query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) return null;
  return data ?? [];
}
