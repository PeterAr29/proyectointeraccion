/**
 * Rate limiting básico en memoria (especificaciones §5: A04-3 y A07-2).
 * Bloquea temporalmente tras N intentos fallidos por clave (código/correo).
 *
 * ⚠️ Es un limitador POR INSTANCIA de servidor: se reinicia con el proceso y no
 * se comparte entre instancias serverless. Suficiente para el contexto
 * académico/piloto (decenas de usuarios); en producción real se movería a un
 * store compartido (p. ej. Upstash/Redis). Documentado como deuda técnica.
 */

interface Attempt {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

const attempts = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min para acumular intentos
const LOCK_MS = 15 * 60 * 1000; // 15 min de bloqueo tras superar el máximo

export interface RateLimitResult {
  blocked: boolean;
  /** Segundos restantes de bloqueo (0 si no está bloqueado). */
  retryAfter: number;
}

/** Consulta si la clave está bloqueada (no incrementa el contador). */
export function checkRateLimit(key: string): RateLimitResult {
  const entry = attempts.get(key);
  const now = Date.now();
  if (entry && entry.lockedUntil > now) {
    return {
      blocked: true,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  return { blocked: false, retryAfter: 0 };
}

/** Registra un intento fallido y bloquea si se supera el máximo. */
export function registerFailure(key: string): RateLimitResult {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return { blocked: false, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
    attempts.set(key, entry);
    return { blocked: true, retryAfter: Math.ceil(LOCK_MS / 1000) };
  }

  attempts.set(key, entry);
  return { blocked: false, retryAfter: 0 };
}

/** Limpia el registro de intentos tras un acceso exitoso. */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}
