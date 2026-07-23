"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import {
  DISPONIBILIDAD,
  hasActiveFilters,
  type CatalogFilters as Filters,
} from "@/lib/validations/catalog";

/**
 * Barra de búsqueda + filtros del catálogo, EN LÍNEA (los filtros van al lado
 * del buscador). Filtra EN TIEMPO REAL: al cambiar un `select` (p. ej. Área) o
 * al escribir en la búsqueda (con debounce) navega solo a `/catalogo?...`, sin
 * necesidad de pulsar un botón. La fuente de datos sigue siendo el servidor
 * (`lib/services/books` vía la URL): este componente solo reescribe la query.
 * `Enter` en el buscador o el botón (accesible) fuerzan la navegación al vuelo.
 */

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground sm:w-auto";

const DISPONIBILIDAD_LABEL: Record<(typeof DISPONIBILIDAD)[number], string> = {
  todos: "Disponibilidad: todas",
  disponibles: "Solo disponibles",
  "no-disponibles": "No disponibles",
};

/**
 * Reconstruye la query del catálogo a partir de los filtros actuales y un
 * cambio parcial. Omite `page` (cualquier cambio de filtro reinicia a la 1) y
 * los valores por defecto (para mantener la URL limpia). Pura y sin efectos.
 */
function buildCatalogQuery(filters: Filters, next: Partial<Filters>): string {
  const merged = { ...filters, ...next };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.categoria) params.set("categoria", merged.categoria);
  if (merged.ubicacion) params.set("ubicacion", merged.ubicacion);
  if (merged.disponibilidad !== "todos") {
    params.set("disponibilidad", merged.disponibilidad);
  }
  return params.toString();
}

export interface CatalogFiltersProps {
  filters: Filters;
  facets: { categorias: string[]; ubicaciones: string[] };
}

export function CatalogFilters({ filters, facets }: CatalogFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // El texto de búsqueda es controlado localmente para poder aplicar debounce;
  // los selects se controlan directamente por la URL (cambian solo al navegar).
  const [q, setQ] = useState(filters.q);

  // Si la URL cambia por fuera (atrás, "Limpiar"), re-sincroniza el input.
  useEffect(() => {
    setQ(filters.q);
  }, [filters.q]);

  function apply(next: Partial<Filters>) {
    const qs = buildCatalogQuery(filters, next);
    startTransition(() => router.push(qs ? `/catalogo?${qs}` : "/catalogo"));
  }

  // Búsqueda en tiempo real: espera a que el usuario deje de escribir (350 ms).
  useEffect(() => {
    if (q === filters.q) return;
    const id = setTimeout(() => {
      const qs = buildCatalogQuery(filters, { q });
      startTransition(() => router.push(qs ? `/catalogo?${qs}` : "/catalogo"));
    }, 350);
    return () => clearTimeout(id);
  }, [q, filters, router]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply({ q });
      }}
      className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center"
      aria-busy={pending}
    >
      <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
        <label htmlFor="q" className="sr-only">
          Buscar
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="q"
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Título, autor o ISBN"
          maxLength={120}
          className="pl-9 pr-9"
        />
        {pending && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        {/* Acción accesible: Enter en el buscador ya envía; este botón la expone
            a lectores de pantalla sin ocupar espacio visual. */}
        <button type="submit" className="sr-only">
          Buscar
        </button>
      </div>

      <select
        aria-label="Filtrar por área"
        value={filters.categoria}
        onChange={(e) => apply({ categoria: e.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Todas las áreas</option>
        {facets.categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por ubicación"
        value={filters.ubicacion}
        onChange={(e) => apply({ ubicacion: e.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Toda ubicación</option>
        {facets.ubicaciones.map((ubicacion) => (
          <option key={ubicacion} value={ubicacion}>
            {ubicacion}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por disponibilidad"
        value={filters.disponibilidad}
        onChange={(e) =>
          apply({ disponibilidad: e.target.value as Filters["disponibilidad"] })
        }
        className={SELECT_CLASS}
      >
        {DISPONIBILIDAD.map((value) => (
          <option key={value} value={value}>
            {DISPONIBILIDAD_LABEL[value]}
          </option>
        ))}
      </select>

      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.push("/catalogo"));
          }}
          className={buttonVariants({ variant: "secondary" })}
        >
          <X aria-hidden="true" />
          Limpiar
        </button>
      )}
    </form>
  );
}
