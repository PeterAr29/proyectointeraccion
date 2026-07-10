import type { Metadata } from "next";
import Link from "next/link";
import { HeartOff } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { BookCard } from "@/components/biblioteca/BookCard";
import { FavoriteButton } from "@/components/biblioteca/FavoriteButton";
import { buttonVariants } from "@/components/ui/button";
import { listFavorites } from "@/lib/services/books";

export const metadata: Metadata = { title: "Favoritos" };

/**
 * Favoritos del usuario: los libros que marcó, del más reciente al más antiguo.
 * Server Component que consume `lib/services/books` (RLS garantiza que solo ve
 * los suyos). Cuatro estados: carga (`loading.tsx`), error, vacío y con datos.
 */
export default async function FavoritosPage() {
  const favorites = await listFavorites();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Favoritos</h1>
        <p className="mt-1 text-muted-foreground">
          Los libros que guardaste para consultarlos después.
        </p>
      </header>

      {favorites === null ? (
        <ErrorState message="No pudimos cargar tus favoritos. Inténtalo de nuevo en unos segundos." />
      ) : favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((book) => (
            <li key={book.id} className="relative">
              <BookCard book={book} href={`/catalogo/${book.id}`} />
              <FavoriteButton
                bookId={book.id}
                initialFavorite
                variant="icon"
                className="absolute left-2 top-2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyFavorites() {
  return (
    <div>
      <EmptyState
        icon={HeartOff}
        title="Aún no tienes favoritos"
        message="Marca un libro con el corazón desde su detalle y aparecerá aquí."
      />
      <div className="flex justify-center">
        <Link
          href="/catalogo"
          className={buttonVariants({ variant: "primary" })}
        >
          Explorar el catálogo
        </Link>
      </div>
    </div>
  );
}
