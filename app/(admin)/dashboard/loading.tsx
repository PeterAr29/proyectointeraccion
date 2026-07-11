import { Skeleton, TableRowSkeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" del dashboard (Suspense de App Router). Se muestra mientras
 * el Server Component resuelve los KPIs y los préstamos recientes.
 */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="mt-1 text-muted-foreground">
          Resumen del estado de la biblioteca: catálogo, usuarios y circulación.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border bg-card p-5"
          >
            <Skeleton className="h-11 w-11 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="mb-3 h-6 w-48" />
        <div className="rounded-lg border">
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRowSkeleton key={index} columns={5} />
          ))}
        </div>
      </div>
    </div>
  );
}
