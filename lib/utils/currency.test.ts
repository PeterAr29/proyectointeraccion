import { describe, expect, it } from "vitest";
import { CURRENCY_SYMBOL, formatCurrency } from "@/lib/utils/currency";

describe("formatCurrency", () => {
  it("siempre muestra dos decimales con el símbolo S/", () => {
    expect(formatCurrency(0)).toBe("S/ 0.00");
    expect(formatCurrency(1)).toBe("S/ 1.00");
    expect(formatCurrency(5)).toBe("S/ 5.00");
    expect(formatCurrency(12.5)).toBe("S/ 12.50");
  });

  it("redondea a dos decimales", () => {
    expect(formatCurrency(1.005)).toBe("S/ 1.01");
    expect(formatCurrency(2.994)).toBe("S/ 2.99");
  });

  it("agrupa miles con coma", () => {
    expect(formatCurrency(1234.5)).toBe("S/ 1,234.50");
    expect(formatCurrency(1000000)).toBe("S/ 1,000,000.00");
  });

  it("trata entradas no finitas como 0", () => {
    expect(formatCurrency(Number.NaN)).toBe("S/ 0.00");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("S/ 0.00");
  });

  it("expone el símbolo de la moneda", () => {
    expect(CURRENCY_SYMBOL).toBe("S/");
  });
});
