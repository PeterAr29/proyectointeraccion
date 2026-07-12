import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Clock,
  Heart,
  LayoutGrid,
  LibraryBig,
  Users,
  type LucideIcon,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/services/users";

export const metadata: Metadata = { title: "Inicio" };

interface QuickLink {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const STUDENT_LINKS: QuickLink[] = [
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

const LIBRARIAN_LINKS: QuickLink[] = [
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

/**
 * Pantalla de inicio del shell. Cabecera de bienvenida y accesos rápidos que
 * navegan de verdad, adaptados al rol (estudiante o bibliotecario).
 */
export default async function InicioPage() {
  const profile = await getCurrentProfile();
  const nombreCorto = profile?.nombre.split(" ")[0] ?? "";
  const esBibliotecario = profile?.rol === "bibliotecario";
  const links = esBibliotecario ? LIBRARIAN_LINKS : STUDENT_LINKS;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Cabecera de bienvenida */}
      <section className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.35), transparent 40%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            {esBibliotecario ? "Personal de biblioteca" : "Estudiante"}
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Hola, {nombreCorto}
          </h1>
          <p className="mt-2 max-w-xl text-primary-foreground/80">
            {esBibliotecario
              ? "Gestiona el catálogo, la circulación y los reportes de BiblioTEC desde un solo lugar."
              : "Bienvenida/o a BiblioTEC. Aquí gestionas tus préstamos, reservas y favoritos de la biblioteca universitaria."}
          </p>
        </div>
      </section>

      {/* Accesos rápidos */}
      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
      className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary hover:bg-primary-soft"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
