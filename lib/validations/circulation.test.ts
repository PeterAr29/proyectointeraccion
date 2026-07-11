import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  dueDateSchema,
  isDueDateValid,
  parseBookId,
  parseLoanId,
} from "@/lib/validations/circulation";

describe("parseBookId (circulation)", () => {
  it("acepta un UUID válido", () => {
    const uuid = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
    expect(parseBookId(uuid)).toBe(uuid);
  });

  it("rechaza lo que no es UUID (segmento crudo de la URL)", () => {
    expect(parseBookId("123")).toBeNull();
    expect(parseBookId("../../etc")).toBeNull();
    expect(parseBookId(undefined)).toBeNull();
    expect(parseBookId("")).toBeNull();
  });
});

describe("parseLoanId (circulation)", () => {
  it("acepta un UUID válido y rechaza lo que no lo es", () => {
    const uuid = "10000000-0000-0000-0000-000000000001";
    expect(parseLoanId(uuid)).toBe(uuid);
    expect(parseLoanId("l1")).toBeNull();
    expect(parseLoanId(undefined)).toBeNull();
  });
});

describe("isDueDateValid (regla §7.2.2: no anterior a hoy)", () => {
  // Fija "hoy" para que la prueba sea determinista sin importar cuándo corra.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 9, 30)); // 10/07/2026 09:30 local
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("acepta hoy (mismo día, cualquier hora)", () => {
    expect(isDueDateValid(new Date(2026, 6, 10, 23, 59))).toBe(true);
  });

  it("acepta una fecha futura", () => {
    expect(isDueDateValid(new Date(2026, 6, 24))).toBe(true);
  });

  it("rechaza una fecha anterior a hoy", () => {
    expect(isDueDateValid(new Date(2026, 6, 9))).toBe(false);
  });

  it("rechaza entradas inválidas o vacías", () => {
    expect(isDueDateValid(null)).toBe(false);
    expect(isDueDateValid(undefined)).toBe(false);
    expect(isDueDateValid("no es una fecha")).toBe(false);
  });

  it("dueDateSchema valida hoy/futuro y rechaza el pasado", () => {
    expect(dueDateSchema.safeParse(new Date(2026, 6, 24)).success).toBe(true);
    expect(dueDateSchema.safeParse(new Date(2026, 6, 9)).success).toBe(false);
  });
});
