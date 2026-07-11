# Estado Actual del Proyecto

**Última actualización:** 2026-07-10 (cierre F3.1 — Circulación: reservas y préstamos)
**Última subfase completada:** F3.1 — Reservas y préstamos (módulo C, Circulación)
**Próxima subfase:** F3.2 — Mis préstamos (renovar/devolver/vencidos) (módulo C)

## Progreso global

- Fases completadas: **2/6** (Fase 1 · Fundación & Acceso; Fase 2 · Catálogo)
- Subfases completadas: 7/17
- Porcentaje estimado: ~41%
- **Hito M1 alcanzado** (`v0.1.0`): fundación lista, módulos B–E abiertos para reclamar.
- **Módulo B (Catálogo) COMPLETADO**: F2.1 y F2.2 cerradas.
- **Módulo C (Circulación) EN PROGRESO**: F3.1 cerrada; siguen F3.2 y F3.3.

## Resumen de lo construido hasta ahora

**F3.1 completada.** El detalle del libro presta y reserva de verdad, con flujo
transaccional y confirmación obligatoria:

- **Prestar/Reservar reales:** `/catalogo/[id]` reemplaza el botón deshabilitado
  de F2.2 por `LoanActions` (client). Prestar si hay stock (calcula
  `fecha_devolucion = hoy + dias_prestamo`, decrementa stock **atómicamente**);
  reservar si no hay (estima disponibilidad). Si se agota el último ejemplar en
  plena acción, **ofrece reservar** (RF-C01). Confirmación vía diálogos globales.
- **Lógica en servicios + RPC atómicas:** `lib/services/loans.ts` y
  `reservations.ts` son las únicas puertas; delegan en las RPC Postgres
  `create_loan`/`create_reservation` (`SECURITY DEFINER`, `for update` sobre el
  stock, índices únicos parciales "un activo por usuario/libro"). Esto garantiza
  atomicidad (§2.3) y sortea que la RLS impide al estudiante escribir en `books`.
  Server Actions revalidan el UUID en servidor; `lib/validations/circulation.ts`
  aporta `dueDateSchema` (fecha no anterior a hoy, §7.2.2).
- **Verificado:** typecheck/lint/build/audit-high verdes; **56/56 unit**; RPC
  probadas **end-to-end contra el remoto con rollback** (stock 3→2, reserva
  'activa', SQLSTATE BT001/BT002/BT003/BT404 correctos, seed intacto). Migración
  aplicada al remoto `bibliotec`. Detalle en `progreso/fase-3.1-C.md`.

**F2.2 completada — cierra la Fase 2.** El catálogo tiene detalle y favoritos:

- **`/catalogo/[id]`**: detalle del libro (portada, disponibilidad, metadatos,
  descripción) vía `getBookById`. Id no-UUID o inexistente → ErrorState "Libro no
  encontrado". Botón Prestar/Reservar **deshabilitado con tooltip** (el flujo
  transaccional es del módulo C).
- **Favoritos**: toggle (corazón) en el detalle y **`/favoritos`** con la lista
  del usuario (RLS), los 4 estados. `books.ts` extendido con
  `isFavorite`/`addFavorite`/`removeFavorite`/`listFavorites` + `orderBooksByIds`
  (pura, testeable). Server Action `toggleFavoriteAction` revalida el id (UUID)
  en servidor y respeta RLS. `FavoriteButton` optimista reutilizable.
- **Verificado:** typecheck/lint/build/audit-high verdes; **37/37 unit**; **e2e de
  catálogo 6/6** contra el remoto (María), incluido el flujo real de favoritos
  (persistencia comprobada por SQL). Detalle en `progreso/fase-2.2-B.md`.

**F2.1 completada** (módulo B). `/catalogo` lista los libros del seed con
búsqueda (título/autor/ISBN), filtros (categoría/ubicación/disponibilidad) y
paginación, todo por query params, con los 4 estados (skeleton/vacío/error/datos):

- **`lib/services/books.ts`** es la única puerta a `books`: `listBooks` (paginado
  y filtrado con conteo previo), `getBookById` (lista para C/F2.2),
  `getCatalogFacets`, y lógica pura testeable (`buildSearchFilter`,
  `computePagination`, `isAvailable`).
- **Búsqueda parametrizada** (A03): el término se sanea antes del `.or(...)` de
  PostgREST (sin inyección de operadores ni comodines).
- **Filtros por URL** con `<form method="get">` (Server Component, sin JS cliente);
  `parseCatalogFilters` (Zod) nunca lanza ante query params basura.
- **`BookCard`** presentacional (con `href` opcional; F2.2 lo hace navegable).
- **Verificado:** typecheck/lint/build/audit-high verdes; **32/32 unit**; **e2e de
  catálogo 3/3** contra el remoto (María). Detalle en `progreso/fase-2.1-B.md`.

### Construido en subfases previas

**F1.4 completada — cierra la Fase 1.** El acceso funciona end-to-end contra
Supabase Auth y las rutas están protegidas:

- **Acceso:** login por código universitario, registro (auto-login) y
  recuperación; validación Zod en cliente y servidor. Rate limiting + bloqueo
  tras 5 intentos (A04/A07); logs con PII enmascarada (A09); anti-enumeración.
- **`middleware.ts`:** deny-by-default, refresca sesión y protege `(app)`;
  redirige a login sin sesión y a `/inicio` si ya hay sesión.
- **Shell responsive:** Sidebar 240px (ítem activo azul), Topbar con campana,
  MobileNav (drawer <768px); `ToastProvider` montado para toda la app.
- **`lib/services/users.ts`:** única puerta a `profiles` (perfil propio por RLS;
  resolución de correo y alta de cuenta con cliente admin **server-only**).
- **Perfil:** ver y editar datos de contacto (acceso/rectificación, Ley 29733).
- **Verificado:** typecheck/lint/build/audit-high verdes; 17/17 unit; **e2e de
  login 3/3** contra el Supabase remoto (María). Detalle en `progreso/fase-1.4-A.md`.

**F1.3 (previa):** sistema de diseño en `/kitchen-sink` (StatusBadge, BookCover,
Skeleton/Empty/Error, Modal, 10 diálogos globales, Toast) + utils dates/currency.

**F1.2 completada.** La capa de datos existe y está aplicada en el proyecto Supabase remoto `bibliotec` (ref `umjelnabjdvrsfnqoszt`):

- **Esquema** (`supabase/migrations/20260710120000_init_schema.sql`): 8 tablas (profiles, books, loans, reservations, fines, notifications, favorites, settings), 5 enums, índices, triggers de `updated_at`, IDs UUID, checks de integridad (p. ej. `cantidad_disponible <= cantidad_total`). RLS habilitado en todas.
- **Políticas RLS** (`..._rls_policies.sql`): estudiante solo sus filas; books/settings lectura para autenticados; escritura de catálogo/settings solo bibliotecario; función `is_librarian()` (SECURITY DEFINER, evita recursión). **Probado end-to-end**: María (estudiante) ve solo lo suyo, Juan no ve datos de María, el bibliotecario ve todo.
- **Endurecimiento** (`..._harden_functions.sql`): `search_path` fijo y `EXECUTE` de `is_librarian()` revocado de anon/public. Security advisors de Supabase revisados (queda 1 WARN aceptado de bajo riesgo — ver handoff).
- **Seed** (`supabase/seed.sql`): 5 usuarios (4 estudiantes + 1 bibliotecario), 7 libros, settings, 1 préstamo y 1 favorito de demo. Contraseña común dev: `Biblioteca123`.
- **Helpers SSR** (`lib/supabase/{client,server,middleware,config}.ts`) + tipos (`database.types.ts`) escritos a mano fieles al esquema.

Aún **no hay** componentes de dominio, sistema de diseño ni auth funcional (F1.3 y F1.4). `.env.local` ya tiene las claves reales del proyecto (git-ignored). `npm audit --audit-level=high` en exit 0; typecheck/lint/tests en verde. Detalle y decisiones en `progreso/fase-1.2-A.md`.

**F1.1** (previa): repo Next.js 15 arrancable con tooling/CI/tests. Detalle en `progreso/fase-1.1-A.md`.

## Estado por módulo (espejo del tablero)

| Módulo                      | Estado                        | Dev        | Desde      |
| --------------------------- | ----------------------------- | ---------- | ---------- |
| A — Plataforma & Acceso     | ✅ Completado (Fase 1)        | integrador | 2026-07-10 |
| B — Catálogo                | ✅ Completado (Fase 2)        | integrador | 2026-07-10 |
| C — Circulación             | 🔄 En progreso (F3.1 cerrada) | integrador | 2026-07-10 |
| D — Multas & Notificaciones | Bloqueado por C               | —          | —          |
| E — Administración          | Bloqueado por B, C, D         | —          | —          |

## Decisiones técnicas vivas (las que afectan trabajo futuro)

- La frontera entre módulos es la capa `lib/services/*`; un cambio de firma es un cambio de frontera (avisar + ADR si es de largo plazo).
- Autorización real = RLS en Postgres; la UI nunca es la fuente de autorización.
- F1 es secuencial y a cargo de un solo dev; los módulos se reclaman del tablero solo después.

## Issues abiertos del proyecto

- [x] ~~Elegir/crear el proyecto de Supabase y cargar las claves reales en `.env.local`~~ — hecho en F1.2 (proyecto `bibliotec`, `umjelnabjdvrsfnqoszt`; claves en `.env.local`).
- [ ] `supabase link` del repo al proyecto remoto (pide el DB password) para poder usar `supabase db push` desde el CLI. Ver `supabase/README.md`.
- [ ] Instalar **Docker Desktop** si se quiere levantar el stack local (`supabase start` / `db reset`). Hoy la BD se aplica y verifica contra el remoto.
- [ ] Crear el GitHub Project desde `docs/backlog.md` (o generar issues con `gh`).
- [ ] Instalar **gitleaks** localmente (`winget install gitleaks`) para activar el escaneo de secretos en pre-commit (hoy hace fallback si no está).

## Deudas técnicas anotadas

- **Auth:** activar _Leaked Password Protection_ (HaveIBeenPwned) en Supabase Auth (advisor de seguridad, alineado con A07). Es un ajuste de dashboard/config, no de migración. **Pendiente tras F1.4.**
- **Recuperación de contraseña:** el flujo llama `resetPasswordForEmail`, pero el envío real requiere configurar SMTP en Supabase Auth (no configurado en el MVP). Flujo/validación correctos; falta la config de correo.
- **Rate limiting en memoria (F1.4):** `lib/utils/rate-limit.ts` es por-instancia (se reinicia con el proceso, no se comparte entre lambdas). Suficiente para el piloto; en producción multi-instancia movería a Upstash/Redis.
- **CI e2e:** añadir `npx playwright install --with-deps chromium` antes de `npm run test:e2e` en el pipeline (localmente ya se instaló el navegador).
- **RLS/advisor aceptado (🟡 bajo):** `authenticated` puede llamar `rpc/is_librarian` (revela solo el rol del propio llamante, ningún dato ajeno). Endurecimiento opcional: mover la función a un esquema no expuesto por PostgREST. Ver `fase-1.2-A.md`.
- **Nuevo (F3.1) advisor aceptado (🟡 bajo):** `authenticated` puede llamar `rpc/create_loan` y `rpc/create_reservation` (`SECURITY DEFINER`). Es intencional: el estudiante debe poder prestar/reservar y la función requiere DEFINER para decrementar `books` bajo RLS. Autorizan por `auth.uid()` internamente y solo tocan filas propias + el libro puntual. No exponen datos ajenos. Misma postura que `is_librarian`.
- 2FA para el rol bibliotecario (fuera del MVP; anotado en especificaciones §5.8).
- Notificaciones por email/push (F4 solo genera notificaciones in-app).
- `next lint` deprecado (se elimina en Next 16): migrar a ESLint CLI antes de subir de major.
- 2 vulnerabilidades **moderate** en el `postcss` interno de next 15.5.20 (bajo el gate `high`); se resolverán al actualizar next.
- **Nueva (F2.1):** vuln **low** en `@supabase/auth-js` (Insecure Path Routing, GHSA-8r88-6cj9-9fh5); se resuelve subiendo `@supabase/supabase-js` a ≥2.110. Bajo el gate `high`, no bloquea CI.
