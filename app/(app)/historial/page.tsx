import type { Metadata } from "next";
import Link from "next/link";
import { Clock, SearchX } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoanTable } from "@/components/biblioteca/LoanTable";
import { buttonVariants } from "@/components/ui/button";
import {
  filterLoanHistory,
  listOwnLoansWithBooks,
  paginateList,
  type LoanWithBook,
  type Paged,
} from "@/lib/services/loans";
import { getCirculationSettings } from "@/lib/services/settings";
import {
  hasActiveHistoryFilters,
  parseHistoryFilters,
  type HistoryFilters as Filters,
} from "@/lib/validations/circulation";
import { HistoryFilters } from "./HistoryFilters";
import { Pagination } from "./Pagination";

export const metadata: Metadata = { title: "Historial" };

/**
 * Historial completo de préstamos del usuario (activos, vencidos y devueltos)
 * con filtro por estado y rango de fechas, paginado. Solo lectura, vía
 * `lib/services/loans` (RLS garantiza que solo ve lo suyo). Reusa `LoanTable`
 * sin acciones. Cuatro estados: carga (`loading.tsx`), error, vacío y datos.
 */
export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseHistoryFilters(await searchParams);
  const [items, settings] = await Promise.all([
    listOwnLoansWithBooks(true),
    getCirculationSettings(),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
        <p className="mt-1 text-muted-foreground">
          Todos tus préstamos: activos, vencidos y devueltos. Filtra por estado
          o por fechas.
        </p>
      </header>

      <HistoryFilters filters={filters} />

      <div className="mt-6">
        {items === null ? (
          <ErrorState message="No pudimos cargar tu historial. Inténtalo de nuevo en unos segundos." />
        ) : items.length === 0 ? (
          <EmptyHistory filtered={false} />
        ) : (
          <HistoryResults
            page={paginateList(filterLoanHistory(items, filters), filters.page)}
            filters={filters}
            maxRenovaciones={settings.maxRenovaciones}
          />
        )}
      </div>
    </div>
  );
}

function HistoryResults({
  page,
  filters,
  maxRenovaciones,
}: {
  page: Paged<LoanWithBook>;
  filters: Filters;
  maxRenovaciones: number;
}) {
  if (page.total === 0) {
    return <EmptyHistory filtered={hasActiveHistoryFilters(filters)} />;
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        {page.total} {page.total === 1 ? "préstamo" : "préstamos"} en el
        historial
      </p>
      <LoanTable
        items={page.items}
        maxRenovaciones={maxRenovaciones}
        withActions={false}
      />
      <Pagination
        filters={filters}
        page={page.page}
        totalPages={page.totalPages}
      />
    </>
  );
}

function EmptyHistory({ filtered }: { filtered: boolean }) {
  return (
    <div>
      <EmptyState
        icon={filtered ? SearchX : Clock}
        title={filtered ? "Sin resultados" : "Aún no tienes historial"}
        message={
          filtered
            ? "Ningún préstamo coincide con los filtros. Prueba con otro estado o rango de fechas."
            : "Cuando prestes libros del catálogo, tu historial de préstamos aparecerá aquí."
        }
      />
      <div className="flex justify-center">
        {filtered ? (
          <Link
            href="/historial"
            className={buttonVariants({ variant: "secondary" })}
          >
            Limpiar filtros
          </Link>
        ) : (
          <Link
            href="/catalogo"
            className={buttonVariants({ variant: "primary" })}
          >
            Explorar el catálogo
          </Link>
        )}
      </div>
    </div>
  );
}
