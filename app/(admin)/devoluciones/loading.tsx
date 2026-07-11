import { Skeleton, TableRowSkeleton } from "@/components/feedback/Skeleton";

/** Estado "cargando" de la vista de devoluciones (F5.3). */
export default function DevolucionesLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-80" />
      </header>
      <div className="rounded-lg border">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={6} />
        ))}
      </div>
    </div>
  );
}
