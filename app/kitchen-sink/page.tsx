import type { Metadata } from "next";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { BookCover } from "@/components/biblioteca/BookCover";
import {
  BookCardSkeleton,
  Skeleton,
  TableRowSkeleton,
} from "@/components/feedback/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InteractiveShowcase } from "./InteractiveShowcase";

export const metadata: Metadata = {
  title: "Kitchen Sink",
  description: "Catálogo visual de los componentes del sistema de diseño.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

const BOOK_STATUSES = ["disponible", "reservado", "prestado"] as const;
const LOAN_STATUSES = ["activo", "vencido", "devuelto"] as const;
const FINE_STATUSES = ["pendiente", "pagada"] as const;

const DEMO_BOOKS = [
  "Bases de Datos",
  "Sistemas Operativos Modernos",
  "Inteligencia Artificial",
  "Redes de Computadoras",
];

export default function KitchenSinkPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Sistema de diseño</h1>
        <p className="mt-2 text-muted-foreground">
          Catálogo visual de los componentes reutilizables de BiblioTEC (F1.3).
          Todo lo que ves aquí lo reutilizan los módulos de catálogo,
          circulación, multas y administración.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <Section title="Botones">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="danger">Peligro</Button>
            <Button variant="warning">Advertencia</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Enlace</Button>
            <Button disabled>Deshabilitado</Button>
            <Button size="sm">
              <Heart /> Con icono
            </Button>
          </div>
        </Section>

        <Section title="Insignias de estado (semáforo)">
          <div className="flex flex-col gap-4">
            <StatusRow label="Libro" statuses={BOOK_STATUSES} />
            <StatusRow label="Préstamo" statuses={LOAN_STATUSES} />
            <StatusRow label="Multa" statuses={FINE_STATUSES} />
          </div>
        </Section>

        <Section title="Portadas de libro">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {DEMO_BOOKS.map((title) => (
              <div key={title} className="w-full max-w-[160px]">
                <BookCover title={title} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Estado de carga (skeleton)">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <BookCardSkeleton />
              <BookCardSkeleton />
            </div>
            <div className="rounded-lg border">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <div className="p-4">
                <Skeleton className="h-8 w-40" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Estado vacío">
          <EmptyState
            icon={Search}
            title="No se encontraron resultados"
            message="Intenta con otras palabras clave o quita algún filtro."
          />
        </Section>

        <Section title="Estado de error">
          <ErrorState />
        </Section>

        <Section title="Componentes interactivos">
          <InteractiveShowcase />
        </Section>
      </div>
    </main>
  );
}

function StatusRow({
  label,
  statuses,
}: {
  label: string;
  statuses: readonly string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-24 text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
}
