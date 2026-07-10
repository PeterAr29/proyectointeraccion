"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Sistema de notificaciones efímeras (toasts) del diseño.
 * Confirma acciones sin bloquear (préstamo hecho, favorito guardado, etc.).
 * Uso: envolver el árbol con <ToastProvider> y llamar useToast().toast(...).
 * El shell de la app (F1.4) montará el provider cerca de la raíz.
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: LucideIcon; accent: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "border-l-green-600",
    iconColor: "text-green-600",
  },
  error: {
    icon: XCircle,
    accent: "border-l-red-600",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    accent: "border-l-amber-600",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    accent: "border-l-blue-600",
    iconColor: "text-blue-600",
  },
};

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = "success") => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        {toasts.map((item) => (
          <ToastCard
            key={item.id}
            item={item}
            onDismiss={() => dismiss(item.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const { icon: Icon, accent, iconColor } = VARIANT_STYLES[item.variant];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-lg border border-l-4 bg-card px-4 py-3 text-sm text-card-foreground shadow-lg",
        accent,
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", iconColor)} aria-hidden="true" />
      <span>{item.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Hook para disparar toasts. Debe usarse dentro de <ToastProvider>. */
export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  }
  return context;
}
