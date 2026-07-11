import { describe, expect, it } from "vitest";

import { buildRecentLoanRows } from "@/lib/services/dashboard";
import type { Loan, LoanWithBook } from "@/lib/services/loans";

/** Crea un `Loan` mínimo para las pruebas puras. */
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

function item(
  overrides: Partial<Loan>,
  book: LoanWithBook["book"],
): LoanWithBook {
  return { loan: makeLoan(overrides), book };
}

describe("buildRecentLoanRows", () => {
  it("cruza cada préstamo con su libro y el nombre de su usuario", () => {
    const rows = buildRecentLoanRows(
      [
        item(
          { id: "l1", user_id: "u1", book_id: "b1" },
          { id: "b1", titulo: "Redes", autor: "Tanenbaum" },
        ),
      ],
      [{ id: "u1", nombre: "María Pérez" }],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "l1",
      bookTitle: "Redes",
      userName: "María Pérez",
    });
  });

  it("deriva el estado EFECTIVO (vencido si la fecha estimada ya pasó)", () => {
    const [row] = buildRecentLoanRows(
      [
        item(
          {
            fecha_devolucion_estimada: "2000-01-01T00:00:00Z",
            fecha_devolucion_real: null,
          },
          { id: "b1", titulo: "Redes", autor: "Tanenbaum" },
        ),
      ],
      [{ id: "u1", nombre: "María" }],
    );
    expect(row?.estado).toBe("vencido");
  });

  it("marca devuelto cuando hay fecha de devolución real", () => {
    const [row] = buildRecentLoanRows(
      [
        item(
          { fecha_devolucion_real: "2026-07-10T00:00:00Z" },
          { id: "b1", titulo: "Redes", autor: "T" },
        ),
      ],
      [{ id: "u1", nombre: "María" }],
    );
    expect(row?.estado).toBe("devuelto");
  });

  it("degrada con textos legibles si falta el libro o el perfil", () => {
    const [row] = buildRecentLoanRows(
      [item({ user_id: "fantasma" }, null)],
      [],
    );
    expect(row?.bookTitle).toBe("Libro no disponible");
    expect(row?.userName).toBe("Usuario desconocido");
  });

  it("devuelve una lista vacía si no hay préstamos", () => {
    expect(buildRecentLoanRows([], [{ id: "u1", nombre: "María" }])).toEqual(
      [],
    );
  });
});
