/**
 * Utilidad de exportación a CSV (Módulo E, F5.4). Pura y sin dependencias del
 * navegador ni del servidor: se usa tanto en cliente (generar la descarga) como
 * en los tests. Escapa según RFC 4180 (comillas, comas y saltos de línea).
 */

/** Escapa un valor de celda: lo entrecomilla si contiene `,` `"` o salto de línea. */
function escapeCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Construye un CSV a partir de encabezados y filas. Cada fila debe tener el mismo
 * número de columnas que los encabezados. Antepone el BOM UTF-8 para que Excel
 * muestre bien los acentos.
 */
export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return `﻿${lines.join("\r\n")}`;
}
