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

/**
 * Reordena los libros para que sigan el orden de `orderedIds` (p. ej. el de
 * favoritos, "más reciente primero"), descartando los ids sin libro asociado.
 * Pura y testeable: separa el orden de la consulta a la BD.
 */
export function orderBooksByIds(books: Book[], orderedIds: string[]): Book[] {
  const byId = new Map(books.map((book) => [book.id, book]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((book): book is Book => book !== undefined);
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

  // El catálogo del estudiante solo muestra libros activos (baja lógica, F5.2).
  const { count, error: countError } = await applyFilters(
    supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
    filters,
  );
  if (countError) return { ok: false };

  const total = count ?? 0;
  const { page, totalPages, from, to } = computePagination(total, filters.page);

  const { data, error } = await applyFilters(
    supabase.from("books").select("*").eq("activo", true),
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
    .eq("activo", true) // el estudiante no ve libros retirados (F5.2)
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
    .select("categoria, ubicacion")
    .eq("activo", true); // facetas solo de libros vigentes (F5.2)
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

/**
 * Número de libros vigentes por área (valor de `categoria`), para el hub del
 * catálogo. Devuelve un mapa etiqueta→conteo; áreas sin libros simplemente no
 * aparecen (el hub las muestra con 0). Ante error de BD devuelve `{}`.
 */
export async function getAreaCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("categoria")
    .eq("activo", true);
  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.categoria) counts[row.categoria] = (counts[row.categoria] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Métricas (Módulo E, F5.1)
// ---------------------------------------------------------------------------
// El bibliotecario puede contar todo el catálogo (RLS `books_select_authenticated`
// permite la lectura a cualquier autenticado). Lo consume el dashboard de admin.

/** Número total de libros del catálogo. `null` ante error de BD (→ ErrorState). */
export async function countBooks(): Promise<number | null> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("activo", true); // KPI "libros en el catálogo" = vigentes (F5.2)
  if (error) return null;
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Favoritos (Módulo B, F2.2)
// ---------------------------------------------------------------------------
// La tabla `favorites` tiene RLS "solo los propios" (user_id = auth.uid()), así
// que cada operación se acota además por `user_id` para no depender solo de la
// política. Sin sesión, las escrituras se rechazan sin error visible.

/** `true` si el usuario actual tiene el libro en favoritos. */
export async function isFavorite(bookId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("book_id")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Añade un libro a los favoritos del usuario. Idempotente: repetir la acción no
 * falla (upsert sobre la PK compuesta). Devuelve `{ ok: false }` sin sesión o
 * ante error de BD.
 */
export async function addFavorite(bookId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("favorites")
    .upsert(
      { user_id: user.id, book_id: bookId },
      { onConflict: "user_id,book_id", ignoreDuplicates: true },
    );
  return { ok: !error };
}

/** Quita un libro de los favoritos del usuario. Idempotente. */
export async function removeFavorite(bookId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("book_id", bookId);
  return { ok: !error };
}

/**
 * Lista los libros favoritos del usuario, del más reciente al más antiguo.
 * Dos pasos (ids de `favorites` → filas de `books`) para no depender de la
 * inferencia de relaciones embebidas de PostgREST. Devuelve `null` ante error
 * (la UI lo traduce a ErrorState); `[]` cuando no hay favoritos.
 */
export async function listFavorites(): Promise<Book[] | null> {
  const supabase = await createClient();
  const { data: favRows, error } = await supabase
    .from("favorites")
    .select("book_id, created_at")
    .order("created_at", { ascending: false });
  if (error) return null;

  const orderedIds = (favRows ?? []).map((row) => row.book_id);
  if (orderedIds.length === 0) return [];

  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("*")
    .in("id", orderedIds)
    .eq("activo", true); // un favorito retirado del catálogo deja de listarse (F5.2)
  if (booksError) return null;

  return orderBooksByIds(books ?? [], orderedIds);
}
