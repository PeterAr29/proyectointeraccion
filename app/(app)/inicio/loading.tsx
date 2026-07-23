import { Skeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" del Inicio (Suspense de App Router). Se muestra mientras el
 * Server Component resuelve el resumen personalizado (préstamos, favoritos,
 * avisos). Refleja la estructura real: cabecera, tira de estadísticas y accesos.
 */
export default function InicioLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-52 rounded-3xl sm:h-56" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}
