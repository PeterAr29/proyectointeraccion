import { describe, expect, it } from "vitest";

import { settingsSchema } from "@/lib/validations/settings";

const base = { diasPrestamo: "14", multaDiaria: "1.00", maxRenovaciones: "2" };

describe("settingsSchema", () => {
  it("acepta valores válidos y coacciona a número", () => {
    const parsed = settingsSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.diasPrestamo).toBe(14);
      expect(parsed.data.multaDiaria).toBe(1);
      expect(parsed.data.maxRenovaciones).toBe(2);
    }
  });

  it("rechaza días de préstamo menores a 1", () => {
    expect(
      settingsSchema.safeParse({ ...base, diasPrestamo: "0" }).success,
    ).toBe(false);
  });

  it("rechaza multa diaria negativa", () => {
    expect(
      settingsSchema.safeParse({ ...base, multaDiaria: "-1" }).success,
    ).toBe(false);
  });

  it("rechaza renovaciones no enteras", () => {
    expect(
      settingsSchema.safeParse({ ...base, maxRenovaciones: "2.5" }).success,
    ).toBe(false);
  });

  it("acepta multa diaria con decimales", () => {
    expect(
      settingsSchema.safeParse({ ...base, multaDiaria: "0.5" }).success,
    ).toBe(true);
  });
});
