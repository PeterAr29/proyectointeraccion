import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getReportData } from "@/lib/services/reports";
import { ReportsView } from "./ReportsView";

export const metadata: Metadata = { title: "Reportes" };

/**
 * Reportes de administración (Módulo E, F5.4): préstamos por mes, libros más
 * prestados y resumen de multas, con exportación a CSV. Solo bibliotecario
 * (layout `(admin)` + RLS). Cuatro estados: carga, error, vacío y con datos.
 */
export default async function ReportesPage() {
  const data = await getReportData();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="mt-1 text-muted-foreground">
          Estadísticas de circulación y multas. Expórtalas a CSV.
        </p>
      </header>

      {data === null ? (
        <ErrorState message="No pudimos generar los reportes. Inténtalo de nuevo en unos segundos." />
      ) : data.totalLoans === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Aún no hay datos"
          message="Cuando haya préstamos registrados, aquí verás las estadísticas."
        />
      ) : (
        <ReportsView data={data} />
      )}
    </div>
  );
}
