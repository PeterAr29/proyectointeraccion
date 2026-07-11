import { z } from "zod";

import { toDate, today } from "@/lib/utils/dates";

/**
 * Validaciones del módulo C (Circulación).
 * Se reusan en cliente y servidor (Server Actions). Ninguna función lanza ante
 * entrada basura: devuelven `null`/`false` para que la UI muestre su estado sin
 * romper el render (patrón de `lib/validations/catalog.ts`).
 */

/** Un id de recurso siempre es UUID (A01/A03: nunca confiar en la URL cruda). */
export const bookIdSchema = z.string().uuid();

/**
 * Valida un id de libro; devuelve `null` si no es un UUID.
 * Igual que `parseBookId` del catálogo, replicado aquí para que el módulo C no
 * dependa de la frontera del módulo B para su propia validación de entrada.
 */
export function parseBookId(value: string | undefined): string | null {
  const result = bookIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

/** Un id de préstamo también es UUID; se valida antes de tocar la BD. */
export function parseLoanId(value: string | undefined): string | null {
  const result = bookIdSchema.safeParse(value);
  return result.success ? result.data : null;
}

/**
 * `true` si una fecha de devolución NO es anterior a hoy (regla §7.2.2: la fecha
 * de devolución no puede ser anterior a la fecha actual). Hoy cuenta como válido.
 * Entradas inválidas → `false` (se tratan como fecha no aceptable).
 */
export function isDueDateValid(
  value: Date | string | null | undefined,
): boolean {
  const date = toDate(value);
  if (!date) return false;
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return day.getTime() >= today().getTime();
}

/**
 * Esquema de una fecha de devolución válida (hoy o posterior). Lo consumirá
 * también F3.2 al renovar (recalcula la fecha estimada). El mensaje coincide con
 * el diálogo global `invalid-date` del sistema de diseño.
 */
export const dueDateSchema = z
  .union([z.string(), z.date()])
  .refine(isDueDateValid, {
    message: "La fecha de devolución no puede ser anterior a la fecha actual.",
  });

// ---------------------------------------------------------------------------
// Filtros del historial (F3.3). Viajan por query params (URL compartible).
// `parseHistoryFilters` NUNCA lanza: valores basura caen a su valor por defecto.
// ---------------------------------------------------------------------------

/** Estados por los que se puede filtrar el historial (valores estables en la URL). */
export const HISTORY_ESTADOS = [
  "todos",
  "activo",
  "vencido",
  "devuelto",
] as const;
export type HistoryEstado = (typeof HISTORY_ESTADOS)[number];

/** Cadena de fecha `AAAA-MM-DD` o "" (la del `<input type="date">`). */
const dateParam = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .catch("");

export const historyFiltersSchema = z.object({
  estado: z.enum(HISTORY_ESTADOS).catch("todos"),
  desde: dateParam,
  hasta: dateParam,
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type HistoryFilters = z.infer<typeof historyFiltersSchema>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Convierte los `searchParams` crudos en filtros de historial validados. */
export function parseHistoryFilters(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HistoryFilters {
  const sp = searchParams ?? {};
  return historyFiltersSchema.parse({
    estado: firstValue(sp.estado) ?? "todos",
    desde: firstValue(sp.desde) ?? "",
    hasta: firstValue(sp.hasta) ?? "",
    page: firstValue(sp.page) ?? "1",
  });
}

/** True si hay algún filtro de historial activo (para ofrecer "limpiar"). */
export function hasActiveHistoryFilters(filters: HistoryFilters): boolean {
  return (
    filters.estado !== "todos" || filters.desde !== "" || filters.hasta !== ""
  );
}
