import { z } from "zod";

/**
 * Esquemas y parseo de los filtros del catálogo (Módulo B).
 * Los filtros viajan por query params (URL compartible, navegación con back).
 * `parseCatalogFilters` NUNCA lanza: cualquier valor basura en la URL cae a su
 * valor por defecto (`.catch`) en vez de romper el render del Server Component.
 */

/** Opciones del filtro de disponibilidad (valores estables usados en la URL). */
export const DISPONIBILIDAD = [
  "todos",
  "disponibles",
  "no-disponibles",
] as const;
export type Disponibilidad = (typeof DISPONIBILIDAD)[number];

export const catalogFiltersSchema = z.object({
  /** Texto de búsqueda por título/autor/ISBN. */
  q: z.string().trim().max(120).catch(""),
  /** Categoría exacta (una de las facetas del catálogo). */
  categoria: z.string().trim().max(80).catch(""),
  /** Ubicación física exacta (estantería/fila). */
  ubicacion: z.string().trim().max(120).catch(""),
  /** Disponibilidad derivada de `cantidad_disponible`. */
  disponibilidad: z.enum(DISPONIBILIDAD).catch("todos"),
  /** Página 1-based; se acota luego al total real de páginas en el servicio. */
  page: z.coerce.number().int().min(1).max(10000).catch(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

/** Toma el primer valor cuando un query param llega repetido (`?q=a&q=b`). */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Convierte los `searchParams` crudos de Next en filtros validados y seguros.
 * Tolerante a entradas malformadas: siempre devuelve un objeto usable.
 */
export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): CatalogFilters {
  const sp = searchParams ?? {};
  return catalogFiltersSchema.parse({
    q: first(sp.q) ?? "",
    categoria: first(sp.categoria) ?? "",
    ubicacion: first(sp.ubicacion) ?? "",
    disponibilidad: first(sp.disponibilidad) ?? "todos",
    page: first(sp.page) ?? "1",
  });
}

/** True si hay algún filtro activo (para ofrecer "limpiar filtros"). */
export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.q !== "" ||
    filters.categoria !== "" ||
    filters.ubicacion !== "" ||
    filters.disponibilidad !== "todos"
  );
}
