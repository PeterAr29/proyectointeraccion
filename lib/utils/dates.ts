/**
 * Utilidades de fecha del dominio BiblioTEC.
 * La UI muestra siempre fechas en formato peruano DD/MM/AAAA.
 * Acepta `Date` o cadena ISO (como las `timestamptz` que devuelve Supabase).
 */

/** Marcador que se muestra cuando no hay fecha o es inválida. */
export const NO_DATE = "—";

/**
 * Convierte una entrada flexible en `Date`, o `null` si no es válida.
 * Las cadenas date-only (`AAAA-MM-DD`, como las columnas `date` de Postgres) se
 * interpretan en hora local para evitar el corrimiento de un día por UTC.
 */
export function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formatea una fecha como `DD/MM/AAAA`.
 * Devuelve `NO_DATE` ("—") para valores nulos o inválidos, para no romper la UI.
 */
export function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return NO_DATE;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Fecha de hoy a medianoche local (sin componente horario). */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * `true` si la fecha es anterior a hoy (día completo).
 * Útil para marcar préstamos vencidos y validar fechas de devolución.
 */
export function isPastDate(value: Date | string | null | undefined): boolean {
  const date = toDate(value);
  if (!date) return false;
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return day.getTime() < today().getTime();
}

/** Días de diferencia (b - a) contados por día completo; negativo si b es anterior. */
export function daysBetween(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): number {
  const from = toDate(a);
  const to = toDate(b);
  if (!from || !to) return 0;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const fromMid = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toMid = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toMid - fromMid) / MS_PER_DAY);
}
