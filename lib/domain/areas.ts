import type { Carrera } from "@/lib/validations/auth";

/**
 * Taxonomía académica del catálogo (Módulo B).
 *
 * El catálogo universitario se organiza por ÁREAS / facultades, no por carrera:
 * un mismo libro (p. ej. Estadística o Metodología de la Investigación) sirve a
 * varias carreras, así que etiquetarlo por carrera lo escondería del resto. El
 * campo `books.categoria` almacena la ETIQUETA del área (una de `AREA_LABELS`).
 *
 * La carrera del estudiante (perfil) se usa solo para PERSONALIZAR: sugerir su
 * área al entrar al catálogo (ver `areaForCarrera`).
 */

/** Etiquetas de área tal como se guardan en `books.categoria` (valores estables). */
export const AREA_LABELS = [
  "Ingeniería y Tecnología",
  "Ciencias Agrarias",
  "Ciencias de la Salud",
  "Ciencias Empresariales",
  "Ciencias Sociales",
] as const;

export type AreaLabel = (typeof AREA_LABELS)[number];

export interface Area {
  /** Identificador estable en la URL/analítica (no se muestra). */
  slug: string;
  /** Etiqueta visible = valor guardado en `books.categoria`. */
  label: AreaLabel;
  /** Descripción breve para la tarjeta del hub. */
  descripcion: string;
}

/** Áreas del catálogo, en el orden en que se muestran en el hub. */
export const AREAS: Area[] = [
  {
    slug: "ingenieria-tecnologia",
    label: "Ingeniería y Tecnología",
    descripcion:
      "Sistemas, informática, industrial, mecánica y agroindustrial.",
  },
  {
    slug: "ciencias-agrarias",
    label: "Ciencias Agrarias",
    descripcion: "Agronomía y ciencias del agro.",
  },
  {
    slug: "ciencias-salud",
    label: "Ciencias de la Salud",
    descripcion: "Enfermería y ciencias de la salud.",
  },
  {
    slug: "ciencias-empresariales",
    label: "Ciencias Empresariales",
    descripcion: "Administración y contabilidad.",
  },
  {
    slug: "ciencias-sociales",
    label: "Ciencias Sociales",
    descripcion: "Trabajo social y ciencias sociales.",
  },
];

/**
 * Mapa carrera → área. Cada una de las 10 carreras del registro pertenece a un
 * área del catálogo (TypeScript obliga a mapearlas todas).
 */
export const CARRERA_AREA: Record<Carrera, AreaLabel> = {
  "Ingeniería de Sistemas": "Ingeniería y Tecnología",
  Informática: "Ingeniería y Tecnología",
  "Ingeniería Agroindustrial": "Ingeniería y Tecnología",
  "Ingeniería Industrial": "Ingeniería y Tecnología",
  "Ingeniería Mecánica": "Ingeniería y Tecnología",
  Agronomía: "Ciencias Agrarias",
  Enfermería: "Ciencias de la Salud",
  Administración: "Ciencias Empresariales",
  Contabilidad: "Ciencias Empresariales",
  "Trabajo Social": "Ciencias Sociales",
};

/** Área sugerida para una carrera (o `null` si no se reconoce / no hay carrera). */
export function areaForCarrera(
  carrera: string | null | undefined,
): AreaLabel | null {
  if (!carrera) return null;
  return (CARRERA_AREA as Record<string, AreaLabel>)[carrera] ?? null;
}

/** Busca un área por su etiqueta. */
export function findAreaByLabel(label: string | null | undefined): Area | null {
  if (!label) return null;
  return AREAS.find((area) => area.label === label) ?? null;
}
