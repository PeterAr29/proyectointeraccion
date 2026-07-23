import { TableRowSkeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" del Historial (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve el historial del usuario.
 */
export default function HistorialLoading() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
        <p className="mt-1 text-muted-foreground">
          Todos tus préstamos: activos, vencidos y devueltos. Filtra por estado
          o por fechas.
        </p>
      </header>
      <div className="rounded-lg border">
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRowSkeleton key={index} columns={4} />
        ))}
      </div>
    </div>
  );
}
