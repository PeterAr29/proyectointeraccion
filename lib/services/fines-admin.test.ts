import { describe, expect, it } from "vitest";

import { buildAdminFineRows } from "@/lib/services/fines-admin";
import type { Fine } from "@/lib/services/fines";
import type { Loan, LoanWithBook } from "@/lib/services/loans";

function makeFine(overrides: Partial<Fine> = {}): Fine {
  return {
    id: "f1",
    loan_id: "l1",
    user_id: "u1",
    dias_retraso: 3,
    monto: 3,
    estado: "pendiente",
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
    ...overrides,
  };
}

function makeLoanWithBook(id: string, bookTitle: string): LoanWithBook {
  const loan = {
    id,
    book_id: "b1",
    user_id: "u1",
    fecha_prestamo: "2026-07-01T00:00:00Z",
    fecha_devolucion_estimada: "2026-07-15T00:00:00Z",
    fecha_devolucion_real: null,
    estado: "vencido",
    renovaciones: 0,
    vencimiento_notificado_en: null,
    devolucion_solicitada_en: null,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  } satisfies Loan;
  return { loan, book: { id: "b1", titulo: bookTitle, autor: "x" } };
}

describe("buildAdminFineRows", () => {
  it("cruza la multa con el libro de su préstamo y el nombre del usuario", () => {
    const [row] = buildAdminFineRows(
      [makeFine({ loan_id: "l1", user_id: "u1", monto: 5, dias_retraso: 5 })],
      [makeLoanWithBook("l1", "Redes")],
      [{ id: "u1", nombre: "María" }],
    );
    expect(row).toMatchObject({
      bookTitle: "Redes",
      userName: "María",
      monto: 5,
      diasRetraso: 5,
      estado: "pendiente",
    });
  });

  it("degrada con textos legibles cuando falta el préstamo o el perfil", () => {
    const [row] = buildAdminFineRows(
      [makeFine({ loan_id: "desconocido", user_id: "fantasma" })],
      [],
      [],
    );
    expect(row?.bookTitle).toBe("Libro no disponible");
    expect(row?.userName).toBe("Usuario desconocido");
  });
});
