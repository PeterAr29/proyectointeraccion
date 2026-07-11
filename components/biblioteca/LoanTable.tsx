import Link from "next/link";

import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { LoanRowActions } from "@/components/biblioteca/LoanRowActions";
import {
  canRenew,
  effectiveLoanStatus,
  type LoanWithBook,
} from "@/lib/services/loans";
import { formatDate } from "@/lib/utils/dates";

/**
 * Tabla de préstamos del usuario (Módulo C). Presentacional (Server Component):
 * recibe los préstamos ya cargados y deriva el estado efectivo y la renovabilidad
 * con las funciones puras de `loans.ts`. Responsive: bajo 768px hace scroll
 * horizontal (RNF-05). Reutilizable en "Mis préstamos" (con acciones) y en el
 * historial (`withActions={false}`, F3.3).
 */
export interface LoanTableProps {
  items: LoanWithBook[];
  maxRenovaciones: number;
  /** Muestra la columna de acciones (renovar/devolver). Historial: false. */
  withActions?: boolean;
  /** Ids de préstamos con multa pendiente (checker del Módulo D, §7.2.5). */
  pendingFineLoanIds?: string[];
}

export function LoanTable({
  items,
  maxRenovaciones,
  withActions = true,
  pendingFineLoanIds = [],
}: LoanTableProps) {
  const withPendingFine = new Set(pendingFineLoanIds);
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Libro</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Devolución</th>
            <th className="px-4 py-3 font-semibold">Renovaciones</th>
            {withActions && (
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map(({ loan, book }) => {
            const status = effectiveLoanStatus(loan);
            const returned = status === "devuelto";
            // Checker de multa pendiente (Módulo D, §7.2.5). La RPC `renew_loan`
            // revalida esta misma regla en la BD.
            const renew = canRenew(
              loan,
              maxRenovaciones,
              withPendingFine.has(loan.id),
            );
            return (
              <tr key={loan.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  {book ? (
                    <Link
                      href={`/catalogo/${book.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {book.titulo}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      Libro no disponible
                    </span>
                  )}
                  {book?.autor && (
                    <p className="text-xs text-muted-foreground">
                      {book.autor}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {returned ? (
                    <span className="text-muted-foreground">
                      Devuelto el {formatDate(loan.fecha_devolucion_real)}
                    </span>
                  ) : (
                    formatDate(loan.fecha_devolucion_estimada)
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {loan.renovaciones} de {maxRenovaciones}
                </td>
                {withActions && (
                  <td className="px-4 py-3">
                    {returned ? (
                      <span className="block text-right text-xs text-muted-foreground">
                        —
                      </span>
                    ) : (
                      <LoanRowActions
                        loanId={loan.id}
                        titulo={book?.titulo ?? "este libro"}
                        renewable={renew.allowed}
                        renewBlockReason={renew.reason}
                      />
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
