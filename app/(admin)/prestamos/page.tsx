import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import { getProfilesByIds } from "@/lib/services/users";
import {
  buildAdminLoanRows,
  listAllLoansWithBooks,
} from "@/lib/services/loans-admin";
import { AdminLoansTable } from "./AdminLoansTable";

export const metadata: Metadata = { title: "Préstamos" };

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "activo", label: "Activos" },
  { key: "vencido", label: "Vencidos" },
  { key: "devuelto", label: "Devueltos" },
] as const;

type FiltroEstado = (typeof FILTERS)[number]["key"];

function parseEstado(value: string | string[] | undefined): FiltroEstado {
  const v = Array.isArray(value) ? value[0] : value;
  return FILTERS.some((f) => f.key === v) ? (v as FiltroEstado) : "todos";
}

/**
 * Vista global de préstamos de todos los usuarios (Módulo E, F5.3). Solo lectura,
 * con filtro por estado efectivo. Solo bibliotecario (layout `(admin)` + RLS).
 * Cuatro estados: carga, error, vacío y con datos.
 */
export default async function PrestamosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const estado = parseEstado((await searchParams).estado);
  const loans = await listAllLoansWithBooks();

  let rows = null as ReturnType<typeof buildAdminLoanRows> | null;
  if (loans !== null) {
    const userIds = [...new Set(loans.map((item) => item.loan.user_id))];
    const profiles = await getProfilesByIds(userIds);
    const all = buildAdminLoanRows(loans, profiles);
    rows = estado === "todos" ? all : all.filter((r) => r.estado === estado);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Préstamos</h1>
        <p className="mt-1 text-muted-foreground">
          Todos los préstamos de la biblioteca. Filtra por estado.
        </p>
      </header>

      <nav
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Filtrar por estado"
      >
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "todos" ? "/prestamos" : `/prestamos?estado=${f.key}`
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              estado === f.key
                ? "border-primary bg-primary-soft text-primary"
                : "border-input text-muted-foreground hover:bg-secondary",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {rows === null ? (
        <ErrorState message="No pudimos cargar los préstamos. Inténtalo de nuevo en unos segundos." />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Sin préstamos"
          message="No hay préstamos que coincidan con este filtro."
        />
      ) : (
        <AdminLoansTable rows={rows} />
      )}
    </div>
  );
}
