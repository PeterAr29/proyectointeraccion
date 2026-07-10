import { Skeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" del detalle del libro (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve `getBookById`.
 */
export default function BookDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Skeleton className="mb-6 h-4 w-36" />
      <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
        <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[220px] sm:mx-0" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="mt-6 h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
