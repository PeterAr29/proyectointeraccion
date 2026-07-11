import { Skeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" de Notificaciones (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve los avisos del usuario.
 */
export default function NotificacionesLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
        <p className="mt-1 text-muted-foreground">
          Avisos sobre tus préstamos, reservas y multas.
        </p>
      </header>
      <div className="space-y-3 rounded-lg border p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
