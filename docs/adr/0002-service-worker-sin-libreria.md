# ADR-0002: Service worker de la PWA hecho a mano (sin librería)

**Fecha:** 2026-07-11
**Estado:** Aceptado
**Contexto de fase:** F6.2 (Endurecimiento, PWA y despliegue)

## Contexto

RNF-10 y especificaciones §9.4 exigen que BiblioTEC sea una **PWA instalable en
móviles** con **offline básico** (cachear el shell; los datos siguen viniendo de
Supabase por red). Para la instalabilidad hace falta un manifest y un service
worker registrado; para el offline básico, una estrategia de caché.

La guía de F6.2 sugiere evaluar (§5.3) una librería como `@ducanh2912/next-pwa`
antes de añadirla y registrar la decisión en un ADR.

## Decisión

**No añadir ninguna librería de PWA.** Se implementa un **service worker propio**
(`public/sw.js`, ~60 líneas) registrado por un pequeño componente cliente
(`components/pwa/ServiceWorker.tsx`), y el manifest con la API nativa de Next.js
(`app/manifest.ts`).

Estrategias del SW:

- **Navegaciones:** network-first con fallback a `public/offline.html`.
- **Estáticos propios** (`/_next/static`, `/icons`, manifest): cache-first con
  revalidación en segundo plano.
- **Supabase / cross-origin / mutaciones (POST):** passthrough a la red, nunca
  se cachean (los datos vivos y las Server Actions siempre van al servidor).

## Alternativas consideradas

### `@ducanh2912/next-pwa` (wrapper de Workbox para Next 15)

- ✅ Precaché automático del build, recetas de runtime caching listas.
- ❌ Añade Workbox (dependencia transitiva pesada) y un paso de build que
  **inyecta y genera JS**; complica la **CSP** (F6.2 la endurece) y opaca qué se
  cachea. Para nuestro alcance (offline básico del shell, decenas de usuarios) es
  desproporcionado. §5.3 pide preferir lo mínimo mantenible y auditable.

### No hacer PWA / solo manifest sin SW

- ✅ Cero código de caché.
- ❌ Sin SW no hay instalabilidad completa ni offline; incumple RNF-10 y el DoD
  de F6.2 (Lighthouse PWA en verde).

## Consecuencias

**Positivas:**

- Sin nuevas dependencias (alineado con §5.3 y con la postura de F6.1, que también
  evitó librerías para la trampa de foco). SW totalmente auditable y bajo control.
- CSP simple: `worker-src 'self'` basta; no hay scripts de terceros que permitir.
- El SW es explícito sobre qué se cachea y qué no (nunca datos de Supabase).

**Negativas / Riesgos:**

- Mantenemos nosotros la lógica de caché y el versionado del `CACHE` (hoy
  `bibliotec-shell-v1`); al cambiar assets críticos hay que subir la versión para
  invalidar. Mitigación: el SW limpia cachés viejas en `activate` y usa
  network-first en navegaciones (nunca sirve HTML obsoleto estando online).
- No hay precaché del build completo; el offline se limita al shell + página
  `offline.html`. Es exactamente el alcance pedido ("offline básico").

## Referencias

- `docs/especificaciones.md` §9.4 (PWA), RNF-10
- `docs/guia_desarrollo.md` F6.2
- `CLAUDE.md` §Dependencias (§5.3: evaluar antes de añadir)
- `public/sw.js`, `app/manifest.ts`, `components/pwa/ServiceWorker.tsx`
