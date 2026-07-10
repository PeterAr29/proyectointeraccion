"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Modal base del sistema de diseño (diálogo accesible).
 * - role="dialog" aria-modal, cierre con Escape y con clic en el fondo.
 * - Bloquea el scroll del body mientras está abierto.
 * - Lleva el foco al contenedor al abrir (base de accesibilidad AA).
 * Los diálogos globales (Dialog.tsx) se construyen sobre este primitivo.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título accesible; se enlaza con aria-labelledby. */
  title?: string;
  /** Descripción accesible opcional; se enlaza con aria-describedby. */
  description?: string;
  /** Muestra la X de cerrar en la esquina. Por defecto, true. */
  showClose?: boolean;
  /** Si false, no cierra al hacer clic en el fondo ni con Escape (diálogos bloqueantes). */
  dismissable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
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
