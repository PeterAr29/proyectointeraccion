"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Modal base del sistema de diseño (diálogo accesible).
 * - role="dialog" aria-modal, cierre con Escape y con clic en el fondo.
 * - Bloquea el scroll del body mientras está abierto.
 * - Lleva el foco al contenedor al abrir y lo DEVUELVE al elemento previo al
 *   cerrar; atrapa el Tab dentro del diálogo (accesibilidad AA, F6.1).
 * - Nombre accesible vía `title` (aria-labelledby) o `label` (aria-label).
 * Los diálogos globales (Dialog.tsx) se construyen sobre este primitivo.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título accesible; se enlaza con aria-labelledby. */
  title?: string;
  /** Nombre accesible cuando el título no se renderiza aquí (aria-label). */
  label?: string;
  /** Descripción accesible opcional; se enlaza con aria-describedby. */
  description?: string;
  /** Muestra la X de cerrar en la esquina. Por defecto, true. */
  showClose?: boolean;
  /** Si false, no cierra al hacer clic en el fondo ni con Escape (diálogos bloqueantes). */
  dismissable?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Selector de elementos enfocables para la trampa de foco. */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  label,
  description,
  showClose = true,
  dismissable = true,
  className,
  children,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    // Recuerda el foco previo para devolverlo al cerrar (no perder el contexto).
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissable) {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      // Trampa de foco: el Tab cicla dentro del diálogo (aria-modal).
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, dismissable, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissable) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title && label ? label : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md rounded-lg bg-card p-6 text-card-foreground shadow-xl outline-none",
          className,
        )}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {title && (
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
        )}
        {description && (
          <p id={descId} className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
