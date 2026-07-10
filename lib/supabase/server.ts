import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para el SERVIDOR (Server Components, Server Actions,
 * Route Handlers). Lee/escribe la sesión desde las cookies de la request.
 * En Next 15 `cookies()` es asíncrono, por eso esta función es async.
 *
 * La escritura de cookies falla silenciosamente cuando se invoca desde un
 * Server Component (no puede mutar la respuesta): el refresco de sesión lo
 * garantiza el middleware (`lib/supabase/middleware.ts`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Invocado desde un Server Component: ignorable, el middleware refresca.
        }
      },
    },
  });
}
