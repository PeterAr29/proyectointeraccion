import { cn } from "@/lib/utils/cn";

/**
 * Insignia de estado (metáfora de "semáforo") del sistema de diseño.
 * Traduce los estados del dominio a un color y una etiqueta legible.
 * Los estados coinciden con los enums de la BD (loan/reservation/fine) más
 * la disponibilidad derivada de un libro.
 */
export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

/** Estados canónicos que entiende la insignia (en minúscula, como los enums). */
export type BadgeStatus =
  // disponibilidad de libro
  | "disponible"
  | "reservado"
  | "prestado"
  // préstamo (loan_status + estado derivado de devolución en 2 pasos)
  | "activo"
  | "vencido"
  | "devuelto"
  | "pendiente_devolucion"
  // reserva (reservation_status)
  | "activa"
  | "cumplida"
  | "cancelada"
  // multa (fine_status)
  | "pendiente"
  | "pagada";

const STATUS_MAP: Record<BadgeStatus, { label: string; tone: BadgeTone }> = {
  disponible: { label: "Disponible", tone: "success" },
  reservado: { label: "Reservado", tone: "warning" },
  prestado: { label: "Prestado", tone: "danger" },
  activo: { label: "Activo", tone: "info" },
  vencido: { label: "Vencido", tone: "danger" },
  devuelto: { label: "Devuelto", tone: "success" },
  pendiente_devolucion: {
    label: "Devolución solicitada",
    tone: "warning",
  },
  activa: { label: "Activa", tone: "warning" },
  cumplida: { label: "Cumplida", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
  pendiente: { label: "Pendiente", tone: "warning" },
  pagada: { label: "Pagada", tone: "success" },
};

// Colores suaves con texto oscuro: contraste AA sobre el fondo del pill.
// El ring de igual matiz define el borde del pill sobre fondos claros.
const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-green-100 text-green-800 ring-green-600/20",
  warning: "bg-amber-100 text-amber-800 ring-amber-600/20",
  danger: "bg-red-100 text-red-800 ring-red-600/20",
  info: "bg-blue-100 text-blue-800 ring-blue-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export interface StatusBadgeProps {
  /** Estado del dominio; si no está en el mapa se muestra tal cual en tono neutral. */
  status: BadgeStatus | string;
  /** Sobrescribe la etiqueta mostrada. */
  label?: string;
  /** Sobrescribe el tono de color. */
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: StatusBadgeProps) {
  const known = STATUS_MAP[status as BadgeStatus];
  const resolvedTone = tone ?? known?.tone ?? "neutral";
  const resolvedLabel = label ?? known?.label ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        TONE_CLASSES[resolvedTone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-75"
      />
      {resolvedLabel}
    </span>
  );
}
