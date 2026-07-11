"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookMarked, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { formatDate } from "@/lib/utils/dates";
import type { BorrowFailureReason } from "@/lib/services/loans";
import type { ReserveFailureReason } from "@/lib/services/reservations";
import { borrowAction, reserveAction } from "@/app/(app)/catalogo/[id]/actions";

/**
 * Acción de préstamo/reserva del detalle del libro (Módulo C, F3.1).
 * Reemplaza el botón deshabilitado de F2.2. Cada operación exige confirmación
 * (diálogo global) antes de ejecutarse (RNF-SEC-A04-4) y la lógica transaccional
 * vive en la capa de servicios; aquí solo se orquesta la UI y sus estados.
 * Si al prestar el último ejemplar se agotó (carrera), se ofrece reservar.
 */
export interface LoanActionsProps {
  bookId: string;
  available: boolean;
  titulo: string;
}

type View =
  | "closed"
  | "confirm-borrow"
  | "confirm-reserve"
  | "offer-reserve"
  | "success-borrow"
  | "success-reserve";

const BORROW_ERRORS: Record<
  Exclude<BorrowFailureReason, "no-stock">,
  string
> = {
  "already-loaned": "Ya tienes un préstamo activo de este libro.",
  "not-found": "No encontramos este libro en el catálogo.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo registrar el préstamo. Inténtalo de nuevo.",
};

const RESERVE_ERRORS: Record<ReserveFailureReason, string> = {
  "has-stock":
    "Este libro ya tiene ejemplares disponibles. Actualiza la página para prestarlo.",
  "already-reserved": "Ya tienes una reserva activa de este libro.",
  "not-found": "No encontramos este libro en el catálogo.",
  "no-session": "Tu sesión expiró. Inicia sesión nuevamente.",
  error: "No se pudo registrar la reserva. Inténtalo de nuevo.",
};

export function LoanActions({ bookId, available, titulo }: LoanActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = React.useState<View>("closed");
  const [pending, startTransition] = React.useTransition();
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [estimatedDate, setEstimatedDate] = React.useState<string | null>(null);

  const doBorrow = () => {
    setView("closed");
    startTransition(async () => {
      const result = await borrowAction(bookId);
      if (result.ok) {
        setDueDate(result.fechaDevolucion);
        setView("success-borrow");
        router.refresh();
        return;
      }
      if (result.reason === "no-stock") {
        setView("offer-reserve");
        return;
      }
      toast(
        BORROW_ERRORS[result.reason],
        result.reason === "already-loaned" ? "info" : "error",
      );
    });
  };

  const doReserve = () => {
    setView("closed");
    startTransition(async () => {
      const result = await reserveAction(bookId);
      if (result.ok) {
        setEstimatedDate(result.fechaEstimada);
        setView("success-reserve");
        router.refresh();
        return;
      }
      if (result.reason === "has-stock") {
        toast(RESERVE_ERRORS["has-stock"], "info");
        router.refresh();
        return;
      }
      toast(
        RESERVE_ERRORS[result.reason],
        result.reason === "already-reserved" ? "info" : "error",
      );
    });
  };

  const close = () => setView("closed");

  return (
    <>
      {available ? (
        <Button onClick={() => setView("confirm-borrow")} disabled={pending}>
          <BookMarked aria-hidden="true" />
          {pending ? "Prestando…" : "Prestar"}
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setView("confirm-reserve")}
          disabled={pending}
        >
          <CalendarClock aria-hidden="true" />
          {pending ? "Reservando…" : "Reservar"}
        </Button>
      )}

      <Dialog
        open={view === "confirm-borrow"}
        onClose={close}
        variant="confirm"
        title="Confirmar préstamo"
        message={`Vas a prestar «${titulo}». Aparecerá en «Mis préstamos» y deberás devolverlo en la fecha de vencimiento.`}
        confirmLabel="Prestar"
        onConfirm={doBorrow}
      />

      <Dialog
        open={view === "confirm-reserve"}
        onClose={close}
        variant="confirm"
        title="Confirmar reserva"
        message={`«${titulo}» no tiene ejemplares disponibles ahora. Te avisaremos cuando quede libre. ¿Deseas reservarlo?`}
        confirmLabel="Reservar"
        onConfirm={doReserve}
      />

      <Dialog
        open={view === "offer-reserve"}
        onClose={close}
        variant="confirm"
        title="Se agotó el último ejemplar"
        message={`Otro usuario tomó el último ejemplar de «${titulo}» justo ahora. ¿Quieres reservarlo para que te avisemos cuando esté disponible?`}
        confirmLabel="Reservar"
        onConfirm={doReserve}
      />

      <Dialog
        open={view === "success-borrow"}
        onClose={close}
        variant="success"
        title="¡Préstamo registrado!"
        message={`Devuelve «${titulo}» antes del ${formatDate(dueDate)}. Lo encuentras en «Mis préstamos».`}
      />

      <Dialog
        open={view === "success-reserve"}
        onClose={close}
        variant="success"
        title="¡Reserva registrada!"
        message={
          estimatedDate
            ? `Reservaste «${titulo}». Disponibilidad estimada: ${formatDate(estimatedDate)}.`
            : `Reservaste «${titulo}». Te avisaremos cuando haya un ejemplar disponible.`
        }
      />
    </>
  );
}
