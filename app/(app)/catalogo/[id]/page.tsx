import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { BookCover } from "@/components/biblioteca/BookCover";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { FavoriteButton } from "@/components/biblioteca/FavoriteButton";
import { buttonVariants } from "@/components/ui/button";
import {
  getBookById,
  isAvailable,
  isFavorite,
  type Book,
} from "@/lib/services/books";
import { parseBookId } from "@/lib/validations/catalog";

export const metadata: Metadata = { title: "Detalle del libro" };

/**
 * Detalle de un libro del catálogo: portada, metadatos, descripción,
 * disponibilidad y favoritos. Server Component que consume `books` solo vía
 * `lib/services/books`. La transacción de préstamo/reserva es del módulo C:
 * aquí el botón queda deshabilitado con una explicación.
 */
export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const validId = parseBookId(id);
  const book = validId ? await getBookById(validId) : null;

  if (!book) {
    return (
      <div className="mx-auto max-w-4xl">
        <BackLink />
        <ErrorState
          title="Libro no encontrado"
          message="El libro que buscas no existe o fue retirado del catálogo."
        />
      </div>
    );
  }

  const favorite = await isFavorite(book.id);

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink />

      <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
        <div className="mx-auto w-full max-w-[220px] sm:mx-0">
          <BookCover
            title={book.titulo}
            coverUrl={book.portada_url}
            showTitle={!book.portada_url}
          />
        </div>

        <div className="min-w-0">
          <Availability book={book} />

          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            {book.titulo}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">{book.autor}</p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Meta label="Editorial" value={book.editorial} />
            <Meta label="Año" value={book.anio?.toString()} />
            <Meta label="ISBN" value={book.isbn} />
            <Meta label="Categoría" value={book.categoria} />
            <Meta label="Ubicación" value={book.ubicacion} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <LoanAction available={isAvailable(book)} />
            <FavoriteButton bookId={book.id} initialFavorite={favorite} />
          </div>
        </div>
      </div>

      {book.descripcion && (
        <section className="mt-8 rounded-lg border bg-card p-5">
          <h2 className="mb-2 text-lg font-bold">Descripción</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {book.descripcion}
          </p>
        </section>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/catalogo"
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Volver al catálogo
    </Link>
  );
}

function Availability({ book }: { book: Book }) {
  const available = isAvailable(book);
  return (
    <div className="flex items-center gap-3">
      <StatusBadge
        status={available ? "disponible" : "prestado"}
        label={available ? "Disponible" : "No disponible"}
      />
      <span className="text-sm text-muted-foreground">
        {book.cantidad_disponible} de {book.cantidad_total}{" "}
        {book.cantidad_total === 1 ? "ejemplar" : "ejemplares"} disponible
        {book.cantidad_disponible === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

/**
 * Acción de préstamo/reserva. Deshabilitada en F2.2: el flujo transaccional
 * (validar stock, decrementar disponibilidad) es del módulo C. Se muestra
 * deshabilitada con una explicación para no prometer algo que aún no ocurre.
 */
function LoanAction({ available }: { available: boolean }) {
  const label = available ? "Prestar" : "Reservar";
  return (
    <span
      title="Disponible próximamente, con el módulo de circulación."
      className="cursor-not-allowed"
    >
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={buttonVariants({ variant: "primary" })}
      >
        {label}
      </button>
    </span>
  );
}
