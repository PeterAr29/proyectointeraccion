# Estado Actual del Proyecto

**Última actualización:** 2026-07-11 (cierre F5.3 — Préstamos, devoluciones y multas, módulo E)
**Última subfase completada:** F5.3 — Préstamos, devoluciones y multas (módulo E, Administración)
**Próxima subfase:** F5.4 — Reportes y configuración (módulo E, cierra la Fase 5)

## Progreso global

- Fases completadas: **4/6** (Fase 1 · Fundación; Fase 2 · Catálogo; Fase 3 · Circulación; Fase 4 · Multas & Notificaciones). **Fase 5 (Administración) EN CURSO** (3/4 subfases).
- Subfases completadas: 14/17
- Porcentaje estimado: ~80%
- **Hito M1 alcanzado** (`v0.1.0`): fundación lista, módulos B–E abiertos para reclamar.
- **Hito M2 alcanzado**: estudiante funcional (catálogo + circulación + multas/notificaciones).
- **Módulos B, C y D COMPLETADOS**; **Módulo E (Administración) EN PROGRESO** (F5.1 cerrada; el panel del bibliotecario empieza a existir).
- **Preview desplegada en Vercel**: https://proyectointeraccion.vercel.app (contra el Supabase remoto; auto-deploy en cada push a `main`).

## Resumen de lo construido hasta ahora

**F5.3 completada.** El bibliotecario opera la circulación de todos los usuarios:

- **`/prestamos`**: vista global (solo lectura) de todos los préstamos, con filtro
  por estado efectivo (todos/activos/vencidos/devueltos).
- **`/devoluciones`**: registra devoluciones de cualquier usuario con **multa
  integrada** — el servidor asegura la multa (`syncFineForLoan`, congela los días)
  **antes** de devolver y reponer stock (`return_loan`). La confirmación advierte
  el monto; el toast lo informa.
- **`/multas`**: lista todas las multas (filtro por estado) y permite **marcar
  pagada** (RLS `fines_update_librarian`).
- Services `loans-admin.ts` (reads globales + `registerReturn` + puros
  `buildReturnRows`/`estimateReturnFine`) y `fines-admin.ts` (listado + builder).
  Nav "Préstamos", "Devoluciones" y "Multas" activados.
- **Verificado:** typecheck/lint/build/audit-high verdes; **125/125 unit**;
  devolución+multa y pago verificados end-to-end contra el remoto con rollback
  (bibliotecario devuelve el préstamo de otro y repone stock; marca multa pagada;
  el estudiante NO puede marcar multas; seed intacto). Detalle en `fase-5.3-E.md`.

**F5.2 completada.** El bibliotecario gestiona catálogo y usuarios (CRUD) bajo el
layout `(admin)`, con Storage de portadas y baja lógica en vez de borrado:

- **Libros** (`/libros` + `nuevo`/`[id]`): crear/editar con `bookFormSchema`,
  **baja lógica** con `books.activo` (el catálogo del estudiante oculta inactivos),
  **portada a Storage** (bucket `book-covers`). Services `books-admin.ts`.
- **Usuarios** (`/usuarios` + `nuevo`/`[id]`): alta (cliente admin), edición de
  contacto + **rol** + **activación**, baja lógica; anti-autobloqueo del propio
  admin. Services `users-admin.ts`. Correo/código son de solo lectura.
- **🔴 Fix de seguridad**: se detectó y corrigió (trigger
  `prevent_self_privilege_change`) una **escalada de privilegios** latente desde
  F1.2 — un estudiante podía auto-promocionarse a bibliotecario vía RLS directa.
- Nav "Libros" y "Usuarios" activados. Guard `isCurrentUserLibrarian` revalida el
  rol en cada Server Action.
- **Verificado:** typecheck/lint/build/audit-high verdes; **117/117 unit**; RLS,
  Storage y la escalada verificados end-to-end contra el remoto con rollback
  (estudiante no escribe libros ni escala rol; bibliotecario sí gestiona; seed
  intacto). Detalle en `progreso/fase-5.2-E.md`.

**F5.1 completada — abre la Fase 5 (Administración).** Nuevo route group
`app/(admin)/` con `layout.tsx` que exige rol **bibliotecario** (deny-by-default;
RLS es la autorización real) y reusa el shell. `/dashboard` muestra 4 KPIs reales
(**libros**, **usuarios**, **préstamos activos**, **multas pendientes**) + tabla de
**préstamos recientes**, con sus 4 estados:

- **`lib/services/dashboard.ts`** es el agregador del Módulo E: **no accede a
  ninguna tabla**, compone las funciones de conteo/lectura de cada service (respeta
  la frontera). `getDashboardData()` + la función pura `buildRecentLoanRows`.
- **Conteos añadidos a cada service** (cada uno sigue siendo la única puerta a su
  tabla; el bibliotecario ve todo por `is_librarian()`): `books.countBooks`,
  `users.countUsers` + `users.getProfilesByIds`, `loans.countActiveLoans` +
  `loans.listRecentLoansWithBooks`, `fines.countPendingFines`.
- **Componentes** `KpiCard` y `RecentLoansTable` (Server Components, responsive).
  Nav "Dashboard" activado (el resto de admin sigue deshabilitado por subfase).
- **Verificado:** typecheck/lint/build/audit-high verdes; **101/101 unit**; KPIs y
  RLS verificados end-to-end contra el remoto con rollback (bibliotecario ve
  7/5/0/0 por `is_librarian`; estudiante restringida a su propio perfil; join de
  recientes resuelve libro+usuario; seed intacto). Detalle en `progreso/fase-5.1-E.md`.

**F4.2 completada — cierra la Fase 4 (hito M2).** `lib/services/notifications.ts`

**F4.2 completada — cierra la Fase 4 (hito M2).** `lib/services/notifications.ts`
(única puerta a `notifications`) genera y expone los avisos in-app, y
`/notificaciones` los muestra con sus 4 estados:

- **Tres tipos generados por el sistema** (cliente admin/service role): **`multa_generada`**
  (enganchado en `fines.syncFineForLoan`, al crear la multa nueva), **`vencimiento_proximo`**
  (`syncOwnDueSoonNotifications`, préstamos que vencen dentro de 3 días) y
  **`reserva_disponible`** (`syncAvailableReservations`, barrido que notifica al frente
  de la cola cuando el libro recupera stock).
- **Idempotencia por marcadores** (migración `..._notification_markers.sql`): columnas
  `loans.vencimiento_notificado_en` y `reservations.notificada_disponible_en`; `renew_loan`
  re-declarada para reiniciar el marcador de vencimiento al renovar.
- **Vista + campana:** `/notificaciones` (4 estados) con marcar-una / marcar-todas (Server
  Actions con RLS); la campana del Topbar es un `Link` con badge de no-leídas (`getUnreadCount`
  resuelto en el layout servidor). Nav "Notificaciones" activado.
- **Verificado:** typecheck/lint/build/audit-high verdes; **96/96 unit**; RLS de
  `notifications` verificada end-to-end contra el remoto con rollback (María ve la suya y la
  marca leída; Juan no la ve; seed intacto). Detalle en `progreso/fase-4.2-D.md`.

**F4.1 completada.** `lib/services/fines.ts` (única puerta a `fines`) calcula la
multa (§7.2.4: `dias_retraso × multa_diaria`, S/) y la integra con Circulación:

- **Cálculo puro y probado:** `computeDaysOverdue` y `computeFineAmount` (redondeo
  a 2 decimales, sin negativos).
- **Generación por el sistema** (`syncFineForLoan`/`syncOwnOverdueFines`, cliente
  admin/service role porque la RLS de `fines` solo deja escribir al bibliotecario):
  ante un vencido, persiste `estado='vencido'` y crea/actualiza la multa
  `pendiente`. Índice único `fines(loan_id)` (una multa por préstamo).
- **Checker para C** (`getPendingFineLoanIds`): "Mis préstamos" lo sincroniza y lo
  pasa a `canRenew` → **Renovar deshabilitado con multa pendiente** (§7.2.5); la
  RPC `renew_loan` revalida en BD. `markFinePaid` listo para F5.3 (bibliotecario).
- **Verificado:** typecheck/lint/build/audit-high verdes; **86/86 unit**;
  integración C↔D end-to-end contra el remoto con rollback (multa visible para el
  estudiante por RLS; renovar bloqueado → BT102). Detalle en `progreso/fase-4.1-D.md`.

**F3.3 completada — cierra la Fase 3.** Nueva ruta `/historial`: historial
completo (activos/vencidos/devueltos) con filtro por estado y rango de fechas y
paginación; reusa `LoanTable` sin acciones. Solo lectura, vía `loans.ts` (RLS).
Lógica pura nueva: `filterLoanHistory` (por estado efectivo + fechas) y
`paginateList`. Nav "Historial" activado. **79/79 unit**; ruta de datos verificada
bajo RLS contra el remoto. Detalle en `progreso/fase-3.3-C.md`.

**F3.2 completada.** Nueva ruta `/mis-prestamos`: el estudiante ve sus préstamos
activos/vencidos y puede **renovar** y **devolver**, con confirmación:

- **Tabla responsive** (`LoanTable`, scroll horizontal <768px) con Libro/Estado/
  Devolución/Renovaciones/Acciones; **estado efectivo derivado** en lectura
  (`effectiveLoanStatus`: vencido si la fecha estimada ya pasó, §7.2.3).
- **Renovar** recalcula fecha (hoy + `dias_prestamo`) y respeta §7.2.5 (máximo de
  renovaciones; bloqueado con multa pendiente — botón deshabilitado con tooltip).
  **Devolver** marca la devolución y **repone stock** de forma atómica.
- **RPC atómicas** `renew_loan`/`return_loan` (`SECURITY DEFINER`, aceptan owner o
  bibliotecario para reusarse en F5.3). `lib/services/loans.ts` extendido
  (`listOwnLoansWithBooks`, `renewLoan`, `returnLoan`, lógica pura) +
  `lib/services/settings.ts` (`getCirculationSettings`). Nav "Mis préstamos" ON.
- **Verificado:** typecheck/lint/build/audit-high verdes; **68/68 unit**; RPC
  probadas end-to-end contra el remoto con rollback (renovaciones 0→1, stock de
  Redes 2→3 al devolver, SQLSTATE BT100/BT101/BT200). Migración aplicada al
  remoto. Detalle en `progreso/fase-3.2-C.md`.

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
| C — Circulación             | ✅ Completado (Fase 3)        | integrador | 2026-07-10 |
| D — Multas & Notificaciones | ✅ Completado (Fase 4)        | integrador | 2026-07-10 |
| E — Administración          | 🔄 En progreso (F5.3 cerrada) | integrador | 2026-07-11 |

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
- **Nueva (F4.2) — generación en render:** los barridos de notificaciones
  (`syncOwnDueSoonNotifications`, `syncAvailableReservations`) y el de multas
  (`syncOwnOverdueFines`) corren en el GET de la vista. Idempotentes por
  marcadores; en producción moverlos a un **job programado** (cron/Edge Function
  con service role) que barra a todos los usuarios. Realtime de la campana
  opcional (hoy se refresca en SSR/navegación). Ver `fase-4.2-D.md`.
- `next lint` deprecado (se elimina en Next 16): migrar a ESLint CLI antes de subir de major.
- 2 vulnerabilidades **moderate** en el `postcss` interno de next 15.5.20 (bajo el gate `high`); se resolverán al actualizar next.
- **Nueva (F2.1):** vuln **low** en `@supabase/auth-js` (Insecure Path Routing, GHSA-8r88-6cj9-9fh5); se resuelve subiendo `@supabase/supabase-js` a ≥2.110. Bajo el gate `high`, no bloquea CI.
