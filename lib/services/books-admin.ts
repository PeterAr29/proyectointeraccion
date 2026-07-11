import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/services/books";
import type { BookRowPayload } from "@/lib/validations/books";

/**
 * Operaciones de ADMINISTRACIÓN del catálogo (Módulo E, F5.2). Sigue siendo el
 * módulo B (mismo dominio `books`); se separa de `books.ts` solo por tamaño de
 * archivo. La escritura la permite la RLS al bibliotecario (`books_*_librarian`);
 * las Server Actions revalidan además el rol en el servidor de la app.
 * La baja lógica (`activo`) reemplaza al borrado en duro: preserva el historial.
 */

const COVERS_BUCKET = "book-covers";

/** Motivo por el que una mutación de libro falló (para mensajes en la UI). */
export type BookMutationError = "isbn-taken" | "not-found" | "error";

export type BookMutationResult =
  | { ok: true; id: string }
  | { ok: false; reason: BookMutationError };

/** Traduce el error de BD a un motivo conocido (23505 = violación de unicidad). */
function mapBookError(code: string | undefined): BookMutationError {
  return code === "23505" ? "isbn-taken" : "error";
}

// ---------------------------------------------------------------------------
// Lectura (admin: incluye libros retirados)
// ---------------------------------------------------------------------------

/** Todos los libros (activos e inactivos), por título. `null` ante error. */
export async function listBooksAdmin(): Promise<Book[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("titulo", { ascending: true });
  if (error) return null;
  return data ?? [];
}

/** Un libro por id SIN filtrar por `activo` (para editar/reactivar). */
export async function getBookForAdmin(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Mutaciones (RLS: solo bibliotecario; las actions revalidan el rol)
// ---------------------------------------------------------------------------

/** Crea un libro. Devuelve `isbn-taken` si el ISBN ya existe (índice único). */
export async function createBook(
  payload: BookRowPayload,
): Promise<BookMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, reason: mapBookError(error.code) };
  if (!data) return { ok: false, reason: "error" };
  return { ok: true, id: data.id };
}

/** Actualiza un libro existente. */
export async function updateBook(
  id: string,
  payload: BookRowPayload,
): Promise<BookMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .update(payload)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, reason: mapBookError(error.code) };
  if (!data) return { ok: false, reason: "not-found" };
  return { ok: true, id: data.id };
}

/** Baja/alta lógica: marca el libro como retirado (false) o vigente (true). */
export async function setBookActive(
  id: string,
  activo: boolean,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .update({ activo })
    .eq("id", id);
  return { ok: !error };
}

// ---------------------------------------------------------------------------
// Portada (Supabase Storage)
// ---------------------------------------------------------------------------

/**
 * Sube la portada al bucket `book-covers` y devuelve su URL pública. Usa el
 * cliente con sesión: la RLS del bucket exige `is_librarian()` para escribir.
 * El nombre es aleatorio (evita colisiones y no filtra el título).
 */
export async function uploadBookCover(
  file: File,
): Promise<{ ok: true; url: string } | { ok: false }> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(COVERS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) return { ok: false };

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) return { ok: false };
  return { ok: true, url: data.publicUrl };
}
