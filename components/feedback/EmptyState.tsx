import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Estado vacío del sistema de diseño: se muestra cuando una consulta es válida
 * pero no devuelve datos (catálogo sin resultados, sin favoritos, etc.).
 * Distinto de ErrorState (algo falló) y del estado de carga.
 */
export interface EmptyStateProps {
  /** Icono ilustrativo (lucide). Por defecto, una bandeja vacía. */
  icon?: LucideIcon;
  /** Título breve, en español. */
  title: string;
  /** Mensaje de apoyo opcional que orienta al usuario. */
  message?: string;
  /** Acción sugerida opcional (p. ej. "Ir al catálogo"). */
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <Icon
        className="mb-4 h-16 w-16 text-muted-foreground/40"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-lg font-bold text-foreground">{title}</p>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
