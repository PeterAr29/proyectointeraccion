import { describe, expect, it } from "vitest";

import {
  loansByMonth,
  summarizeFines,
  topBorrowedBooks,
} from "@/lib/services/reports";
import type { Fine } from "@/lib/services/fines";
import type { Loan, LoanWithBook } from "@/lib/services/loans";

function loanItem(
  fechaPrestamo: string,
  bookTitle: string,
  bookId = "b1",
): LoanWithBook {
  const loan = {
    id: `l-${fechaPrestamo}-${bookId}`,
    book_id: bookId,
    user_id: "u1",
    fecha_prestamo: fechaPrestamo,
    fecha_devolucion_estimada: "2026-07-15T00:00:00Z",
    fecha_devolucion_real: null,
    estado: "activo",
    renovaciones: 0,
    vencimiento_notificado_en: null,
    devolucion_solicitada_en: null,
    created_at: fechaPrestamo,
    updated_at: fechaPrestamo,
  } satisfies Loan;
  return { loan, book: { id: bookId, titulo: bookTitle, autor: "x" } };
}

function fine(estado: Fine["estado"], monto: number): Fine {
  return {
    id: `f-${Math.random()}`,
    loan_id: "l1",
    user_id: "u1",
    dias_retraso: 3,
    monto,
    estado,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  };
}

describe("loansByMonth", () => {
  it("agrupa por mes y ordena ascendente", () => {
    const rows = loansByMonth([
      loanItem("2026-07-01T00:00:00Z", "A"),
      loanItem("2026-07-20T00:00:00Z", "B"),
      loanItem("2026-06-05T00:00:00Z", "C"),
    ]);
    expect(rows).toEqual([
      { month: "2026-06", count: 1 },
      { month: "2026-07", count: 2 },
    ]);
  });
});

describe("topBorrowedBooks", () => {
  it("cuenta por título y ordena de más a menos prestado", () => {
    const rows = topBorrowedBooks([
      loanItem("2026-07-01T00:00:00Z", "Redes", "b1"),
      loanItem("2026-07-02T00:00:00Z", "Redes", "b1"),
      loanItem("2026-07-03T00:00:00Z", "Algoritmos", "b2"),
    ]);
    expect(rows[0]).toEqual({ title: "Redes", count: 2 });
    expect(rows[1]).toEqual({ title: "Algoritmos", count: 1 });
  });

  it("respeta el límite topN", () => {
    const items = [
      loanItem("2026-07-01T00:00:00Z", "A", "a"),
      loanItem("2026-07-01T00:00:00Z", "B", "b"),
      loanItem("2026-07-01T00:00:00Z", "C", "c"),
    ];
    expect(topBorrowedBooks(items, 2)).toHaveLength(2);
  });
});

describe("summarizeFines", () => {
  it("suma cantidades y montos por estado (redondeado a 2 decimales)", () => {
    const summary = summarizeFines([
      fine("pendiente", 1.5),
      fine("pendiente", 2),
      fine("pagada", 3.25),
    ]);
    expect(summary).toEqual({
      countPendiente: 2,
      montoPendiente: 3.5,
      countPagada: 1,
      montoPagada: 3.25,
    });
  });
});
