import { Skeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" del Inicio (Suspense de App Router). Se muestra mientras el
 * Server Component resuelve el resumen personalizado (préstamos, favoritos,
 * avisos). Refleja la estructura real: cabecera, tira de estadísticas y accesos.
 */
export default function InicioLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Skeleton className="h-52 rounded-3xl sm:h-56" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div>
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
