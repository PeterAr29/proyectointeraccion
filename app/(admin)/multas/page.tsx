import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import { getProfilesByIds } from "@/lib/services/users";
import { getLoansWithBooksByIds } from "@/lib/services/loans-admin";
import { buildAdminFineRows, listAllFines } from "@/lib/services/fines-admin";
import { FinesAdminList } from "./FinesAdminList";

export const metadata: Metadata = { title: "Multas" };

const FILTERS = [
  { key: "todas", label: "Todas" },
  { key: "pendiente", label: "Pendientes" },
  { key: "pagada", label: "Pagadas" },
] as const;

type FiltroMulta = (typeof FILTERS)[number]["key"];

function parseFiltro(value: string | string[] | undefined): FiltroMulta {
  const v = Array.isArray(value) ? value[0] : value;
  return FILTERS.some((f) => f.key === v) ? (v as FiltroMulta) : "todas";
}

/**
 * Gestión de multas (Módulo E, F5.3). Lista las multas de todos los usuarios con
 * filtro por estado y permite marcarlas como pagadas. Cuatro estados.
 */
export default async function MultasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filtro = parseFiltro((await searchParams).estado);
  const fines = await listAllFines();

  let rows = null as ReturnType<typeof buildAdminFineRows> | null;
  if (fines !== null) {
    const loanIds = [...new Set(fines.map((f) => f.loan_id))];
    const userIds = [...new Set(fines.map((f) => f.user_id))];
    const [loans, profiles] = await Promise.all([
      getLoansWithBooksByIds(loanIds),
      getProfilesByIds(userIds),
    ]);
    const all = buildAdminFineRows(fines, loans, profiles);
    rows = filtro === "todas" ? all : all.filter((r) => r.estado === filtro);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Multas</h1>
        <p className="mt-1 text-muted-foreground">
          Multas por retraso de todos los usuarios. Registra los pagos.
        </p>
      </header>

      <nav
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Filtrar por estado"
      >
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "todas" ? "/multas" : `/multas?estado=${f.key}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filtro === f.key
                ? "border-primary bg-primary-soft text-primary"
                : "border-input text-muted-foreground hover:bg-secondary",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows === null ? (
        <ErrorState message="No pudimos cargar las multas. Inténtalo de nuevo en unos segundos." />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Sin multas"
          message="No hay multas que coincidan con este filtro."
        />
      ) : (
        <FinesAdminList rows={rows} />
      )}
    </div>
  );
}
