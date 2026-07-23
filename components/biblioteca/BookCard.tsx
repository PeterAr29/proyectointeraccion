import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { BookCover } from "@/components/biblioteca/BookCover";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import type { Book } from "@/lib/services/books";

/**
 * Tarjeta de libro del catálogo: portada, insignia de disponibilidad, título y
 * autor. Presentacional (sin estado). Si recibe `href` se vuelve navegable, con
 * elevación y zoom sutil de la portada al pasar el cursor; sin `href` es una
 * tarjeta estática, para no enlazar a rutas que aún no existen.
 */
export interface BookCardProps {
  book: Pick<
    Book,
    "id" | "titulo" | "autor" | "portada_url" | "cantidad_disponible" | "isbn"
  >;
  href?: string;
}

export function BookCard({ book, href }: BookCardProps) {
  const disponible = book.cantidad_disponible > 0;
  const baseClass =
    "group flex flex-col rounded-2xl border bg-card p-2.5 shadow-sm transition-all duration-200";

  const content = (
    <>
      <div className="relative overflow-hidden rounded-xl ring-1 ring-black/5">
        <div className="transition-transform duration-300 group-hover:scale-[1.04]">
          <BookCover
            title={book.titulo}
            coverUrl={book.portada_url}
            isbn={book.isbn}
            className="w-full rounded-none shadow-none"
          />
        </div>
        <StatusBadge
          status={disponible ? "disponible" : "prestado"}
          label={disponible ? "Disponible" : "No disponible"}
          className="absolute right-2 top-2 shadow-sm ring-1 ring-black/5 backdrop-blur-sm"
        />
      </div>
      <div className="mt-3 min-w-0 px-1 pb-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {book.titulo}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {book.autor}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          baseClass,
          "hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:border-primary",
        )}
      >
        {content}
      </Link>
    );
  }

  return <article className={baseClass}>{content}</article>;
}
