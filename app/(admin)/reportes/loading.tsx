import { Skeleton, TableRowSkeleton } from "@/components/feedback/Skeleton";

/** Estado "cargando" de los reportes (F5.4). */
export default function ReportesLoading() {
  return (
    <div>
      <header className="mb-6 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72" />
      </header>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s}>
            <Skeleton className="mb-3 h-6 w-48" />
            <div className="rounded-lg border">
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} columns={2} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
