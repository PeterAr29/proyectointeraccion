/**
 * Service worker de BiblioTEC (F6.2) — hecho a mano, sin dependencias (§5.3).
 *
 * Objetivos: (1) instalabilidad de la PWA y (2) offline básico del "shell".
 * NO cachea datos: toda la información viva sigue viniendo de Supabase por red.
 *
 * Estrategias:
 *  - Navegaciones (documentos): network-first. Si la red falla (offline), sirve
 *    la página estática `/offline.html` desde caché. Así los datos siempre están
 *    frescos cuando hay conexión y hay una experiencia digna sin ella.
 *  - Estáticos propios (/_next/static, /icons, manifest): cache-first con
 *    revalidación en segundo plano (stale-while-revalidate).
 *  - Todo lo demás (incluido Supabase y las Server Actions POST): passthrough a
 *    la red, nunca se cachea.
 */
// v2: nuevo logo de marca (búho). Subir la versión purga el caché anterior en
// `activate`, forzando a rebajar los iconos nuevos (antes servía el libro viejo).
const CACHE = "bibliotec-shell-v2";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // nunca cachear mutaciones

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase u otros: a la red

  // Navegaciones → network-first con fallback a la página offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL, { ignoreSearch: true }),
      ),
    );
    return;
  }

  // Estáticos propios → cache-first + revalidación en segundo plano.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
