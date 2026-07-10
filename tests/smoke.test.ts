import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

/**
 * Smoke test de F1.1: confirma que el runner (Vitest) y el alias @ funcionan,
 * y que la utilidad base del sistema de diseño (cn) resuelve conflictos de Tailwind.
 */
describe("infraestructura F1.1", () => {
  it("el entorno de test está vivo", () => {
    expect(1 + 1).toBe(2);
  });

  it("cn combina clases y la última gana ante conflicto", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});
