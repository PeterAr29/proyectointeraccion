import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { BookCard } from "@/components/biblioteca/BookCard";
import type { Book } from "@/lib/services/books";
import type { LoanWithBook } from "@/lib/services/loans";
import { daysBetween, formatDate } from "@/lib/utils/dates";

const TZ = "America/Lima";

/**
 * Piezas presentacionales del tablero de Inicio (Server Components, sin estado).
 * La obtención de datos vive en `app/(app)/inicio/page.tsx`; aquí solo se pinta.
 */

// ---------------------------------------------------------------------------
// Cabecera
// ---------------------------------------------------------------------------

export function Hero({
  nombre,
  esBibliotecario,
}: {
  nombre: string;
  esBibliotecario: boolean;
}) {
  const fecha = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(new Date());

  const cta = esBibliotecario
    ? { href: "/dashboard", label: "Ir al panel" }
    : { href: "/catalogo", label: "Explorar el catálogo" };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-indigo-700 p-8 text-primary-foreground shadow-lg sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/5"
      />
      <BookOpen
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 -right-4 h-40 w-40 text-white/10"
        strokeWidth={1.25}
      />

      <div className="relative max-w-2xl">
        <p className="text-sm font-medium text-primary-foreground/85 first-letter:uppercase">
          {fecha}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hola, {nombre}
          </h1>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            {esBibliotecario ? "Personal de biblioteca" : "Estudiante"}
          </span>
        </div>
        <p className="mt-3 max-w-xl text-primary-foreground/85">
          {esBibliotecario
            ? "Gestiona el catálogo, la circulación y los reportes de BiblioTEC desde un solo lugar."
            : "Tu biblioteca universitaria, siempre a mano. Aquí gestionas tus préstamos, reservas y favoritos."}
        </p>
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform hover:translate-y-px hover:bg-white/95"
        >
          {cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tarjetas de estadística
// ---------------------------------------------------------------------------

const TONES = {
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
} as const;

export type StatTone = keyof typeof TONES;

export function StatCard({
  href,
  icon: Icon,
  tone,
  value,
  label,
}: {
  href: string;
  icon: LucideIcon;
  tone: StatTone;
  value: number | null;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm ring-1 ring-black/[0.02] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-transparent transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value ?? "—"}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Próxima devolución (estudiante)
// ---------------------------------------------------------------------------

export function DueSoon({ item }: { item: LoanWithBook }) {
  const dias = daysBetween(new Date(), item.loan.fecha_devolucion_estimada);
  const plural = (n: number) => (n === 1 ? "" : "s");
  const badge =
    dias < 0
      ? {
          text: `Venció hace ${Math.abs(dias)} día${plural(Math.abs(dias))}`,
          cls: "bg-destructive/10 text-destructive",
        }
      : dias === 0
        ? { text: "Vence hoy", cls: "bg-amber-100 text-amber-800" }
        : {
            text: `Faltan ${dias} día${plural(dias)}`,
            cls: "bg-primary-soft text-primary",
          };

  return (
    <Link
      href="/mis-prestamos"
      className="group flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <CalendarClock className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Próxima devolución
        </p>
        <p className="truncate font-semibold">
          {item.book?.titulo ?? "Libro prestado"}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(item.loan.fecha_devolucion_estimada)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}
      >
        {badge.text}
      </span>
      <ArrowRight
        className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        aria-hidden="true"
      />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Recomendados para ti (estudiante)
// ---------------------------------------------------------------------------

export function RecommendedStrip({
  books,
  carrera,
}: {
  books: Book[];
  carrera: string | null;
}) {
  if (books.length === 0) return null;

  return (
    <section aria-labelledby="recomendados">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="recomendados"
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
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver catálogo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard book={book} href={`/catalogo/${book.id}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
