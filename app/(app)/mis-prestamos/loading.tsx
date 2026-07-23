import { TableRowSkeleton } from "@/components/feedback/Skeleton";

/**
 * Estado "cargando" de Mis préstamos (Suspense de App Router).
 * Se muestra mientras el Server Component resuelve los préstamos del usuario.
 */
export default function MisPrestamosLoading() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mis préstamos</h1>
        <p className="mt-1 text-muted-foreground">
          Los libros que tienes prestados. Renuévalos o devuélvelos desde aquí.
        </p>
      </header>
      <div className="rounded-lg border">
        {Array.from({ length: 4 }).map((_, index) => (
          <TableRowSkeleton key={index} columns={5} />
        ))}
      </div>
    </div>
  );
}
