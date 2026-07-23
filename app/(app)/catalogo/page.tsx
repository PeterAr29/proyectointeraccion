import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { BookCard } from "@/components/biblioteca/BookCard";
import { buttonVariants } from "@/components/ui/button";
import { AreaBreadcrumb, AreaHub } from "@/components/catalogo/AreaHub";
import {
  getAreaCounts,
  getCatalogFacets,
  listBooks,
  listRecommendedBooks,
  type Book,
} from "@/lib/services/books";
import { getCurrentProfile } from "@/lib/services/users";
import { areaForCarrera } from "@/lib/domain/areas";
import {
  hasActiveFilters,
  parseCatalogFilters,
  type CatalogFilters as Filters,
} from "@/lib/validations/catalog";
import { CatalogFilters } from "./CatalogFilters";
import { Pagination } from "./Pagination";

export const metadata: Metadata = { title: "Catálogo" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Catálogo de libros. Por defecto muestra un HUB de áreas académicas (el
 * estudiante busca por necesidad, no por navegación libre). Al elegir un área,
 * buscar o pedir "ver todo" (`?ver=todo`) pasa al listado paginado con filtros.
 * Server Component que consume `lib/services/books` (única puerta a `books`).
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseCatalogFilters(sp);
  const verTodo = first(sp.ver) === "todo";
  const showHub = !hasActiveFilters(filters) && !verTodo;

  if (showHub) {
    const [counts, profile] = await Promise.all([
      getAreaCounts(),
      getCurrentProfile(),
    ]);
    const userArea = areaForCarrera(profile?.carrera);
    const recommended = await listRecommendedBooks(userArea, 4);

    return (
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
            <p className="mt-1 text-muted-foreground">
              Elige un área académica para encontrar tus libros más rápido, o
              busca en todo el catálogo.
            </p>
          </div>
          <Link
            href="/catalogo?ver=todo"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todo el catálogo →
          </Link>
        </header>

        <AreaHub
          counts={counts}
          userArea={userArea}
          recommendedBooks={recommended}
          carrera={profile?.carrera ?? null}
        />
      </div>
    );
  }

  const [result, facets] = await Promise.all([
    listBooks(filters),
    getCatalogFacets(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <AreaBreadcrumb label={filters.categoria || undefined} />
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {filters.categoria || "Catálogo"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Busca por título, autor o ISBN y filtra por área, ubicación o
          disponibilidad.
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
            Volver a las áreas
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
            <BookCard book={book} href={`/catalogo/${book.id}`} />
          </li>
        ))}
      </ul>
      <Pagination filters={filters} page={page} totalPages={totalPages} />
    </>
  );
}
