import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  CalendarClock,
  Clock,
  Heart,
  LayoutGrid,
  LibraryBig,
  Users,
  type LucideIcon,
} from "lucide-react";

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
        <p className="text-sm font-medium text-primary-foreground/70 first-letter:uppercase">
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
      className="group flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight sm:text-3xl">
          {value ?? "—"}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
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
        className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline ${badge.cls}`}
      >
        {badge.text}
      </span>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Accesos rápidos
// ---------------------------------------------------------------------------

export interface QuickLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function QuickAccess({ links }: { links: QuickLink[] }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Accesos rápidos
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <QuickCard key={link.href} link={link} />
        ))}
      </div>
    </div>
  );
}

function QuickCard({ link }: { link: QuickLink }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary-soft"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{link.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {link.description}
        </p>
      </div>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

export const STUDENT_LINKS: QuickLink[] = [
  {
    href: "/catalogo",
    title: "Explorar el catálogo",
    description: "Busca libros por título, autor o ISBN.",
    icon: BookOpen,
  },
  {
    href: "/mis-prestamos",
    title: "Mis préstamos",
    description: "Renueva o devuelve tus libros a tiempo.",
    icon: BookMarked,
  },
  {
    href: "/favoritos",
    title: "Favoritos",
    description: "Los libros que guardaste para después.",
    icon: Heart,
  },
  {
    href: "/historial",
    title: "Historial",
    description: "Revisa tus préstamos anteriores.",
    icon: Clock,
  },
];

export const LIBRARIAN_LINKS: QuickLink[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Indicadores clave de la biblioteca.",
    icon: LayoutGrid,
  },
  {
    href: "/libros",
    title: "Gestión de libros",
    description: "Crea, edita y da de baja el catálogo.",
    icon: LibraryBig,
  },
  {
    href: "/usuarios",
    title: "Usuarios",
    description: "Administra las cuentas de la comunidad.",
    icon: Users,
  },
  {
    href: "/reportes",
    title: "Reportes",
    description: "Préstamos, libros y multas en cifras.",
    icon: BarChart3,
  },
];
