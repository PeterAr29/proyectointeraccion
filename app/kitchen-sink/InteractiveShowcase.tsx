"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/feedback/Modal";
import { Dialog, type DialogVariant } from "@/components/feedback/Dialog";
import {
  ToastProvider,
  useToast,
  type ToastVariant,
} from "@/components/feedback/Toast";

/**
 * Demostración interactiva de los componentes con estado del sistema de diseño
 * (Modal, diálogos globales y toasts). Vive aparte del server component para
 * mantener el resto de /kitchen-sink como Server Components.
 */
const DIALOG_VARIANTS: { variant: DialogVariant; label: string }[] = [
  { variant: "success", label: "Éxito" },
  { variant: "warning", label: "Advertencia" },
  { variant: "error", label: "Error" },
  { variant: "confirm", label: "Confirmación" },
  { variant: "confirm-danger", label: "Confirmar destructivo" },
  { variant: "session-expired", label: "Sesión expirada" },
  { variant: "offline", label: "Sin conexión" },
  { variant: "access-denied", label: "Acceso denegado" },
  { variant: "incomplete-fields", label: "Campos incompletos" },
  { variant: "invalid-date", label: "Fecha inválida" },
];

const TOAST_VARIANTS: { variant: ToastVariant; label: string; msg: string }[] =
  [
    { variant: "success", label: "Éxito", msg: "Préstamo registrado." },
    { variant: "error", label: "Error", msg: "No se pudo guardar." },
    { variant: "warning", label: "Aviso", msg: "Tu préstamo vence pronto." },
    { variant: "info", label: "Info", msg: "Catálogo actualizado." },
  ];

export function InteractiveShowcase() {
  return (
    <ToastProvider>
      <ShowcaseInner />
    </ToastProvider>
  );
}

function ShowcaseInner() {
  const { toast } = useToast();
  const [dialog, setDialog] = React.useState<DialogVariant | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Diálogos globales
        </h3>
        <div className="flex flex-wrap gap-2">
          {DIALOG_VARIANTS.map(({ variant, label }) => (
            <Button
              key={variant}
              variant="secondary"
              size="sm"
              onClick={() => setDialog(variant)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Toasts
        </h3>
        <div className="flex flex-wrap gap-2">
          {TOAST_VARIANTS.map(({ variant, label, msg }) => (
            <Button
              key={variant}
              variant="secondary"
              size="sm"
              onClick={() => toast(msg, variant)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Modal base
        </h3>
        <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
      </div>

      {dialog && (
        <Dialog
          open
          variant={dialog}
          onClose={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            toast("Acción confirmada.", "success");
          }}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Detalle del préstamo"
        description="Este es el modal base sobre el que se construyen los diálogos."
      >
        <p className="mt-4 text-sm text-muted-foreground">
          Cierra con la X, con la tecla Escape o haciendo clic fuera del panel.
        </p>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setModalOpen(false)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
}
