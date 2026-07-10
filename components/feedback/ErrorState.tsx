import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Estado de error del sistema de diseño: se muestra cuando una carga falla.
 * Nunca expone el error técnico crudo al usuario (A04/A09): el mensaje es
 * humano y en español. El detalle técnico se registra en el servidor, no aquí.
 */
export interface ErrorStateProps {
  /** Título del error, en español. */
  title?: string;
  /** Mensaje humano que explica qué pasó y qué puede hacer el usuario. */
  message?: string;
  /** Acción de reintento opcional. */
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Algo salió mal",
  message = "No pudimos cargar la información. Inténtalo de nuevo en unos segundos.",
  onRetry,
  retryLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center px-5 py-16 text-center"
    >
      <AlertTriangle
        className="mb-4 h-16 w-16 text-destructive/70"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-lg font-bold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
