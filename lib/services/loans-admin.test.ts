import { describe, expect, it } from "vitest";

import {
  buildAdminLoanRows,
  buildReturnRows,
  estimateReturnFine,
} from "@/lib/services/loans-admin";
import type { Loan, LoanWithBook } from "@/lib/services/loans";

function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: "l1",
    book_id: "b1",
    user_id: "u1",
    fecha_prestamo: "2026-07-01T00:00:00Z",
    fecha_devolucion_estimada: "2026-07-15T00:00:00Z",
    fecha_devolucion_real: null,
    estado: "activo",
    renovaciones: 0,
    vencimiento_notificado_en: null,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

function item(o: Partial<Loan>, book: LoanWithBook["book"]): LoanWithBook {
  return { loan: makeLoan(o), book };
}

describe("estimateReturnFine", () => {
  const now = new Date("2026-07-20T00:00:00Z");

  it("calcula la multa cuando hay retraso (§7.2.4)", () => {
    // Vence el 15, hoy es 20 → 5 días × 1.00 = 5.00
    expect(estimateReturnFine("2026-07-15T00:00:00Z", 1, now)).toEqual({
      dias: 5,
      monto: 5,
    });
  });

  it("no genera multa si el préstamo está en plazo", () => {
    expect(estimateReturnFine("2026-07-25T00:00:00Z", 1, now)).toEqual({
      dias: 0,
      monto: 0,
    });
  });

  it("redondea el monto a 2 decimales", () => {
    expect(estimateReturnFine("2026-07-18T00:00:00Z", 0.5, now)).toEqual({
      dias: 2,
      monto: 1,
    });
  });
});

describe("buildAdminLoanRows", () => {
  it("cruza préstamo con libro y usuario y deriva el estado efectivo", () => {
    const [row] = buildAdminLoanRows(
      [
        item(
          { fecha_devolucion_estimada: "2000-01-01T00:00:00Z" },
          { id: "b1", titulo: "Redes", autor: "T" },
        ),
      ],
      [{ id: "u1", nombre: "María" }],
    );
    expect(row).toMatchObject({
      bookTitle: "Redes",
      userName: "María",
      estado: "vencido",
    });
  });
});

describe("buildReturnRows", () => {
  const now = new Date("2026-07-20T00:00:00Z");

  it("excluye los préstamos ya devueltos", () => {
    const rows = buildReturnRows(
      [
        item({ id: "l1" }, { id: "b1", titulo: "A", autor: "x" }),
        item(
          { id: "l2", fecha_devolucion_real: "2026-07-10T00:00:00Z" },
          { id: "b2", titulo: "B", autor: "x" },
        ),
      ],
      [{ id: "u1", nombre: "María" }],
      1,
      now,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("l1");
  });

  it("incluye la multa estimada de un préstamo vencido", () => {
    const [row] = buildReturnRows(
      [
        item(
          { fecha_devolucion_estimada: "2026-07-15T00:00:00Z" },
          { id: "b1", titulo: "A", autor: "x" },
        ),
      ],
      [{ id: "u1", nombre: "María" }],
      1,
      now,
    );
    expect(row?.overdueDays).toBe(5);
    expect(row?.estimatedFine).toBe(5);
  });
});
