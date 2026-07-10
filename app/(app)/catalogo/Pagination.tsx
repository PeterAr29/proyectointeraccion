import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { CatalogFilters } from "@/lib/validations/catalog";

/**
 * Controles de paginación del catálogo. Construye enlaces que preservan los
 * filtros vigentes cambiando solo la página, para que la navegación sea
 * compartible y funcione con el botón "atrás" del navegador.
 */

/** URL de `/catalogo` con los filtros actuales y la página indicada. */
function hrefForPage(filters: CatalogFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.ubicacion) params.set("ubicacion", filters.ubicacion);
  if (filters.disponibilidad !== "todos") {
    params.set("disponibilidad", filters.disponibilidad);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

export interface PaginationProps {
  filters: CatalogFilters;
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
      aria-label="Paginación del catálogo"
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
