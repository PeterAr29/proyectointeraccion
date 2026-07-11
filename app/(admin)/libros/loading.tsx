import { Skeleton, TableRowSkeleton } from "@/components/feedback/Skeleton";

/** Estado "cargando" del listado de libros (F5.2). */
export default function LibrosLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </header>
      <div className="rounded-lg border">
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRowSkeleton key={index} columns={5} />
        ))}
      </div>
    </div>
  );
}
