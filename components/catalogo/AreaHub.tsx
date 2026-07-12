import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  HeartPulse,
  Layers,
  Search,
  Sprout,
  Users2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { AREAS, type AreaLabel } from "@/lib/domain/areas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Hub del catálogo: entrada por ÁREAS académicas. Muestra un buscador global y
 * una tarjeta por área con su número de libros. Si el estudiante tiene carrera,
 * su área se destaca arriba (personalización). Cada tarjeta enlaza al listado
 * filtrado por esa área (`/catalogo?categoria=<área>`).
 */

const AREA_STYLE: Record<
  AreaLabel,
  { icon: LucideIcon; chip: string; ring: string }
> = {
  "Ingeniería y Tecnología": {
    icon: Wrench,
    chip: "bg-sky-100 text-sky-700",
    ring: "hover:border-sky-300",
  },
  "Ciencias Agrarias": {
    icon: Sprout,
    chip: "bg-emerald-100 text-emerald-700",
    ring: "hover:border-emerald-300",
  },
  "Ciencias de la Salud": {
    icon: HeartPulse,
    chip: "bg-rose-100 text-rose-700",
    ring: "hover:border-rose-300",
  },
  "Ciencias Empresariales": {
    icon: BriefcaseBusiness,
    chip: "bg-amber-100 text-amber-700",
    ring: "hover:border-amber-300",
  },
  "Ciencias Sociales": {
    icon: Users2,
    chip: "bg-violet-100 text-violet-700",
    ring: "hover:border-violet-300",
  },
};

function areaHref(label: string) {
  return `/catalogo?categoria=${encodeURIComponent(label)}`;
}

function librosLabel(n: number) {
  return `${n} ${n === 1 ? "libro" : "libros"}`;
}

export interface AreaHubProps {
  counts: Record<string, number>;
  /** Área de la carrera del estudiante, si se conoce (para destacarla). */
  userArea: AreaLabel | null;
}

export function AreaHub({ counts, userArea }: AreaHubProps) {
  return (
    <div className="space-y-8">
      {/* Buscador global (recae en el listado con ?q=) */}
      <form method="get" action="/catalogo">
        <label htmlFor="q" className="sr-only">
          Buscar en todo el catálogo
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="q"
              name="q"
              type="search"
              placeholder="Buscar por título, autor o ISBN en todo el catálogo"
              maxLength={120}
              className="pl-9"
            />
          </div>
          <Button type="submit">
            <Search aria-hidden="true" />
            Buscar
          </Button>
        </div>
      </form>

      {/* Área de la carrera del estudiante */}
      {userArea && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tu área
          </h2>
          <FeaturedArea label={userArea} count={counts[userArea] ?? 0} />
        </section>
      )}

      {/* Todas las áreas */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explora por área
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => (
            <AreaCard
              key={area.slug}
              label={area.label}
              descripcion={area.descripcion}
              count={counts[area.label] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeaturedArea({ label, count }: { label: AreaLabel; count: number }) {
  const style = AREA_STYLE[label];
  const Icon = style.icon;
  return (
    <Link
      href={areaHref(label)}
      className="group flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-primary-soft to-card p-5 shadow-sm transition-colors hover:border-primary"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.chip}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">
          Recomendado según tu carrera · {librosLabel(count)}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        Ver libros
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function AreaCard({
  label,
  descripcion,
  count,
}: {
  label: AreaLabel;
  descripcion: string;
  count: number;
}) {
  const style = AREA_STYLE[label];
  const Icon = style.icon;
  return (
    <Link
      href={areaHref(label)}
      className={`group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${style.ring}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.chip}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {librosLabel(count)}
        </span>
      </div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
        Ver libros
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

/** Chip de encabezado del listado cuando se navega dentro de un área. */
export function AreaBreadcrumb({ label }: { label?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      >
        <Layers className="h-4 w-4" aria-hidden="true" />
        Áreas
      </Link>
      {label && (
        <>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{label}</span>
        </>
      )}
    </div>
  );
}
