/**
 * Utilidades de moneda del dominio BiblioTEC.
 * Todos los montos (multas) se expresan en soles peruanos con el símbolo `S/`.
 */

/** Símbolo de la moneda usada en todo el sistema (soles peruanos). */
export const CURRENCY_SYMBOL = "S/";

/**
 * Formatea un monto como `S/ 0.00` con dos decimales.
 * Entradas inválidas (NaN, no numéricas) se tratan como 0 para no romper la UI.
 * Se formatea de forma determinista (no depende del locale del entorno).
 */
export function formatCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const rounded = Math.round((safe + Number.EPSILON) * 100) / 100;
  const [intPart = "0", decPart = "00"] = rounded.toFixed(2).split(".");
  // Separador de miles con espacio fino no rompe la lectura de montos pequeños;
  // para las cifras del dominio (multas) basta con agrupar de a 3.
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${CURRENCY_SYMBOL} ${grouped}.${decPart}`;
}
