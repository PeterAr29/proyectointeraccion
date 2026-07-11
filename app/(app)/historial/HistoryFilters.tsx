import Link from "next/link";
import { Filter } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HISTORY_ESTADOS,
  hasActiveHistoryFilters,
  type HistoryEstado,
  type HistoryFilters as Filters,
} from "@/lib/validations/circulation";

/**
 * Filtros del historial de préstamos (estado + rango de fechas).
 * Es un `<form method="get">`: al enviarse recarga `/historial` con los filtros
 * en la URL (compartible, con historial de navegador) sin JavaScript de cliente.
 * Omitir el campo `page` reinicia la paginación a 1 al filtrar.
 */

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground";

const ESTADO_LABEL: Record<HistoryEstado, string> = {
  todos: "Todos",
  activo: "Activo",
  vencido: "Vencido",
  devuelto: "Devuelto",
};

export function HistoryFilters({ filters }: { filters: Filters }) {
  return (
    <form
      method="get"
      className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="estado">Estado</Label>
        <select
          id="estado"
          name="estado"
          defaultValue={filters.estado}
          className={SELECT_CLASS}
        >
          {HISTORY_ESTADOS.map((value) => (
            <option key={value} value={value}>
              {ESTADO_LABEL[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="desde">Desde</Label>
        <Input
          id="desde"
          name="desde"
          type="date"
          defaultValue={filters.desde}
        />
      </div>

      <div>
        <Label htmlFor="hasta">Hasta</Label>
        <Input
          id="hasta"
          name="hasta"
          type="date"
          defaultValue={filters.hasta}
        />
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit" className="flex-1">
          <Filter aria-hidden="true" />
          Filtrar
        </Button>
        {hasActiveHistoryFilters(filters) && (
          <Link
            href="/historial"
            className={buttonVariants({ variant: "secondary" })}
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
