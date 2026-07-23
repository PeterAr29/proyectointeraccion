"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Portada de libro del sistema de diseño.
 *
 * Prioridad de imagen: (1) `coverUrl` real (Supabase Storage, subida por admin);
 * (2) carátula de OpenLibrary derivada del `isbn`; (3) marcador con gradiente
 * estable derivado del título (paleta del prototipo). El gradiente se dibuja
 * SIEMPRE de fondo: se ve mientras la imagen carga y queda como respaldo si la
 * imagen no existe o falla (`onError`). Relación de aspecto 2:3.
 */

// Paletas [inicio, fin] del prototipo (design/): 10 combinaciones sobrias.
const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#1e3a8a", "#2563eb"],
  ["#7f1d1d", "#b91c1c"],
  ["#0f766e", "#0d9488"],
  ["#312e81", "#6d28d9"],
  ["#334155", "#475569"],
  ["#9a3412", "#c2410c"],
  ["#14532d", "#16a34a"],
  ["#831843", "#be185d"],
  ["#78350f", "#b45309"],
  ["#155e75", "#0891b2"],
];

/** Hash estable (djb2) para elegir siempre el mismo gradiente por título. */
function gradientIndex(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(hash) % GRADIENTS.length;
}

/**
 * URL de la carátula de OpenLibrary por ISBN. `default=false` hace que devuelva
 * 404 (y por tanto dispare `onError` → respaldo) cuando el libro no tiene
 * portada, en vez de una imagen en blanco. Se limpia el ISBN a dígitos/X.
 */
function openLibraryCover(isbn: string): string | null {
  const clean = isbn.replace(/[^0-9Xx]/g, "");
  if (clean.length !== 10 && clean.length !== 13) return null;
  return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg?default=false`;
}

export interface BookCoverProps {
  /** Título del libro; semilla del gradiente y texto del marcador. */
  title: string;
  /** URL de portada real (Storage); si existe, tiene prioridad. */
  coverUrl?: string | null;
  /** ISBN para intentar la carátula de OpenLibrary si no hay `coverUrl`. */
  isbn?: string | null;
  /** Semilla alternativa para el gradiente (por defecto, el título). */
  seed?: string;
  /** Muestra el título sobre el marcador de gradiente. Por defecto, true. */
  showTitle?: boolean;
  className?: string;
}

export function BookCover({
  title,
  coverUrl,
  isbn,
  seed,
  showTitle = true,
  className,
}: BookCoverProps) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const src = coverUrl ?? (isbn ? openLibraryCover(isbn) : null);
  const showImg = Boolean(src) && !errored;

  const [from, to] = GRADIENTS[gradientIndex(seed ?? title)]!;
  // Cuando hay imagen visible es la portada la que da el nombre accesible (alt);
  // si solo se ve el gradiente, el propio contenedor actúa de imagen etiquetada.
  const a11y = showImg
    ? {}
    : ({ role: "img", "aria-label": `Portada de ${title}` } as const);

  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] w-full flex-col justify-end overflow-hidden rounded-md p-2.5 shadow-sm",
        className,
      )}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      {...a11y}
    >
      {showTitle && !loaded && (
        <span className="line-clamp-3 text-sm font-bold leading-tight text-white drop-shadow-sm">
          {title}
        </span>
      )}
      {showImg && src && (
        // eslint-disable-next-line @next/next/no-img-element -- portadas externas (Storage/OpenLibrary); next/image no aporta aquí y complica la CSP.
        <img
          src={src}
          alt={`Portada de ${title}`}
          loading="lazy"
          onError={() => setErrored(true)}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
