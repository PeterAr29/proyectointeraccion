"use client";

import { Download } from "lucide-react";

import type { ReportData } from "@/lib/services/reports";
import { Button } from "@/components/ui/button";
import { toCsv } from "@/lib/utils/csv";
import { formatCurrency } from "@/lib/utils/currency";

/** Descarga un CSV en el navegador (Blob + enlace temporal). */
function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      <Download aria-hidden="true" />
      Exportar CSV
    </Button>
  );
}

function SectionHeader({
  title,
  onExport,
}: {
  title: string;
  onExport: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ExportButton onClick={onExport} />
    </div>
  );
}

/**
 * Vista de reportes (Módulo E, F5.4). Presenta tres reportes y permite
 * exportarlos a CSV. Los datos llegan ya agregados desde el servidor; el CSV se
 * genera en el cliente con `toCsv`.
 */
export function ReportsView({ data }: { data: ReportData }) {
  const { loansByMonth, topBooks, fines } = data;

  const exportLoans = () =>
    downloadCsv(
      "prestamos-por-mes.csv",
      toCsv(
        ["Mes", "Préstamos"],
        loansByMonth.map((r) => [r.month, r.count]),
      ),
    );

  const exportBooks = () =>
    downloadCsv(
      "libros-mas-prestados.csv",
      toCsv(
        ["Libro", "Préstamos"],
        topBooks.map((r) => [r.title, r.count]),
      ),
    );

  const exportFines = () =>
    downloadCsv(
      "multas.csv",
      toCsv(
        ["Estado", "Cantidad", "Monto (S/)"],
        [
          ["Pendientes", fines.countPendiente, fines.montoPendiente],
          ["Pagadas", fines.countPagada, fines.montoPagada],
        ],
      ),
    );

  return (
    <div className="space-y-10">
      <section aria-label="Préstamos por mes">
        <SectionHeader title="Préstamos por mes" onExport={exportLoans} />
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Mes</th>
                <th className="px-4 py-3 font-semibold">Préstamos</th>
              </tr>
            </thead>
            <tbody>
              {loansByMonth.map((r) => (
                <tr key={r.month} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{r.month}</td>
                  <td className="px-4 py-3 font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Libros más prestados">
        <SectionHeader title="Libros más prestados" onExport={exportBooks} />
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Libro</th>
                <th className="px-4 py-3 font-semibold">Préstamos</th>
              </tr>
            </thead>
            <tbody>
              {topBooks.map((r) => (
                <tr key={r.title} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{r.title}</td>
                  <td className="px-4 py-3 font-medium">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Resumen de multas">
        <SectionHeader title="Multas" onExport={exportFines} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(fines.montoPendiente)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fines.countPendiente} multa(s)
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Cobradas</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(fines.montoPagada)}
            </p>
            <p className="text-xs text-muted-foreground">
              {fines.countPagada} multa(s)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
