import { BookCardSkeleton, Skeleton } from "@/components/feedback/Skeleton";
import { PAGE_SIZE } from "@/lib/services/books";

/**
 * Estado "cargando" del catálogo (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve la consulta a `books`.
 */
export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
        <p className="mt-1 text-muted-foreground">
          Explora los libros de la biblioteca. Busca por título, autor o ISBN y
          filtra por categoría, ubicación o disponibilidad.
        </p>
      </header>

      <Skeleton className="h-40 w-full rounded-lg sm:h-28" />

      <div className="mt-6">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
