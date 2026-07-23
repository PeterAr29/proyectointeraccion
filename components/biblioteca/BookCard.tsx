import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { BookCover } from "@/components/biblioteca/BookCover";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import type { Book } from "@/lib/services/books";

/**
 * Tarjeta de libro del catálogo: portada, insignia de disponibilidad, título y
 * autor. Presentacional (sin estado). Si recibe `href` se vuelve navegable
 * (el detalle llega en F2.2); sin `href` es una tarjeta estática, para no
 * enlazar a rutas que aún no existen.
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
  const baseClass = "flex flex-col rounded-lg border bg-card p-3";

  const content = (
    <>
      <div className="relative">
        <BookCover
          title={book.titulo}
          coverUrl={book.portada_url}
          isbn={book.isbn}
          className="w-full"
        />
        <StatusBadge
          status={disponible ? "disponible" : "prestado"}
          label={disponible ? "Disponible" : "No disponible"}
          className="absolute right-2 top-2 shadow-sm"
        />
      </div>
      <div className="mt-3 min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
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
          "transition-colors hover:border-primary focus-visible:border-primary",
        )}
      >
        {content}
      </Link>
    );
  }

  return <article className={baseClass}>{content}</article>;
}
