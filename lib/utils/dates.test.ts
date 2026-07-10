import { describe, expect, it } from "vitest";
import {
  NO_DATE,
  daysBetween,
  formatDate,
  isPastDate,
  toDate,
} from "@/lib/utils/dates";

describe("formatDate", () => {
  it("formatea un Date como DD/MM/AAAA con ceros a la izquierda", () => {
    expect(formatDate(new Date(2024, 4, 9))).toBe("09/05/2024");
    expect(formatDate(new Date(2024, 11, 25))).toBe("25/12/2024");
  });

  it("acepta cadenas ISO de fecha (día local)", () => {
    expect(formatDate("2024-05-25")).toBe("25/05/2024");
  });

  it("devuelve el marcador — para valores nulos o inválidos", () => {
    expect(formatDate(null)).toBe(NO_DATE);
    expect(formatDate(undefined)).toBe(NO_DATE);
    expect(formatDate("no es fecha")).toBe(NO_DATE);
  });
});

describe("toDate", () => {
  it("devuelve null ante entradas inválidas y Date ante válidas", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate("xxx")).toBeNull();
    expect(toDate(new Date(2024, 0, 1))).toBeInstanceOf(Date);
  });
});

describe("isPastDate", () => {
  it("una fecha claramente anterior a hoy es pasada", () => {
    expect(isPastDate(new Date(2000, 0, 1))).toBe(true);
  });

  it("una fecha claramente futura no es pasada", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isPastDate(future)).toBe(false);
  });

  it("valores nulos/ inválidos no cuentan como pasados", () => {
    expect(isPastDate(null)).toBe(false);
    expect(isPastDate("nope")).toBe(false);
  });
});

describe("daysBetween", () => {
  it("cuenta días completos entre dos fechas", () => {
    expect(daysBetween(new Date(2024, 4, 1), new Date(2024, 4, 15))).toBe(14);
  });

  it("es negativo cuando la segunda fecha es anterior", () => {
    expect(daysBetween(new Date(2024, 4, 15), new Date(2024, 4, 10))).toBe(-5);
  });

  it("devuelve 0 si falta alguna fecha", () => {
    expect(daysBetween(null, new Date())).toBe(0);
  });
});
