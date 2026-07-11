"use server";

import { revalidatePath } from "next/cache";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";
import { parseNotificationId } from "@/lib/validations/notifications";

/**
 * Server Actions de Notificaciones (F4.2).
 * Revalidan el id en el servidor (nunca confían en el cliente) y delegan en la
 * capa de servicios (RLS garantiza que solo se toquen las notificaciones
 * propias). Al marcar leídas, revalidan la vista para refrescar el contador.
 */

export type MarkReadResult = { ok: boolean };

export async function markReadAction(id: string): Promise<MarkReadResult> {
  const notificationId = parseNotificationId(id);
  if (!notificationId) return { ok: false };

  const result = await markNotificationRead(notificationId);
  if (result.ok) revalidatePath("/notificaciones");
  return result;
}

export async function markAllReadAction(): Promise<MarkReadResult> {
  const result = await markAllNotificationsRead();
  if (result.ok) revalidatePath("/notificaciones");
  return result;
}
