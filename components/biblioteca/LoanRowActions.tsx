"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { formatDate } from "@/lib/utils/dates";
import type { RenewBlockReason } from "@/lib/services/loans";
import type {
  RenewFailureReason,
  ReturnFailureReason,
} from "@/lib/services/loans";
import { renewAction, returnAction } from "@/app/(app)/mis-prestamos/actions";

/**
 * Acciones de una fila de "Mis préstamos" (F3.2): renovar y devolver.
 * Ambas exigen confirmación (diálogos globales, RNF-SEC-A04-4). Renovar se
 * deshabilita con explicación si la regla §7.2.5 lo impide (límite o multa).
 * La lógica transaccional vive en la capa de servicios; aquí solo se orquesta.
 */
export interface LoanRowActionsProps {
  loanId: string;
  titulo: string;
  renewable: boolean;
  renewBlockReason: RenewBlockReason | null;
}

type View = "closed" | "confirm-renew" | "confirm-return" | "success-renew";

const RENEW_BLOCK_HINT: Record<RenewBlockReason, string> = {
  returned: "Este préstamo ya fue devuelto.",
  "limit-reached": "Alcanzaste el máximo de ampliaciones permitidas.",
  "pending-fine": "No puedes ampliar con una multa pendiente.",
};

const RENEW_ERRORS: Record<RenewFailureReason, string> = {
  "not-renewable": "Este préstamo ya no puede ampliarse.",
  "limit-reached": "Alcanzaste el máximo de ampliaciones permitidas.",
  "pending-fine": "No puedes ampliar con una multa pendiente.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo ampliar el préstamo. Inténtalo de nuevo.",
};

const RETURN_ERRORS: Record<ReturnFailureReason, string> = {
  "not-returnable": "Este préstamo ya no puede devolverse.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo registrar la devolución. Inténtalo de nuevo.",
};

export function LoanRowActions({
  loanId,
  titulo,
  renewable,
  renewBlockReason,
}: LoanRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState<View>("closed");
  const [pending, startTransition] = React.useTransition();
  const [newDueDate, setNewDueDate] = React.useState<string | null>(null);

  const doRenew = () => {
    setView("closed");
    startTransition(async () => {
      const result = await renewAction(loanId);
      if (result.ok) {
        setNewDueDate(result.fechaDevolucion);
        setView("success-renew");
        router.refresh();
        return;
      }
      toast(RENEW_ERRORS[result.reason], "error");
    });
  };

  const doReturn = () => {
    setView("closed");
    startTransition(async () => {
      const result = await returnAction(loanId);
      if (result.ok) {
        toast(`Devolviste «${titulo}». ¡Gracias!`, "success");
        router.refresh();
        return;
      }
      toast(RETURN_ERRORS[result.reason], "error");
    });
  };

  const close = () => setView("closed");
  const renewHint = renewBlockReason
    ? RENEW_BLOCK_HINT[renewBlockReason]
    : undefined;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setView("confirm-renew")}
        disabled={pending || !renewable}
        title={renewHint}
        aria-label={`Ampliar «${titulo}»`}
      >
        <RefreshCw aria-hidden="true" />
        Ampliar
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setView("confirm-return")}
        disabled={pending}
        aria-label={`Devolver «${titulo}»`}
      >
        <Undo2 aria-hidden="true" />
        Devolver
      </Button>

      <Dialog
        open={view === "confirm-renew"}
        onClose={close}
        variant="confirm"
        title="Confirmar ampliación"
        message={`Vas a ampliar el préstamo de «${titulo}» 1 día más. Solo puedes ampliarlo una vez. ¿Continuar?`}
        confirmLabel="Ampliar"
        onConfirm={doRenew}
      />

      <Dialog
        open={view === "confirm-return"}
        onClose={close}
        variant="confirm"
        title="Confirmar devolución"
        message={`Vas a devolver «${titulo}». El ejemplar volverá a estar disponible en el catálogo. ¿Continuar?`}
        confirmLabel="Devolver"
        onConfirm={doReturn}
      />

      <Dialog
        open={view === "success-renew"}
        onClose={close}
        variant="success"
        title="¡Préstamo ampliado!"
        message={`Nueva fecha de devolución de «${titulo}»: ${formatDate(newDueDate)}.`}
      />
    </div>
  );
}
