import { z } from "zod";

import { AREA_LABELS } from "@/lib/domain/areas";

/**
 * Esquema del formulario de libro (Módulo E, F5.2). Se reutiliza en cliente
 * (react-hook-form) y en servidor (Server Action): la validación del servidor es
 * la que manda. Reglas alineadas con los checks del esquema (§7.2 / init_schema):
 * año 1450–2100, cantidades ≥ 0 y `disponible ≤ total`. La portada se sube aparte
 * (Storage) y se inyecta como `portada_url`, no viaja en este formulario.
 */

/** Texto opcional: permite vacío (el form envía "") y se normaliza a null luego. */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

/** Año opcional: "" → sin valor; si viene, entero entre 1450 y 2100. */
const optionalYear = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce
    .number()
    .int("El año debe ser un número entero")
    .min(1450, "Año demasiado antiguo")
    .max(2100, "Año inválido")
    .optional(),
);

const cantidad = z.coerce
  .number()
  .int("Debe ser un número entero")
  .min(0, "No puede ser negativo")
  .max(100000, "Cantidad demasiado alta");

export const bookFormSchema = z
  .object({
    titulo: z.string().trim().min(1, "Ingresa el título").max(200),
    autor: z.string().trim().min(1, "Ingresa el autor").max(160),
    editorial: optionalText(160),
    anio: optionalYear,
    isbn: z
      .string()
      .trim()
      .regex(/^[0-9Xx-]{10,20}$/, "ISBN inválido")
      .optional()
      .or(z.literal("")),
    // El área (categoría) es una lista controlada: el catálogo se organiza por
    // ella. Se permite "" (sin área) para libros aún sin clasificar.
    categoria: z.enum(AREA_LABELS).or(z.literal("")).optional(),
    ubicacion: optionalText(120),
    descripcion: optionalText(2000),
    cantidad_total: cantidad,
    cantidad_disponible: cantidad,
  })
  .refine((d) => d.cantidad_disponible <= d.cantidad_total, {
    message: "Los disponibles no pueden superar el total de ejemplares",
    path: ["cantidad_disponible"],
  });

export type BookFormInput = z.infer<typeof bookFormSchema>;

/** Fila lista para insertar/actualizar en `books` (opcionalmente con portada). */
export interface BookRowPayload {
  titulo: string;
  autor: string;
  editorial: string | null;
  anio: number | null;
  isbn: string | null;
  categoria: string | null;
  ubicacion: string | null;
  descripcion: string | null;
  cantidad_total: number;
  cantidad_disponible: number;
  portada_url?: string | null;
}

/** Convierte "" en null (pura y testeable): la BD guarda null, no cadenas vacías. */
function nullifyEmpty(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Normaliza la entrada validada del formulario a la fila de `books`. Los campos
 * de texto vacíos pasan a null; el año ausente, a null. Pura y testeable sin BD.
 */
export function bookInputToRow(input: BookFormInput): BookRowPayload {
  return {
    titulo: input.titulo.trim(),
    autor: input.autor.trim(),
    editorial: nullifyEmpty(input.editorial),
    anio: input.anio ?? null,
    isbn: nullifyEmpty(input.isbn),
    categoria: nullifyEmpty(input.categoria),
    ubicacion: nullifyEmpty(input.ubicacion),
    descripcion: nullifyEmpty(input.descripcion),
    cantidad_total: input.cantidad_total,
    cantidad_disponible: input.cantidad_disponible,
  };
}

/** Extensiones de imagen aceptadas para la portada. */
export const COVER_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
/** Tamaño máximo de la portada (2 MB). */
export const COVER_MAX_BYTES = 2 * 1024 * 1024;

/** Valida un archivo de portada (tipo y tamaño). Pura: no toca Storage. */
export function validateCoverFile(file: {
  type: string;
  size: number;
}): { ok: true } | { ok: false; error: string } {
  if (!COVER_ACCEPT.includes(file.type as (typeof COVER_ACCEPT)[number])) {
    return { ok: false, error: "La portada debe ser JPG, PNG o WebP." };
  }
  if (file.size > COVER_MAX_BYTES) {
    return { ok: false, error: "La portada no puede superar 2 MB." };
  }
  return { ok: true };
}
