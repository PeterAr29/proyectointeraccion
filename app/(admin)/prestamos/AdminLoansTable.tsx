import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import type { AdminLoanRow } from "@/lib/services/loans-admin";
import { formatDate } from "@/lib/utils/dates";

/**
 * Tabla de préstamos de todos los usuarios (vista global de admin, F5.3).
 * Presentacional (Server Component), solo lectura. Responsive: scroll <768px.
 */
export function AdminLoansTable({ rows }: { rows: AdminLoanRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Usuario</th>
            <th className="px-4 py-3 font-semibold">Libro</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Prestado</th>
            <th className="px-4 py-3 font-semibold">Devolución</th>
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
                {formatDate(row.fechaPrestamo)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {row.fechaDevolucionReal
                  ? `Devuelto el ${formatDate(row.fechaDevolucionReal)}`
                  : formatDate(row.fechaDevolucionEstimada)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
