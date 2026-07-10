import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { BookCard } from "@/components/biblioteca/BookCard";
import { buttonVariants } from "@/components/ui/button";
import { getCatalogFacets, listBooks, type Book } from "@/lib/services/books";
import {
  hasActiveFilters,
  parseCatalogFilters,
  type CatalogFilters as Filters,
} from "@/lib/validations/catalog";
import { CatalogFilters } from "./CatalogFilters";
import { Pagination } from "./Pagination";

export const metadata: Metadata = { title: "Catálogo" };

/**
 * Catálogo de libros: listado paginado con búsqueda y filtros.
 * Server Component que consume `lib/services/books` (única puerta a `books`) y
 * renderiza los cuatro estados: carga (via `loading.tsx`), vacío, error y datos.
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseCatalogFilters(await searchParams);
  const [result, facets] = await Promise.all([
    listBooks(filters),
    getCatalogFacets(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-muted-foreground">
          Explora los libros de la biblioteca. Busca por título, autor o ISBN y
          filtra por categoría, ubicación o disponibilidad.
        </p>
      </header>

      <CatalogFilters filters={filters} facets={facets} />

      <div className="mt-6">
        {!result.ok ? (
          <ErrorState message="No pudimos cargar el catálogo. Inténtalo de nuevo en unos segundos." />
        ) : result.books.length === 0 ? (
          <EmptyCatalog filtered={hasActiveFilters(filters)} />
        ) : (
          <CatalogResults
            books={result.books}
            total={result.total}
            filters={filters}
            page={result.page}
            totalPages={result.totalPages}
          />
        )}
      </div>
    </div>
  );
}

function EmptyCatalog({ filtered }: { filtered: boolean }) {
  return (
    <div>
      <EmptyState
        icon={SearchX}
        title="Sin resultados"
        message={
          filtered
            ? "Ningún libro coincide con tu búsqueda o filtros. Prueba con otros términos."
            : "Aún no hay libros en el catálogo."
        }
      />
      {filtered && (
        <div className="flex justify-center">
          <Link
            href="/catalogo"
            className={buttonVariants({ variant: "secondary" })}
          >
            Ver todo el catálogo
          </Link>
        </div>
      )}
    </div>
  );
}

function CatalogResults({
  books,
  total,
  filters,
  page,
  totalPages,
}: {
  books: Book[];
  total: number;
  filters: Filters;
  page: number;
  totalPages: number;
}) {
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? "libro encontrado" : "libros encontrados"}
      </p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard book={book} />
          </li>
        ))}
      </ul>
      <Pagination filters={filters} page={page} totalPages={totalPages} />
    </>
  );
}
