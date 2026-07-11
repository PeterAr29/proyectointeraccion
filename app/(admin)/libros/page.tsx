import type { Metadata } from "next";
import Link from "next/link";
import { BookPlus, LibraryBig } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { buttonVariants } from "@/components/ui/button";
import { listBooksAdmin } from "@/lib/services/books-admin";
import { BooksAdminList } from "./BooksAdminList";

export const metadata: Metadata = { title: "Libros" };

/**
 * Gestión del catálogo (Módulo E, F5.2). Lista todos los libros (activos y
 * retirados) y permite crear, editar y dar de baja/alta. Solo bibliotecario
 * (layout `(admin)` + RLS). Cuatro estados: carga, error, vacío y con datos.
 */
export default async function LibrosPage() {
  const books = await listBooksAdmin();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Libros</h1>
          <p className="mt-1 text-muted-foreground">
            Administra el catálogo: crea, edita y retira libros.
          </p>
        </div>
        <Link
          href="/libros/nuevo"
          className={buttonVariants({ variant: "primary" })}
        >
          <BookPlus aria-hidden="true" />
          Nuevo libro
        </Link>
      </header>

      {books === null ? (
        <ErrorState message="No pudimos cargar el catálogo. Inténtalo de nuevo en unos segundos." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="Aún no hay libros"
          message="Crea el primer libro del catálogo para empezar."
        />
      ) : (
        <BooksAdminList books={books} />
      )}
    </div>
  );
}
