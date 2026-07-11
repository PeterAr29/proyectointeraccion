"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";

import type { ReturnRow } from "@/lib/services/loans-admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import { registerReturnAction } from "./actions";

/**
 * Lista de devoluciones pendientes (F5.3). El bibliotecario registra la
 * devolución con confirmación; si el préstamo está vencido, el diálogo advierte
 * la multa que se generará. La orquestación (multa + reponer stock) vive en el
 * servidor; aquí solo se orquesta la UI.
 */
export function ReturnsList({ rows }: { rows: ReturnRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = React.useState<ReturnRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const confirmReturn = () => {
    if (!target) return;
    const row = target;
    setTarget(null);
    startTransition(async () => {
      const result = await registerReturnAction(row.id);
      if (result.ok) {
        toast(
          result.fineAmount && result.fineAmount > 0
            ? `Devolución registrada. Multa generada: ${formatCurrency(result.fineAmount)}.`
            : "Devolución registrada. El ejemplar vuelve al catálogo.",
          "success",
        );
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Libro</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Vence</th>
              <th className="px-4 py-3 font-semibold">Multa estimada</th>
              <th className="px-4 py-3 text-right font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {row.userName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.bookTitle}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.estado} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(row.fechaDevolucionEstimada)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.estimatedFine > 0 ? (
                    <span className="font-semibold text-destructive">
                      {formatCurrency(row.estimatedFine)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pending}
                      onClick={() => setTarget(row)}
                    >
                      <Undo2 aria-hidden="true" />
                      Registrar devolución
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        variant="confirm"
        title="Registrar devolución"
        message={
          target
            ? target.estimatedFine > 0
              ? `«${target.bookTitle}» de ${target.userName} tiene ${target.overdueDays} día(s) de retraso. Se generará una multa de ${formatCurrency(target.estimatedFine)} y el ejemplar volverá al catálogo. ¿Continuar?`
              : `Vas a registrar la devolución de «${target.bookTitle}» de ${target.userName}. El ejemplar volverá al catálogo. ¿Continuar?`
            : ""
        }
        confirmLabel="Registrar devolución"
        onConfirm={confirmReturn}
      />
    </>
  );
}
