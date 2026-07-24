import Link from "next/link";
import { ArrowRight, Layers, Search, Sparkles } from "lucide-react";

import { AREAS, type AreaLabel } from "@/lib/domain/areas";
import { AREA_STYLE } from "@/components/catalogo/areaStyle";
import { BookCard } from "@/components/biblioteca/BookCard";
import type { Book } from "@/lib/services/books";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Hub del catálogo: entrada por ÁREAS académicas. Muestra un buscador global y
 * una tarjeta por área con su número de libros. Si el estudiante tiene carrera,
 * su área se destaca arriba (personalización). Cada tarjeta enlaza al listado
 * filtrado por esa área (`/catalogo?categoria=<área>`). El color de cada área
 * viene de la paleta académica compartida (`areaStyle.ts`).
 */

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
  /** Libros recomendados (por el área de la carrera), mostrados al entrar. */
  recommendedBooks: Book[];
  /** Nombre de la carrera del estudiante, para el subtítulo de recomendados. */
  carrera: string | null;
}

export function AreaHub({
  counts,
  userArea,
  recommendedBooks,
  carrera,
}: AreaHubProps) {
  return (
    <div className="space-y-10">
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

      {/* Recomendados por la carrera del estudiante (lo primero al entrar) */}
      {recommendedBooks.length > 0 && (
        <section aria-labelledby="recomendados-catalogo">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2
              id="recomendados-catalogo"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Recomendados para ti
              {carrera && (
                <span className="hidden font-medium normal-case text-muted-foreground/80 sm:inline">
                  · {carrera}
                </span>
              )}
            </h2>
            {userArea && (
              <Link
                href={areaHref(userArea)}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver más de tu área
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommendedBooks.map((book) => (
              <li key={book.id}>
                <BookCard book={book} href={`/catalogo/${book.id}`} />
              </li>
            ))}
          </ul>
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
              highlight={area.label === userArea}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function AreaCard({
  label,
  descripcion,
  count,
  highlight,
}: {
  label: AreaLabel;
  descripcion: string;
  count: number;
  highlight: boolean;
}) {
  const style = AREA_STYLE[label];
  const Icon = style.icon;
  return (
    <Link
      href={areaHref(label)}
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 pt-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        highlight ? "border-primary ring-1 ring-primary/30" : style.ring
      }`}
    >
      {/* Barra de acento con el color del área */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1.5 ${style.bar}`}
      />
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.chip}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {highlight ? (
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            Tu área
          </span>
        ) : (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {librosLabel(count)}
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
      <span
        className={`mt-auto inline-flex items-center gap-1 text-sm font-medium ${style.accent}`}
      >
        {highlight ? `Ver libros · ${librosLabel(count)}` : "Ver libros"}
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
  const style =
    label && label in AREA_STYLE ? AREA_STYLE[label as AreaLabel] : null;
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
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            {style && (
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${style.bar}`}
              />
            )}
            {label}
          </span>
        </>
      )}
    </div>
  );
}
