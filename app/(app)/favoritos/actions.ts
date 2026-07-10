"use server";

import { revalidatePath } from "next/cache";

import { addFavorite, removeFavorite } from "@/lib/services/books";
import { parseBookId } from "@/lib/validations/catalog";

/**
 * Server Action para marcar/desmarcar un libro como favorito.
 * Revalida el id en el servidor (no confía en el cliente) y delega en el
 * service, que escribe bajo RLS (solo la fila del propio usuario). Revalida el
 * detalle del libro y la página de favoritos para reflejar el cambio.
 */
export async function toggleFavoriteAction(
  bookId: string,
  makeFavorite: boolean,
): Promise<{ ok: boolean }> {
  const id = parseBookId(bookId);
  if (!id) return { ok: false };

  const result = makeFavorite
    ? await addFavorite(id)
    : await removeFavorite(id);

  if (result.ok) {
    revalidatePath("/favoritos");
    revalidatePath(`/catalogo/${id}`);
  }
  return result;
}
