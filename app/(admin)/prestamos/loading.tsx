import { Skeleton, TableRowSkeleton } from "@/components/feedback/Skeleton";

/** Estado "cargando" de la vista global de préstamos (F5.3). */
export default function PrestamosLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </header>
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="rounded-lg border">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={5} />
        ))}
      </div>
    </div>
  );
}
