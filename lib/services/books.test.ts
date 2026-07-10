import { describe, expect, it } from "vitest";

import {
  PAGE_SIZE,
  buildSearchFilter,
  computePagination,
  isAvailable,
} from "@/lib/services/books";
import { parseCatalogFilters } from "@/lib/validations/catalog";

describe("buildSearchFilter", () => {
  it("genera un filtro OR ilike sobre título, autor e ISBN", () => {
    expect(buildSearchFilter("Tanenbaum")).toBe(
      "titulo.ilike.%Tanenbaum%,autor.ilike.%Tanenbaum%,isbn.ilike.%Tanenbaum%",
    );
  });

  it("devuelve null cuando el término queda vacío tras limpiar", () => {
    expect(buildSearchFilter("")).toBeNull();
    expect(buildSearchFilter("   ")).toBeNull();
    expect(buildSearchFilter("%,()*")).toBeNull();
  });

  it("neutraliza caracteres de la gramática de PostgREST y comodines LIKE (A03)", () => {
    // Comas, paréntesis, asteriscos, backslash y % no deben inyectar operadores.
    const filter = buildSearchFilter("a,b)(c*%\\d");
    expect(filter).toBe(
      "titulo.ilike.%a b c d%,autor.ilike.%a b c d%,isbn.ilike.%a b c d%",
    );
  });

  it("colapsa espacios internos y recorta los extremos", () => {
    expect(buildSearchFilter("  redes   de  ")).toBe(
      "titulo.ilike.%redes de%,autor.ilike.%redes de%,isbn.ilike.%redes de%",
    );
  });
});

describe("computePagination", () => {
  it("calcula el total de páginas y el rango de la primera página", () => {
    const p = computePagination(30, 1, 12);
    expect(p).toEqual({ page: 1, totalPages: 3, from: 0, to: 11 });
  });

  it("calcula el rango de una página intermedia", () => {
    const p = computePagination(30, 2, 12);
    expect(p).toEqual({ page: 2, totalPages: 3, from: 12, to: 23 });
  });

  it("acota la página pedida al total real (por encima del rango)", () => {
    const p = computePagination(30, 99, 12);
    expect(p.page).toBe(3);
    expect(p.from).toBe(24);
  });

  it("acota páginas no positivas o inválidas a 1", () => {
    expect(computePagination(30, 0, 12).page).toBe(1);
    expect(computePagination(30, -5, 12).page).toBe(1);
    expect(computePagination(30, Number.NaN, 12).page).toBe(1);
  });

  it("con cero resultados hay una sola página vacía", () => {
    expect(computePagination(0, 1, 12)).toEqual({
      page: 1,
      totalPages: 1,
      from: 0,
      to: 11,
    });
  });

  it("usa PAGE_SIZE por defecto", () => {
    expect(computePagination(PAGE_SIZE + 1, 2).page).toBe(2);
  });
});

describe("isAvailable", () => {
  it("es true solo si quedan ejemplares disponibles", () => {
    expect(isAvailable({ cantidad_disponible: 3 })).toBe(true);
    expect(isAvailable({ cantidad_disponible: 1 })).toBe(true);
    expect(isAvailable({ cantidad_disponible: 0 })).toBe(false);
  });
});

describe("parseCatalogFilters", () => {
  it("aplica valores por defecto cuando no hay query params", () => {
    expect(parseCatalogFilters({})).toEqual({
      q: "",
      categoria: "",
      ubicacion: "",
      disponibilidad: "todos",
      page: 1,
    });
  });

  it("recorta el término y coacciona la página a número", () => {
    const f = parseCatalogFilters({ q: "  redes  ", page: "3" });
    expect(f.q).toBe("redes");
    expect(f.page).toBe(3);
  });

  it("tolera basura sin lanzar: cae a los valores por defecto", () => {
    const f = parseCatalogFilters({
      disponibilidad: "inventado",
      page: "-2",
    });
    expect(f.disponibilidad).toBe("todos");
    expect(f.page).toBe(1);
  });

  it("toma el primer valor cuando un parámetro llega repetido", () => {
    const f = parseCatalogFilters({ q: ["uno", "dos"] });
    expect(f.q).toBe("uno");
  });
});
