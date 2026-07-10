/**
 * Lectura validada de las variables de entorno públicas de Supabase.
 * Se referencian de forma literal para que Next.js las inyecte en el bundle.
 * NUNCA leer aquí SUPABASE_SERVICE_ROLE_KEY: es secreta y solo servidor.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Cópiala de .env.example a .env.local.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

export const SUPABASE_ANON_KEY = required(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);
