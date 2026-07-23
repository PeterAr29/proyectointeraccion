import type { NextConfig } from "next";

/**
 * Content-Security-Policy de BiblioTEC (A05 — Misconfiguration).
 *
 * Política deny-by-default: solo se permite lo que la app realmente necesita.
 * - script/style-src permiten 'unsafe-inline' porque Next.js (App Router) inyecta
 *   scripts de hidratación y estilos en línea sin nonce. Endurecerlo a nonces
 *   exige mover la CSP al middleware y desactiva la generación estática de varias
 *   páginas; queda anotado como deuda técnica (upgrade a CSP con nonce).
 * - connect/img-src abren Supabase (API REST + Storage de portadas + Realtime por
 *   WebSocket). El wildcard *.supabase.co cubre el subdominio del proyecto.
 * - img-src también permite las carátulas de OpenLibrary por ISBN
 *   (covers.openlibrary.org), que redirige a los servidores de imágenes de
 *   Internet Archive (*.us.archive.org); ambos hosts se listan para que la
 *   imagen final del redirect también cargue. Solo imágenes: el resto sigue
 *   cerrado (script/object/frame-ancestors).
 * - worker-src 'self' y manifest-src 'self' habilitan el service worker y el
 *   manifest de la PWA (F6.2), servidos desde el mismo origen.
 * - frame-ancestors 'none' + object-src 'none' + base-uri 'self' cierran
 *   clickjacking e inyección de <base>/<object>.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://covers.openlibrary.org https://*.us.archive.org",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Cabeceras de seguridad aplicadas a TODA respuesta (A02/A04/A05).
 * HSTS solo tiene efecto sobre HTTPS (Vercel); es inocuo en local (HTTP).
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El acceso a datos siempre pasa por lib/services/* (nunca Supabase directo en
  // componentes). La autorización real es RLS; estas cabeceras son defensa en
  // profundidad del transporte y del navegador. No se abre CORS a otros orígenes:
  // la arquitectura es same-origin (Server Actions), así que el navegador rechaza
  // por defecto peticiones cross-origin — esa es la postura segura.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
