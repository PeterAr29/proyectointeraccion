"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Undo2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { formatDate } from "@/lib/utils/dates";
import type { RenewBlockReason } from "@/lib/services/loans";
import type {
  RenewFailureReason,
  RequestReturnFailureReason,
  CancelReturnFailureReason,
} from "@/lib/services/loans";
import {
  renewAction,
  requestReturnAction,
  cancelReturnAction,
} from "@/app/(app)/mis-prestamos/actions";

/**
 * Acciones de una fila de "Mis préstamos" (F3.2 + devolución en 2 pasos):
 * ampliar y SOLICITAR devolución. El estudiante ya no cierra la devolución: la
 * solicita y el bibliotecario la confirma en el mostrador (así se valida la
 * entrega física). Si ya la solicitó, puede CANCELARLA mientras no se confirme.
 * Ambas acciones exigen confirmación (diálogos globales, RNF-SEC-A04-4).
 */
export interface LoanRowActionsProps {
  loanId: string;
  titulo: string;
  renewable: boolean;
  renewBlockReason: RenewBlockReason | null;
  /** El estudiante ya solicitó la devolución (falta confirmación del bibliotecario). */
  devolucionSolicitada: boolean;
}

type View =
  | "closed"
  | "confirm-renew"
  | "confirm-request"
  | "confirm-cancel"
  | "success-renew";

const RENEW_BLOCK_HINT: Record<RenewBlockReason, string> = {
  returned: "Este préstamo ya fue devuelto.",
  "limit-reached": "Alcanzaste el máximo de ampliaciones permitidas.",
  "pending-fine": "No puedes ampliar con una multa pendiente.",
  "return-requested": "Solicitaste la devolución de este libro.",
};

const RENEW_ERRORS: Record<RenewFailureReason, string> = {
  "not-renewable": "Este préstamo ya no puede ampliarse.",
  "limit-reached": "Alcanzaste el máximo de ampliaciones permitidas.",
  "pending-fine": "No puedes ampliar con una multa pendiente.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo ampliar el préstamo. Inténtalo de nuevo.",
};

const REQUEST_ERRORS: Record<RequestReturnFailureReason, string> = {
  "not-requestable": "Este préstamo ya no admite solicitud de devolución.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo solicitar la devolución. Inténtalo de nuevo.",
};

const CANCEL_ERRORS: Record<CancelReturnFailureReason, string> = {
  "not-cancelable": "No se pudo cancelar la solicitud.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo cancelar la solicitud. Inténtalo de nuevo.",
};

export function LoanRowActions({
  loanId,
  titulo,
  renewable,
  renewBlockReason,
  devolucionSolicitada,
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

  const doRequest = () => {
    setView("closed");
    startTransition(async () => {
      const result = await requestReturnAction(loanId);
      if (result.ok) {
        toast(
          `Solicitaste devolver «${titulo}». Llévalo al mostrador para confirmarlo.`,
          "success",
        );
        router.refresh();
        return;
      }
      toast(REQUEST_ERRORS[result.reason], "error");
    });
  };

  const doCancel = () => {
    setView("closed");
    startTransition(async () => {
      const result = await cancelReturnAction(loanId);
      if (result.ok) {
        toast(`Cancelaste la solicitud de devolución de «${titulo}».`, "info");
        router.refresh();
        return;
      }
      toast(CANCEL_ERRORS[result.reason], "error");
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

      {devolucionSolicitada ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setView("confirm-cancel")}
          disabled={pending}
          aria-label={`Cancelar la solicitud de devolución de «${titulo}»`}
        >
          <X aria-hidden="true" />
          Cancelar solicitud
        </Button>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={() => setView("confirm-request")}
          disabled={pending}
          aria-label={`Solicitar la devolución de «${titulo}»`}
        >
          <Undo2 aria-hidden="true" />
          Solicitar devolución
        </Button>
      )}

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
        open={view === "confirm-request"}
        onClose={close}
        variant="confirm"
        title="Solicitar devolución"
        message={`Vas a solicitar la devolución de «${titulo}». Llévalo al mostrador de la biblioteca: el préstamo seguirá a tu nombre hasta que el bibliotecario confirme que lo entregaste. ¿Continuar?`}
        confirmLabel="Solicitar devolución"
        onConfirm={doRequest}
      />

      <Dialog
        open={view === "confirm-cancel"}
        onClose={close}
        variant="confirm"
        title="Cancelar solicitud"
        message={`Vas a cancelar la solicitud de devolución de «${titulo}». El préstamo seguirá activo con normalidad. ¿Continuar?`}
        confirmLabel="Cancelar solicitud"
        onConfirm={doCancel}
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
