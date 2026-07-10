import Link from "next/link";
import { Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DISPONIBILIDAD,
  hasActiveFilters,
  type CatalogFilters as Filters,
} from "@/lib/validations/catalog";

/**
 * Barra de búsqueda y filtros del catálogo.
 * Es un `<form method="get">`: al enviarse recarga `/catalogo` con los filtros
 * en la URL (compartible, con historial), sin necesidad de JavaScript de
 * cliente. Omitir el campo `page` reinicia la paginación a 1 al filtrar.
 */

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground";

const DISPONIBILIDAD_LABEL: Record<(typeof DISPONIBILIDAD)[number], string> = {
  todos: "Todos",
  disponibles: "Solo disponibles",
  "no-disponibles": "No disponibles",
};

export interface CatalogFiltersProps {
  filters: Filters;
  facets: { categorias: string[]; ubicaciones: string[] };
}

export function CatalogFilters({ filters, facets }: CatalogFiltersProps) {
  return (
    <form
      method="get"
      className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="sm:col-span-2 lg:col-span-4">
        <Label htmlFor="q">Buscar</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Título, autor o ISBN"
            maxLength={120}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="categoria">Categoría</Label>
        <select
          id="categoria"
          name="categoria"
          defaultValue={filters.categoria}
          className={SELECT_CLASS}
        >
          <option value="">Todas</option>
          {facets.categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="ubicacion">Ubicación</Label>
        <select
          id="ubicacion"
          name="ubicacion"
          defaultValue={filters.ubicacion}
          className={SELECT_CLASS}
        >
          <option value="">Todas</option>
          {facets.ubicaciones.map((ubicacion) => (
            <option key={ubicacion} value={ubicacion}>
              {ubicacion}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="disponibilidad">Disponibilidad</Label>
        <select
          id="disponibilidad"
          name="disponibilidad"
          defaultValue={filters.disponibilidad}
          className={SELECT_CLASS}
        >
          {DISPONIBILIDAD.map((value) => (
            <option key={value} value={value}>
              {DISPONIBILIDAD_LABEL[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1">
          <Search aria-hidden="true" />
          Buscar
        </Button>
        {hasActiveFilters(filters) && (
          <Link
            href="/catalogo"
            className={buttonVariants({ variant: "secondary" })}
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
