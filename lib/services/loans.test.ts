import { describe, expect, it } from "vitest";

import { computeDueDate, mapCreateLoanError } from "@/lib/services/loans";

describe("computeDueDate", () => {
  it("suma los días de préstamo a la fecha base", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 14);
    expect(due).toEqual(new Date(2026, 6, 24));
  });

  it("cruza correctamente el fin de mes", () => {
    const due = computeDueDate(new Date(2026, 6, 25), 14);
    expect(due).toEqual(new Date(2026, 7, 8)); // 25/07 + 14 = 08/08
  });

  it("con 0 días la fecha no cambia", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 0);
    expect(due).toEqual(new Date(2026, 6, 10));
  });

  it("trunca días fraccionarios", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 14.9);
    expect(due).toEqual(new Date(2026, 6, 24));
  });
});

describe("mapCreateLoanError (SQLSTATE de la RPC → motivo de negocio)", () => {
  it("mapea sin stock (ofrecer reservar)", () => {
    expect(mapCreateLoanError("BT001")).toBe("no-stock");
  });

  it("mapea préstamo duplicado del mismo libro (no permitir doble préstamo)", () => {
    expect(mapCreateLoanError("BT002")).toBe("already-loaned");
  });

  it("mapea libro inexistente y sesión ausente", () => {
    expect(mapCreateLoanError("BT404")).toBe("not-found");
    expect(mapCreateLoanError("BT000")).toBe("no-session");
  });

  it("cualquier otro código cae en error genérico", () => {
    expect(mapCreateLoanError("23505")).toBe("error");
    expect(mapCreateLoanError(undefined)).toBe("error");
  });
});
