"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";

import type { AdminFineRow } from "@/lib/services/fines-admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { formatCurrency } from "@/lib/utils/currency";
import { markFinePaidAction } from "./actions";

/**
 * Lista de multas de todos los usuarios (F5.3). El bibliotecario marca como
 * pagadas las pendientes, con confirmación. La escritura la revalida la Server
 * Action + RLS.
 */
export function FinesAdminList({ rows }: { rows: AdminFineRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = React.useState<AdminFineRow | null>(null);
  const [pending, startTransition] = React.useTransition();

  const confirmPaid = () => {
    if (!target) return;
    const fine = target;
    setTarget(null);
    startTransition(async () => {
      const result = await markFinePaidAction(fine.id);
      if (result.ok) {
        toast(`Pago registrado (${formatCurrency(fine.monto)}).`, "success");
        router.refresh();
      } else {
        toast(result.error ?? "No se pudo registrar el pago.", "error");
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
              <th className="px-4 py-3 font-semibold">Retraso</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
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
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {row.diasRetraso} día(s)
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">
                  {formatCurrency(row.monto)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {row.estado === "pendiente" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={pending}
                        onClick={() => setTarget(row)}
                      >
                        <BadgeCheck aria-hidden="true" />
                        Marcar pagada
                      </Button>
                    ) : (
                      <span className="block text-right text-xs text-muted-foreground">
                        —
                      </span>
                    )}
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
        title="Registrar pago de multa"
        message={
          target
            ? `Vas a marcar como pagada la multa de ${formatCurrency(target.monto)} de ${target.userName} por «${target.bookTitle}». ¿Continuar?`
            : ""
        }
        confirmLabel="Marcar pagada"
        onConfirm={confirmPaid}
      />
    </>
  );
}
