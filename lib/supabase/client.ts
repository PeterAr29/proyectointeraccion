import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para el NAVEGADOR (componentes con "use client").
 * Usa solo la anon key pública; la autorización real la aplica RLS en Postgres.
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
