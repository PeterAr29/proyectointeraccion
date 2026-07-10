import { cn } from "@/lib/utils/cn";

/**
 * Portada de libro del sistema de diseño.
 * Si el libro tiene `coverUrl` la muestra; si no, dibuja un marcador con
 * gradiente derivado de forma estable del título/seed (paleta del prototipo).
 * Relación de aspecto 2:3 (proporción de un libro).
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

export interface BookCoverProps {
  /** Título del libro; se usa como semilla del gradiente y como texto del marcador. */
  title: string;
  /** URL de portada real (opcional); si existe, tiene prioridad sobre el marcador. */
  coverUrl?: string | null;
  /** Semilla alternativa para el gradiente (por defecto, el título). */
  seed?: string;
  /** Muestra el título sobre el marcador de gradiente. Por defecto, true. */
  showTitle?: boolean;
  className?: string;
}

export function BookCover({
  title,
  coverUrl,
  seed,
  showTitle = true,
  className,
}: BookCoverProps) {
  const base = cn(
    "relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-sm",
    className,
  );

  if (coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- portadas externas de Supabase Storage; next/image se evalúa en F2.
      <img
        src={coverUrl}
        alt={`Portada de ${title}`}
        className={cn(base, "object-cover")}
      />
    );
  }

  const [from, to] = GRADIENTS[gradientIndex(seed ?? title)]!;
  return (
    <div
      className={cn(base, "flex flex-col justify-end p-2.5")}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      role="img"
      aria-label={`Portada de ${title}`}
    >
      {showTitle && (
        <span className="line-clamp-3 text-sm font-bold leading-tight text-white">
          {title}
        </span>
      )}
    </div>
  );
}
