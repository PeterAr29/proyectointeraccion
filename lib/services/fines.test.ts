import { describe, expect, it } from "vitest";

import { computeDaysOverdue, computeFineAmount } from "@/lib/services/fines";

describe("computeDaysOverdue", () => {
  const now = new Date(2026, 6, 10); // 10/07/2026 (local)

  it("es 0 si la fecha estimada es hoy o futura (aún no vence)", () => {
    expect(computeDaysOverdue("2026-07-10", now)).toBe(0);
    expect(computeDaysOverdue("2026-07-20", now)).toBe(0);
  });

  it("cuenta los días completos de retraso", () => {
    expect(computeDaysOverdue("2026-07-09", now)).toBe(1);
    expect(computeDaysOverdue("2026-07-03", now)).toBe(7);
  });

  it("nunca es negativo", () => {
    expect(computeDaysOverdue("2027-01-01", now)).toBe(0);
  });
});

describe("computeFineAmount (§7.2.4: dias_retraso × multa_diaria)", () => {
  it("es 0 con 0 días de retraso", () => {
    expect(computeFineAmount(0, 1)).toBe(0);
  });

  it("multiplica días por la multa diaria", () => {
    expect(computeFineAmount(1, 1)).toBe(1);
    expect(computeFineAmount(7, 1)).toBe(7);
    expect(computeFineAmount(3, 1.5)).toBe(4.5);
  });

  it("redondea a 2 decimales (sin errores de coma flotante)", () => {
    expect(computeFineAmount(3, 0.1)).toBe(0.3); // 0.1*3 = 0.30000000000000004
    expect(computeFineAmount(7, 0.35)).toBe(2.45);
  });

  it("trunca días fraccionarios y evita valores negativos", () => {
    expect(computeFineAmount(2.9, 1)).toBe(2);
    expect(computeFineAmount(-5, 1)).toBe(0);
    expect(computeFineAmount(5, -1)).toBe(0);
  });
});
