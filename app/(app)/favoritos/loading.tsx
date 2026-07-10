import { BookCardSkeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" de Favoritos (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve `listFavorites`.
 */
export default function FavoritosLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Favoritos</h1>
        <p className="mt-1 text-muted-foreground">
          Los libros que guardaste para consultarlos después.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
