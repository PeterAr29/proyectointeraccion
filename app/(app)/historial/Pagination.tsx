import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { HistoryFilters } from "@/lib/validations/circulation";

/**
 * Paginación del historial. Construye enlaces que preservan los filtros
 * vigentes cambiando solo la página (navegación compartible y con botón "atrás").
 */

/** URL de `/historial` con los filtros actuales y la página indicada. */
function hrefForPage(filters: HistoryFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.estado !== "todos") params.set("estado", filters.estado);
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/historial?${qs}` : "/historial";
}

export interface PaginationProps {
  filters: HistoryFilters;
  page: number;
  totalPages: number;
}

export function Pagination({ filters, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const linkClass = buttonVariants({ variant: "secondary", size: "sm" });
  const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

  return (
    <nav
      className="mt-6 flex items-center justify-center gap-4"
      aria-label="Paginación del historial"
    >
      {hasPrev ? (
        <Link
          href={hrefForPage(filters, page - 1)}
          className={linkClass}
          rel="prev"
        >
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          <ChevronLeft aria-hidden="true" />
          Anterior
        </span>
      )}

      <span className="text-sm text-muted-foreground" aria-current="page">
        Página {page} de {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={hrefForPage(filters, page + 1)}
          className={linkClass}
          rel="next"
        >
          Siguiente
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Siguiente
          <ChevronRight aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
