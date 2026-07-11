# Handoff — F6.2 Endurecimiento, PWA y despliegue (última)

**Fecha:** 2026-07-11 · **Dev:** integrador · **Estado:** ✅ Completada · **Fase:** 6 (Evaluación IHC & Producción) · **Cierra:** el proyecto (hito M4 / `v1.0.0`)

## Qué quedó hecho

Endurecimiento de seguridad + PWA instalable + preparación de producción. **No se
tocó lógica de negocio ni hubo migraciones.**

### 1. Headers de seguridad (`next.config.ts`)

`headers()` aplica a **toda** respuesta:

| Header                      | Valor / propósito                                                                                                                                                                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`   | deny-by-default. `script/style-src 'self' 'unsafe-inline'` (Next inyecta inline sin nonce); `connect/img-src` abren `*.supabase.co` (REST+Storage+Realtime `wss`); `worker-src`/`manifest-src 'self'` (PWA); `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (efecto solo sobre HTTPS/Vercel).                                                                                                                                                                                                                                                  |
| `X-Frame-Options`           | `DENY`                                                                                                                                                                                                                                                                                                                            |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                                                                                                                                                                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                                                                                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                                                                                                                                                                                    |

**No se abre CORS**: la arquitectura es same-origin (Server Actions); el navegador
rechaza cross-origin por defecto → postura segura. Verificado con `curl -D -`.

### 2. PWA instalable (RNF-10, §9.4)

- **`app/manifest.ts`** → `/manifest.webmanifest`: `display: standalone`,
  `start_url: /inicio`, `scope: /`, `theme_color #1D4ED8`, `background_color #F8FAFC`,
  íconos **192** (any), **512** (any) y **512 maskable**.
- **Íconos** en `public/icons/` (PNG generados sin dependencias con un script que
  encodea PNG vía `zlib`): `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
  `apple-touch-icon.png` (180). `app/icon.png` sirve de favicon.
- **Meta** en `app/layout.tsx`: `manifest`, `appleWebApp`, `icons`, y `viewport`
  con `themeColor #1D4ED8` + `viewportFit: cover`.
- **Service worker** `public/sw.js` (hecho a mano, ADR-0002): network-first en
  navegaciones (fallback a `public/offline.html`), cache-first en estáticos propios,
  **passthrough sin cachear** para Supabase/cross-origin/POST. Limpia cachés viejas
  en `activate`. Versionado: `bibliotec-shell-v1`.
- **Registro + offline**: `components/pwa/ServiceWorker.tsx` (montado en el layout
  raíz) registra el SW **solo en producción** y escucha `online`/`offline` para
  abrir el **diálogo global `offline`** (F1.3); "Reintentar" recarga si hay red.

### 3. Middleware (archivo sensible — modificado con aviso)

Se añadieron a `PUBLIC_PATHS`: `/privacidad`, `/manifest.webmanifest`, `/sw.js`,
`/offline.html`. **Motivo/bug corregido:** el `matcher` no excluía `.webmanifest`
ni `.js`, así que el middleware **redirigía el manifest y el SW al login** → la PWA
no era instalable. Verificado: ahora responden **200** con su content-type correcto.

### 4. Política de privacidad (Ley 29733, §11)

`app/privacidad/page.tsx` → `/privacidad` (pública). Responsable, datos, finalidad
y base legal, derechos ARCO+, conservación, seguridad, cookies. Enlazada desde el
pie de las pantallas de acceso (`app/(auth)/layout.tsx`).

### 5. CI e2e + backup/restore + logs

- **`.github/workflows/ci.yml`**: job **e2e** (`playwright install --with-deps
chromium` + `npm run test:e2e` de login y catálogo). **Guard por secretos**: si
  faltan los 3 secretos de Supabase, se omite en verde (no bloquea a quien clone
  sin acceso al proyecto).
- **`docs/backup-restore.md`**: qué se respalda, backup automático/manual,
  restauración (migraciones / `pg_dump`+`psql` / restore gestionado) y **prueba de
  restauración** con verificación de conteos + RLS + flujo e2e.
- **Sin PII en logs**: los únicos `console.*` de la app están en `app/(auth)/actions.ts`
  y usan `maskCodigo()` (la carpeta `design/` es prototipo, fuera del build).

## Verificaciones (todas en verde)

| Check                          | Resultado                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                                                                                                             |
| `npm run lint`                 | Sin errores ni warnings                                                                                                                 |
| `npm run build`                | OK (**28/28** páginas; +manifest +icon +privacidad)                                                                                     |
| `npm run test -- --run`        | **137/137**                                                                                                                             |
| `npm audit --audit-level=high` | **exit 0** (solo low/moderate bajo el gate)                                                                                             |
| HTTP contra `npm run start`    | headers OK; `/manifest.webmanifest`, `/sw.js`, `/offline.html`, `/icons/*.png` → **200** con content-type correcto; `/privacidad` → 200 |

## Archivos nuevos / tocados

```
next.config.ts                        · (editado) headers de seguridad + CSP
middleware.ts                         · (editado, sensible) rutas públicas PWA + /privacidad
app/layout.tsx                        · (editado) meta PWA + viewport + monta ServiceWorker
app/manifest.ts                       · NUEVO · manifest de la PWA
app/icon.png                          · NUEVO · favicon
app/privacidad/page.tsx               · NUEVO · política de privacidad (Ley 29733)
app/(auth)/layout.tsx                 · (editado) enlace a /privacidad
components/pwa/ServiceWorker.tsx       · NUEVO · registro SW + diálogo offline
public/sw.js                          · NUEVO · service worker
public/offline.html                   · NUEVO · fallback offline
public/icons/*.png                    · NUEVO · íconos 192/512/maskable/apple-touch
.github/workflows/ci.yml              · (editado) job e2e con guard por secretos
docs/backup-restore.md                · NUEVO · backup + prueba de restore
docs/adr/0002-service-worker-sin-libreria.md · NUEVO · ADR de la PWA sin librería
```

## Decisiones no triviales

1. **SW propio, sin librería** (ADR-0002): evita Workbox/`next-pwa` (peso + build
   que inyecta JS + complica la CSP). Alcance = offline básico del shell. §5.3.
2. **CSP con `'unsafe-inline'`** en script/style: Next App Router inyecta inline sin
   nonce. El resto de la CSP es estricta. Upgrade a nonce anotado como deuda.
3. **Íconos PNG generados sin dependencia**: script con `zlib` nativo (coherente con
   F6.1, que evitó librerías). No se añadió ninguna dependencia en toda la fase.
4. **Guard de secretos en el job e2e**: mantiene el CI verde para clones sin acceso
   al Supabase real, sin renunciar a correr los e2e cuando los secretos existen.

## TODOs / pendientes de ENTREGA (operación, no código)

- [ ] **`git push` a `main`** → auto-deploy en Vercel; verificar el flujo end-to-end
      en producción y la **instalación PWA + Lighthouse PWA en verde** en un móvil.
      (No se hizo push desde aquí: es una acción de producción; queda a tu criterio.)
- [ ] **Configurar los 3 secretos** en GitHub Actions para activar el job e2e.
- [ ] **Recolectar el SUS real** (F6.1) y sustituir el piloto simulado; medir % de
      tareas críticas completadas (≥90%).
- [ ] Deudas previas vigentes: Leaked Password Protection en Supabase Auth, SMTP para
      recuperación, rate-limit a Redis en multi-instancia, notificaciones/multas a job
      programado, `next lint` → ESLint CLI, endurecer CSP a nonce, versionado del SW.

## Estado del proyecto

**6/6 fases · 17/17 subfases · 100%.** Sistema BiblioTEC completo (estudiante +
admin) sobre Next.js 15 + Supabase, con OWASP aplicado (RLS como autorización real),
PWA instalable, evaluación IHC documentada y CI con unit + e2e. Listo para `v1.0.0`.
