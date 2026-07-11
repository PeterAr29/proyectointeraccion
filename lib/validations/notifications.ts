import { z } from "zod";

/**
 * Validaciones del módulo D (Notificaciones).
 * Se reusan en las Server Actions. No lanzan ante entrada basura: devuelven
 * `null` para que la acción responda `ok:false` sin romper (patrón de
 * `lib/validations/circulation.ts`).
 */

/** Un id de notificación es UUID (A01/A03: nunca confiar en la entrada cruda). */
export const notificationIdSchema = z.string().uuid();

export function parseNotificationId(value: string | undefined): string | null {
  const result = notificationIdSchema.safeParse(value);
  return result.success ? result.data : null;
}
