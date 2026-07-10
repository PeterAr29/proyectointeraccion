import { cn } from "@/lib/utils/cn";

/**
 * Bloque de carga (skeleton) del sistema de diseño.
 * Es el estado "cargando" que toda pantalla con datos debe mostrar.
 * Marcado con aria-hidden: es puramente visual, el lector de pantalla no lo anuncia.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/** Skeleton con la forma de una BookCard (portada + dos líneas de texto). */
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** Skeleton con la forma de una fila de tabla (para LoanTable, usuarios, etc.). */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4 flex-1" />
      ))}
    </div>
  );
}
