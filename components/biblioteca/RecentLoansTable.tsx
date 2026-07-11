import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import type { RecentLoanRow } from "@/lib/services/dashboard";
import { formatDate } from "@/lib/utils/dates";

/**
 * Tabla de préstamos recientes del dashboard de administración (Módulo E, F5.1).
 * Presentacional (Server Component): recibe las filas ya resueltas por
 * `dashboard.ts` (libro + usuario + estado efectivo). Responsive: bajo 768px hace
 * scroll horizontal (RNF-05). Solo lectura; la gestión llega en F5.3.
 */
export function RecentLoansTable({ rows }: { rows: RecentLoanRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Libro</th>
            <th className="px-4 py-3 font-semibold">Usuario</th>
            <th className="px-4 py-3 font-semibold">Prestado</th>
            <th className="px-4 py-3 font-semibold">Devolución</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium text-foreground">
                {row.bookTitle}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.userName}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDate(row.fechaPrestamo)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                {formatDate(row.fechaDevolucionEstimada)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
