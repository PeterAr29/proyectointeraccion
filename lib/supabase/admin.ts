import { createClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase con SERVICE ROLE (ignora RLS).
 * ⚠️ SOLO servidor. La clave se lee de `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo
 * NEXT_PUBLIC), así que Next.js nunca la inyecta en el bundle del navegador; si
 * este módulo se importara en cliente por error, la clave sería `undefined` y
 * lanzaría (protege el secreto, A02).
 *
 * Se usa exclusivamente para operaciones de plataforma que no puede hacer un
 * usuario anónimo bajo RLS: resolver el correo a partir del código universitario
 * en el login/recuperación y crear la cuenta en el registro. NUNCA para leer
 * datos de dominio de un usuario (eso va por el cliente con sesión + RLS).
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient no puede ejecutarse en el navegador.");
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Cópiala de .env.example a .env.local (solo servidor).",
    );
  }

  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
