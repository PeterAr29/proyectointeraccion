"use client";

import * as React from "react";
import {
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  HelpCircle,
  Lock,
  ShieldAlert,
  WifiOff,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Modal } from "@/components/feedback/Modal";

/**
 * Diálogos globales reutilizables del sistema de diseño (metáfora del prototipo:
 * icono en círculo tintado + título + mensaje + acciones). Cubren los avisos y
 * confirmaciones que se repiten en toda la app, con textos en español por defecto.
 * Cualquier módulo (B–E) los reutiliza pasando solo `variant`, `open` y `onClose`.
 */
export type DialogVariant =
  | "success"
  | "warning"
  | "error"
  | "confirm"
  | "confirm-danger"
  | "session-expired"
  | "offline"
  | "access-denied"
  | "incomplete-fields"
  | "invalid-date";

interface Preset {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: ButtonProps["variant"];
  /** Si true, muestra botón de cancelar (diálogos de confirmación). */
  hasCancel: boolean;
  /** Si false, no se cierra con Escape ni clic en el fondo. */
  dismissable: boolean;
}

const PRESETS: Record<DialogVariant, Preset> = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-700",
    title: "Operación exitosa",
    message: "La operación se realizó correctamente.",
    confirmLabel: "Aceptar",
    confirmVariant: "primary",
    hasCancel: false,
    dismissable: true,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-700",
    title: "Advertencia",
    message: "Revisa esta información antes de continuar.",
    confirmLabel: "Entendido",
    confirmVariant: "warning",
    hasCancel: false,
    dismissable: true,
  },
  error: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-700",
    title: "Error",
    message: "No se pudo completar la operación. Inténtalo de nuevo.",
    confirmLabel: "Cerrar",
    confirmVariant: "danger",
    hasCancel: false,
    dismissable: true,
  },
  confirm: {
    icon: HelpCircle,
    iconClass: "bg-blue-100 text-blue-700",
    title: "Confirmación",
    message: "¿Deseas confirmar esta acción?",
    confirmLabel: "Confirmar",
    confirmVariant: "primary",
    hasCancel: true,
    dismissable: true,
  },
  "confirm-danger": {
    icon: AlertTriangle,
    iconClass: "bg-red-100 text-red-700",
    title: "Confirmar acción",
    message: "Esta acción no se puede deshacer. ¿Deseas continuar?",
    confirmLabel: "Eliminar",
    confirmVariant: "danger",
    hasCancel: true,
    dismissable: true,
  },
  "session-expired": {
    icon: Lock,
    iconClass: "bg-red-100 text-red-700",
    title: "Sesión expirada",
    message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    confirmLabel: "Ir al inicio de sesión",
    confirmVariant: "danger",
    hasCancel: false,
    dismissable: false,
  },
  offline: {
    icon: WifiOff,
    iconClass: "bg-red-100 text-red-700",
    title: "Sin conexión",
    message:
      "No pudimos conectar con el servidor. Verifica tu conexión a internet.",
    confirmLabel: "Reintentar",
    confirmVariant: "primary",
    hasCancel: false,
    dismissable: false,
  },
  "access-denied": {
    icon: ShieldAlert,
    iconClass: "bg-red-100 text-red-700",
    title: "Acceso denegado",
    message: "No tienes permisos para realizar esta acción.",
    confirmLabel: "Aceptar",
    confirmVariant: "danger",
    hasCancel: false,
    dismissable: true,
  },
  "incomplete-fields": {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-700",
    title: "Campos incompletos",
    message: "Por favor completa todos los campos obligatorios.",
    confirmLabel: "Aceptar",
    confirmVariant: "warning",
    hasCancel: false,
    dismissable: true,
  },
  "invalid-date": {
    icon: CalendarX,
    iconClass: "bg-red-100 text-red-700",
    title: "Fecha inválida",
    message: "La fecha de devolución no puede ser anterior a la fecha actual.",
    confirmLabel: "Aceptar",
    confirmVariant: "danger",
    hasCancel: false,
    dismissable: true,
  },
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  variant: DialogVariant;
  /** Sobrescribe el título del preset. */
  title?: string;
  /** Sobrescribe el mensaje del preset. */
  message?: string;
  /** Acción del botón principal; por defecto cierra el diálogo. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function Dialog({
  open,
  onClose,
  variant,
  title,
  message,
  onConfirm,
  confirmLabel,
  cancelLabel,
}: DialogProps) {
  const preset = PRESETS[variant];
  const Icon = preset.icon;
  const handleConfirm = onConfirm ?? onClose;

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissable={preset.dismissable}
      showClose={preset.dismissable}
      label={title ?? preset.title}
      className="max-w-sm"
    >
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
            preset.iconClass,
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold">{title ?? preset.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {message ?? preset.message}
        </p>
        <div className="mt-6 flex w-full justify-center gap-3">
          {preset.hasCancel && (
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              {cancelLabel ?? "Cancelar"}
            </Button>
          )}
          <Button
            variant={preset.confirmVariant}
            className="flex-1"
            onClick={handleConfirm}
          >
            {confirmLabel ?? preset.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
