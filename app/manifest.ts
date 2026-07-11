import type { MetadataRoute } from "next";

/**
 * Manifest de la PWA (RNF-10, especificaciones §9.4). Next.js lo sirve en
 * `/manifest.webmanifest` desde el mismo origen (permitido por `manifest-src
 * 'self'` de la CSP). Con `display: standalone` la app se instala en el móvil
 * como aplicación de pantalla completa (sin barra del navegador).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BiblioTEC — Biblioteca universitaria",
    short_name: "BiblioTEC",
    description:
      "Catálogo, préstamos, reservas y multas de la biblioteca universitaria.",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFC",
    theme_color: "#1D4ED8",
    lang: "es",
    dir: "ltr",
    categories: ["education", "books", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
