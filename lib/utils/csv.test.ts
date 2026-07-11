import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/utils/csv";

describe("toCsv", () => {
  it("genera encabezados y filas separadas por CRLF (con BOM)", () => {
    const csv = toCsv(["Mes", "Préstamos"], [["2026-07", 3]]);
    expect(csv).toBe("﻿Mes,Préstamos\r\n2026-07,3");
  });

  it("entrecomilla las celdas con comas, comillas o saltos de línea", () => {
    const csv = toCsv(["A", "B"], [["Rojas, Ana", 'dijo "hola"']]);
    expect(csv).toContain('"Rojas, Ana","dijo ""hola"""');
  });

  it("trata null/undefined como celda vacía", () => {
    const csv = toCsv(["A", "B"], [[null, undefined]]);
    expect(csv.endsWith(",")).toBe(true);
  });
});
