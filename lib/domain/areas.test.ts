import { describe, expect, it } from "vitest";

import { CARRERAS } from "@/lib/validations/auth";
import {
  AREAS,
  AREA_LABELS,
  CARRERA_AREA,
  areaForCarrera,
  findAreaByLabel,
} from "@/lib/domain/areas";

describe("áreas del catálogo", () => {
  it("cada carrera del registro tiene un área asignada y válida", () => {
    for (const carrera of CARRERAS) {
      const area = CARRERA_AREA[carrera];
      expect(area).toBeTruthy();
      expect(AREA_LABELS).toContain(area);
    }
  });

  it("areaForCarrera resuelve el área de una carrera conocida", () => {
    expect(areaForCarrera("Enfermería")).toBe("Ciencias de la Salud");
    expect(areaForCarrera("Contabilidad")).toBe("Ciencias Empresariales");
    expect(areaForCarrera("Ingeniería de Sistemas")).toBe(
      "Ingeniería y Tecnología",
    );
  });

  it("areaForCarrera devuelve null si no hay carrera o no se reconoce", () => {
    expect(areaForCarrera(null)).toBeNull();
    expect(areaForCarrera("")).toBeNull();
    expect(areaForCarrera("Carrera Inexistente")).toBeNull();
  });

  it("findAreaByLabel encuentra el área por su etiqueta", () => {
    expect(findAreaByLabel("Ciencias Sociales")?.slug).toBe(
      "ciencias-sociales",
    );
    expect(findAreaByLabel("No existe")).toBeNull();
    expect(findAreaByLabel(null)).toBeNull();
  });

  it("AREAS y AREA_LABELS están alineadas", () => {
    expect(AREAS.map((a) => a.label)).toEqual([...AREA_LABELS]);
  });
});
