import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { getBookForAdmin } from "@/lib/services/books-admin";
import { parseBookId } from "@/lib/validations/catalog";
import { BookForm } from "../BookForm";

export const metadata: Metadata = { title: "Editar libro" };

/** Edición de un libro (Módulo E, F5.2). Id no-UUID o inexistente → ErrorState. */
export default async function EditarLibroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = parseBookId(id);
  const book = bookId ? await getBookForAdmin(bookId) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/libros"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Libros
      </Link>

      {book === null ? (
        <ErrorState
          title="Libro no encontrado"
          message="El libro que intentas editar no existe o fue eliminado."
        />
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold tracking-tight">
            Editar libro
          </h1>
          <BookForm book={book} />
        </>
      )}
    </div>
  );
}
