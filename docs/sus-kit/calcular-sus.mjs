#!/usr/bin/env node
/**
 * Calculadora SUS de BiblioTEC — sin dependencias.
 *
 * Uso:  node docs/sus-kit/calcular-sus.mjs <ruta-al-csv>
 * Ej.:  node docs/sus-kit/calcular-sus.mjs docs/sus-kit/respuestas.csv
 *
 * Lee el CSV de respuestas (formato de respuestas-plantilla.csv), calcula el
 * puntaje SUS por participante y el promedio, el grado y el % de tareas críticas
 * completadas sin ayuda. Imprime además una tabla en Markdown lista para pegar en
 * docs/evaluacion-usabilidad.md §4.3. Fórmula: §4.2 del entregable.
 */
import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("Uso: node docs/sus-kit/calcular-sus.mjs <ruta-al-csv>");
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(path, "utf8");
} catch {
  console.error(`No pude leer el archivo: ${path}`);
  process.exit(1);
}

// --- Parser CSV mínimo (respeta comillas dobles) ---
function parseLine(line, delim) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0 && !l.startsWith("#"));

if (lines.length === 0) {
  console.error("El CSV no tiene filas de datos (solo comentarios o vacío).");
  process.exit(1);
}

// Delimitador: ';' si el encabezado tiene más ';' que ',' (Excel en español).
const header = lines[0];
const delim = (header.match(/;/g) || []).length > (header.match(/,/g) || []).length ? ";" : ",";

const rows = lines.slice(1).map((l) => parseLine(l, delim));
if (rows.length === 0) {
  console.error("No hay filas de participantes bajo el encabezado.");
  process.exit(1);
}

// --- Cálculo del SUS por participante ---
function susScore(items) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const r = items[i];
    // impares (1,3,5,7,9) → índices 0,2,4,6,8 : r-1 ; pares → 5-r
    sum += i % 2 === 0 ? r - 1 : 5 - r;
  }
  return sum * 2.5;
}

const results = [];
const warnings = [];
let taskTotal = 0;
let taskDone = 0;

rows.forEach((cols, idx) => {
  const id = cols[0] || `fila-${idx + 1}`;
  const rol = cols[1] || "—";
  const items = cols.slice(2, 12).map((v) => Number(v));
  if (items.length < 10 || items.some((n) => !Number.isFinite(n))) {
    warnings.push(`  · ${id}: faltan respuestas SUS o hay valores no numéricos → fila omitida.`);
    return;
  }
  if (items.some((n) => n < 1 || n > 5)) {
    warnings.push(`  · ${id}: alguna respuesta SUS fuera de rango 1–5 → fila omitida.`);
    return;
  }
  const sus = susScore(items);
  // Tareas T1..T4 (columnas 12..15), opcionales.
  const tasks = cols.slice(12, 16).map((v) => v).filter((v) => v === "0" || v === "1");
  tasks.forEach((t) => {
    taskTotal++;
    if (t === "1") taskDone++;
  });
  results.push({ id, rol, items, sus });
});

if (results.length === 0) {
  console.error("\nNo quedó ninguna fila válida. Revisa las advertencias:");
  warnings.forEach((w) => console.error(w));
  process.exit(1);
}

function grade(sus) {
  if (sus >= 80.3) return "A — Excelente";
  if (sus >= 75) return "Cumple la meta (≥75)";
  if (sus >= 68) return "Aceptable, bajo la meta";
  return "Bajo el promedio";
}

const avg = results.reduce((a, r) => a + r.sus, 0) / results.length;
const taskRate = taskTotal > 0 ? (taskDone / taskTotal) * 100 : null;

// --- Salida ---
const line = "─".repeat(60);
console.log(`\n${line}\n  RESULTADOS SUS — BiblioTEC  (${results.length} participantes)\n${line}`);

const head = "Part.  Rol            " + Array.from({ length: 10 }, (_, i) => `I${i + 1}`.padStart(3)).join(" ") + "   SUS";
console.log("\n" + head);
console.log("-".repeat(head.length));
for (const r of results) {
  const items = r.items.map((n) => String(n).padStart(3)).join(" ");
  console.log(`${r.id.padEnd(6)} ${r.rol.padEnd(14)} ${items}   ${r.sus.toFixed(1)}`);
}

console.log(`\n  Promedio SUS: ${avg.toFixed(1)}  →  ${grade(avg)}`);
console.log(`  Meta del proyecto (≥75): ${avg >= 75 ? "✅ CUMPLE" : "❌ NO cumple"}`);
if (taskRate !== null) {
  console.log(`\n  Tareas críticas completadas sin ayuda: ${taskDone}/${taskTotal} = ${taskRate.toFixed(1)}%`);
  console.log(`  Meta (≥90%): ${taskRate >= 90 ? "✅ CUMPLE" : "❌ NO cumple"}`);
} else {
  console.log(`\n  (No se registraron tareas T1–T4; se omite el % de tareas.)`);
}

if (warnings.length > 0) {
  console.log(`\n  ⚠️  Advertencias:`);
  warnings.forEach((w) => console.log(w));
}

// --- Tabla Markdown lista para pegar en el entregable §4.3 ---
console.log(`\n${line}\n  TABLA MARKDOWN (pégala en docs/evaluacion-usabilidad.md §4.3)\n${line}\n`);
console.log("| Part. | I1  | I2  | I3  | I4  | I5  | I6  | I7  | I8  | I9  | I10 | SUS   |");
console.log("| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ----- |");
for (const r of results) {
  const cells = r.items.map((n) => String(n).padEnd(3)).join(" | ");
  console.log(`| ${r.id.padEnd(5)} | ${cells} | ${r.sus.toFixed(1).padEnd(5)} |`);
}
const promLabel = results.map((r) => r.sus.toFixed(1)).join("+");
console.log(`\n**Promedio SUS real: (${promLabel})/${results.length} = ${avg.toFixed(1)}** → ${grade(avg)}.`);
console.log("");
