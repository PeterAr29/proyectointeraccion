/**
 * Enmascarado de PII para logs (especificaciones §5, RNF-SEC-LOG-1).
 * NUNCA se debe loggear el correo, teléfono o código universitario completos.
 */

/** `maria.garcia@univ.edu.pe` → `m***@univ.edu.pe`. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const first = local.slice(0, 1);
  return `${first}***@${domain}`;
}

/** `202100123` → `2021***23` (oculta el tramo central). */
export function maskCodigo(codigo: string): string {
  if (codigo.length <= 4) return "***";
  return `${codigo.slice(0, 4)}***${codigo.slice(-2)}`;
}
