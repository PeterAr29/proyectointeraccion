import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getProfilesByIds } from "@/lib/services/users";
import { getCirculationSettings } from "@/lib/services/settings";
import {
  buildReturnRows,
  listAllLoansWithBooks,
} from "@/lib/services/loans-admin";
import { ReturnsList } from "./ReturnsList";

export const metadata: Metadata = { title: "Devoluciones" };

/**
 * Registro de devoluciones (Módulo E, F5.3). Lista los préstamos pendientes de
 * devolver (de todos los usuarios) con la multa estimada, y permite registrar la
 * devolución (repone stock + genera la multa si hay retraso). Cuatro estados.
 */
export default async function DevolucionesPage() {
  const [loans, settings] = await Promise.all([
    listAllLoansWithBooks(),
    getCirculationSettings(),
  ]);

  let rows = null as ReturnType<typeof buildReturnRows> | null;
  if (loans !== null) {
    const userIds = [...new Set(loans.map((item) => item.loan.user_id))];
    const profiles = await getProfilesByIds(userIds);
    rows = buildReturnRows(loans, profiles, settings.multaDiaria);
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Devoluciones</h1>
        <p className="mt-1 text-muted-foreground">
          Registra la devolución de los préstamos pendientes. Los vencidos
          generan multa automáticamente.
        </p>
      </header>

      {rows === null ? (
        <ErrorState message="No pudimos cargar las devoluciones pendientes. Inténtalo de nuevo en unos segundos." />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin devoluciones pendientes"
          message="Todos los préstamos están al día. Cuando haya libros por devolver, aparecerán aquí."
        />
      ) : (
        <ReturnsList rows={rows} />
      )}
    </div>
  );
}
