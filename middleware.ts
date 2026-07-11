import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware raíz: refresca la sesión de Supabase en cada request (vía
 * `updateSession`) y protege las rutas. Deny-by-default: todo lo que no sea
 * público exige sesión (A01). La autorización FINA (rol) la aplica RLS en la BD;
 * aquí solo se controla "hay sesión o no".
 *
 * ⚠️ Archivo sensible (lista "no tocar sin avisar" de CLAUDE.md).
 */

// Rutas accesibles sin sesión. Todo lo demás requiere autenticación.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registro",
  "/recuperar",
  "/privacidad",
  "/kitchen-sink",
  // Recursos de la PWA (F6.2): deben servirse sin sesión para que la app sea
  // instalable y el service worker se registre. No exponen datos.
  "/manifest.webmanifest",
  "/sw.js",
  "/offline.html",
];
const AUTH_PATHS = ["/login", "/registro", "/recuperar"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Sin sesión y ruta protegida → al login (recordando a dónde iba).
  if (!user && !isPublic(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return copyCookies(NextResponse.redirect(loginUrl), response);
  }

  // Con sesión y en una pantalla de acceso → directo al inicio de la app.
  if (user && AUTH_PATHS.includes(pathname)) {
    return copyCookies(
      NextResponse.redirect(new URL("/inicio", request.url)),
      response,
    );
  }

  return response;
}

/** Traslada las cookies de sesión refrescadas a la respuesta de redirección. */
function copyCookies(target: NextResponse, source: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

export const config = {
  // Ejecuta en todas las rutas salvo estáticos y assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
