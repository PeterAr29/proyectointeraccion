import { Skeleton } from "@/components/feedback/Skeleton";

/** Estado "cargando" de la configuración (F5.4). */
export default function ConfiguracionLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </header>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
