"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserLibrarian } from "@/lib/services/users";
import {
  createBook,
  updateBook,
  setBookActive,
  uploadBookCover,
  type BookMutationResult,
} from "@/lib/services/books-admin";
import {
  bookFormSchema,
  bookInputToRow,
  validateCoverFile,
  type BookFormInput,
} from "@/lib/validations/books";
import { parseBookId } from "@/lib/validations/catalog";

/** Respuesta uniforme de las mutaciones de libro para la UI. */
type ActionResult = { ok: true; id: string } | { ok: false; error: string };

const DENIED = "No tienes permisos para esta acción.";
const INVALID = "Revisa los datos del formulario.";

const REASON_TEXT: Record<string, string> = {
  "isbn-taken": "Ya existe un libro con ese ISBN.",
  "not-found": "El libro ya no existe.",
  error: "No se pudo guardar el libro. Inténtalo de nuevo.",
};

const GENERIC = "No se pudo guardar el libro. Inténtalo de nuevo.";
const NOT_FOUND = "El libro ya no existe.";

function toActionResult(result: BookMutationResult): ActionResult {
  if (result.ok) return { ok: true, id: result.id };
  return { ok: false, error: REASON_TEXT[result.reason] ?? GENERIC };
}

/** Sube una portada al Storage. Recibe FormData con el archivo `file`. */
export async function uploadCoverAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!(await isCurrentUserLibrarian())) return { ok: false, error: DENIED };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen para la portada." };
  }
  const check = validateCoverFile({ type: file.type, size: file.size });
  if (!check.ok) return { ok: false, error: check.error };

  const result = await uploadBookCover(file);
  if (!result.ok) return { ok: false, error: "No se pudo subir la portada." };
  return { ok: true, url: result.url };
}

/** Crea un libro (portada opcional ya subida). */
export async function createBookAction(
  input: BookFormInput,
  portadaUrl: string | null,
): Promise<ActionResult> {
  if (!(await isCurrentUserLibrarian())) return { ok: false, error: DENIED };

  const parsed = bookFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const result = await createBook({
    ...bookInputToRow(parsed.data),
    portada_url: portadaUrl,
  });
  if (result.ok) revalidatePath("/libros");
  return toActionResult(result);
}

/** Edita un libro existente. `portadaUrl` es el valor final (string o null). */
export async function updateBookAction(
  id: string,
  input: BookFormInput,
  portadaUrl: string | null,
): Promise<ActionResult> {
  if (!(await isCurrentUserLibrarian())) return { ok: false, error: DENIED };

  const bookId = parseBookId(id);
  if (!bookId) return { ok: false, error: NOT_FOUND };

  const parsed = bookFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const result = await updateBook(bookId, {
    ...bookInputToRow(parsed.data),
    portada_url: portadaUrl,
  });
  if (result.ok) {
    revalidatePath("/libros");
    revalidatePath(`/libros/${bookId}`);
  }
  return toActionResult(result);
}

/** Baja/alta lógica de un libro (retirar del catálogo o reactivarlo). */
export async function setBookActiveAction(
  id: string,
  activo: boolean,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isCurrentUserLibrarian())) return { ok: false, error: DENIED };

  const bookId = parseBookId(id);
  if (!bookId) return { ok: false, error: NOT_FOUND };

  const result = await setBookActive(bookId, activo);
  if (result.ok) revalidatePath("/libros");
  return { ok: result.ok, error: result.ok ? undefined : REASON_TEXT.error };
}
