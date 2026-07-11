import { describe, expect, it } from "vitest";

import {
  bookFormSchema,
  bookInputToRow,
  validateCoverFile,
  COVER_MAX_BYTES,
} from "@/lib/validations/books";

const base = {
  titulo: "Redes de Computadoras",
  autor: "Tanenbaum",
  editorial: "",
  anio: "",
  isbn: "",
  categoria: "",
  ubicacion: "",
  descripcion: "",
  cantidad_total: "3",
  cantidad_disponible: "2",
};

describe("bookFormSchema", () => {
  it("acepta un libro válido y coacciona números", () => {
    const parsed = bookFormSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.cantidad_total).toBe(3);
      expect(parsed.data.cantidad_disponible).toBe(2);
    }
  });

  it("rechaza título vacío", () => {
    const parsed = bookFormSchema.safeParse({ ...base, titulo: "" });
    expect(parsed.success).toBe(false);
  });

  it("rechaza disponibles > totales (§7.2)", () => {
    const parsed = bookFormSchema.safeParse({
      ...base,
      cantidad_total: "2",
      cantidad_disponible: "5",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza un año fuera de rango", () => {
    expect(bookFormSchema.safeParse({ ...base, anio: "1200" }).success).toBe(
      false,
    );
    expect(bookFormSchema.safeParse({ ...base, anio: "2019" }).success).toBe(
      true,
    );
  });

  it("acepta ISBN vacío pero rechaza uno con letras inválidas", () => {
    expect(bookFormSchema.safeParse({ ...base, isbn: "" }).success).toBe(true);
    expect(bookFormSchema.safeParse({ ...base, isbn: "abc" }).success).toBe(
      false,
    );
  });
});

describe("bookInputToRow", () => {
  it("convierte textos vacíos en null y resuelve el año", () => {
    const parsed = bookFormSchema.parse({
      ...base,
      anio: "2020",
      editorial: " ",
    });
    const row = bookInputToRow(parsed);
    expect(row.editorial).toBeNull();
    expect(row.isbn).toBeNull();
    expect(row.anio).toBe(2020);
    expect(row.titulo).toBe("Redes de Computadoras");
    expect(row.cantidad_total).toBe(3);
  });

  it("deja el año en null cuando no se indica", () => {
    const row = bookInputToRow(bookFormSchema.parse(base));
    expect(row.anio).toBeNull();
  });
});

describe("validateCoverFile", () => {
  it("acepta JPG/PNG/WebP dentro del límite", () => {
    expect(validateCoverFile({ type: "image/png", size: 1000 }).ok).toBe(true);
  });

  it("rechaza tipos no permitidos", () => {
    expect(validateCoverFile({ type: "application/pdf", size: 1000 }).ok).toBe(
      false,
    );
  });

  it("rechaza archivos que superan el máximo", () => {
    expect(
      validateCoverFile({ type: "image/png", size: COVER_MAX_BYTES + 1 }).ok,
    ).toBe(false);
  });
});
