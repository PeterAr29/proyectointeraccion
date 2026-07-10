import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { CatalogFilters } from "@/lib/validations/catalog";

/**
 * Servicio de catálogo: ÚNICA puerta a la tabla `books`.
 * Ningún componente consulta `books` directamente (regla de arquitectura).
 * La lectura del catálogo es abierta a cualquier usuario autenticado (RLS lo
 * permite); la escritura del catálogo es del módulo E (bibliotecario) y no vive
 * aquí. La búsqueda es SIEMPRE parametrizada: el término se sanea antes de
 * construir el filtro `.or(...)` para que no pueda inyectar operadores PostgREST.
 */

export type Book = Database["public"]["Tables"]["books"]["Row"];

/** Tamaño de página del listado del catálogo. */
export const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Lógica pura (sin BD): exportada aparte para poder testearla sin Supabase.
// ---------------------------------------------------------------------------

/**
 * Construye el filtro OR de búsqueda por título/autor/ISBN, o `null` si el
 * término queda vacío. Elimina los caracteres con significado en la gramática
 * de `.or()` de PostgREST (`, ( ) *`) y los comodines de LIKE (`%`, `\`) para
 * que la entrada del usuario se trate como texto literal (A03: sin inyección).
 */
export function buildSearchFilter(term: string): string | null {
  const cleaned = term
    .replace(/[%,()*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  const pattern = `%${cleaned}%`;
  return `titulo.ilike.${pattern},autor.ilike.${pattern},isbn.ilike.${pattern}`;
}

export interface Pagination {
  /** Página acotada al rango válido [1, totalPages]. */
  page: number;
  totalPages: number;
  /** Índice inicial (0-based) para `.range()`. */
  from: number;
  /** Índice final (0-based, inclusivo) para `.range()`. */
  to: number;
}

/** Calcula la paginación acotando la página pedida al total real de resultados. */
export function computePagination(
  total: number,
  page: number,
  pageSize: number = PAGE_SIZE,
): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const from = (clamped - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page: clamped, totalPages, from, to };
}

/** Un libro está disponible cuando le queda al menos un ejemplar libre. */
export function isAvailable(book: Pick<Book, "cantidad_disponible">): boolean {
  return book.cantidad_disponible > 0;
}

// ---------------------------------------------------------------------------
// Acceso a datos
// ---------------------------------------------------------------------------

/**
 * Aplica los filtros comunes (búsqueda, categoría, ubicación, disponibilidad)
 * a un query de `books`. Genérico sobre el builder de Supabase para reutilizarse
 * tanto en el conteo como en la consulta de datos sin duplicar la lógica.
 */
function applyFilters<
  Q extends {
    or(filters: string): Q;
    eq(column: string, value: string): Q;
    gt(column: string, value: number): Q;
    lt(column: string, value: number): Q;
  },
>(query: Q, filters: CatalogFilters): Q {
  let q = query;
  const search = buildSearchFilter(filters.q);
  if (search) q = q.or(search);
  if (filters.categoria) q = q.eq("categoria", filters.categoria);
  if (filters.ubicacion) q = q.eq("ubicacion", filters.ubicacion);
  if (filters.disponibilidad === "disponibles") {
    q = q.gt("cantidad_disponible", 0);
  } else if (filters.disponibilidad === "no-disponibles") {
    // cantidad_disponible es un entero ≥ 0, así que `< 1` equivale a `= 0`.
    q = q.lt("cantidad_disponible", 1);
  }
  return q;
}

export interface CatalogPage {
  ok: true;
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}
export type ListBooksResult = CatalogPage | { ok: false };

/**
 * Lista el catálogo con búsqueda, filtros y paginación.
 * Cuenta primero el total (para acotar la página) y luego pide solo la ventana
 * de resultados con `.range()`. Devuelve `{ ok: false }` ante cualquier error
 * de BD; la UI traduce eso a su ErrorState sin exponer detalles técnicos.
 */
export async function listBooks(
  filters: CatalogFilters,
): Promise<ListBooksResult> {
  const supabase = await createClient();

  const { count, error: countError } = await applyFilters(
    supabase.from("books").select("id", { count: "exact", head: true }),
    filters,
  );
  if (countError) return { ok: false };

  const total = count ?? 0;
  const { page, totalPages, from, to } = computePagination(total, filters.page);

  const { data, error } = await applyFilters(
    supabase.from("books").select("*"),
    filters,
  )
    .order("titulo", { ascending: true })
    .range(from, to);
  if (error) return { ok: false };

  return {
    ok: true,
    books: data ?? [],
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}

/**
 * Devuelve un libro por su id, o `null` si no existe / hay error.
 * Frontera que el módulo C (circulación) reutilizará para reservar/prestar.
 */
export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}

/**
 * Facetas para poblar los selects de filtro: categorías y ubicaciones distintas
 * presentes en el catálogo, ordenadas alfabéticamente (locale es).
 */
export async function getCatalogFacets(): Promise<{
  categorias: string[];
  ubicaciones: string[];
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("categoria, ubicacion");
  if (error || !data) return { categorias: [], ubicaciones: [] };

  const uniqueSorted = (values: (string | null)[]): string[] =>
    [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) =>
      a.localeCompare(b, "es"),
    );

  return {
    categorias: uniqueSorted(data.map((r) => r.categoria)),
    ubicaciones: uniqueSorted(data.map((r) => r.ubicacion)),
  };
}
