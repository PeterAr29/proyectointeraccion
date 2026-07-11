# Handoff — F5.1 Dashboard con KPIs (Módulo E)

**Fecha:** 2026-07-11 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** E (Administración) · **Abre:** Fase 5 · **Siguiente:** F5.2 (CRUD de libros y usuarios)

## Qué quedó hecho

`/dashboard` (solo rol bibliotecario) muestra cuatro KPIs reales y una tabla de
préstamos recientes, con sus cuatro estados. Todo consume `lib/services/*` — la
vista **nunca** toca una tabla directamente.

- **Área de administración `(admin)` con guard de rol.** Nuevo route group
  `app/(admin)/` con su propio `layout.tsx`: exige sesión **y** rol
  `bibliotecario` (deny-by-default en el borde del grupo). Un estudiante que
  navegue a una ruta de admin por URL es redirigido a `/inicio`. Reusa `AppShell`
  (sidebar con la navegación de bibliotecario + topbar). Este layout protegerá
  también las rutas de F5.2–F5.4 sin repetir el guard.
- **Agregador `lib/services/dashboard.ts`** (nueva pieza del Módulo E). **No es
  puerta a ninguna tabla**: compone las funciones de conteo/lectura de los
  services de cada módulo, respetando la frontera. Expone `getDashboardData()` y
  la función pura testeable `buildRecentLoanRows(items, profiles)`.
- **Funciones de conteo añadidas a cada service** (cada uno sigue siendo la única
  puerta a su tabla; el bibliotecario ve todo por RLS `is_librarian()`):
  - `books.countBooks()` — total del catálogo.
  - `users.countUsers()` + `users.getProfilesByIds(ids)` — total de usuarios y
    resolución por lote de nombres (para no acoplar `loans.ts` a `profiles`).
  - `loans.countActiveLoans()` (préstamos no devueltos: activos + vencidos) +
    `loans.listRecentLoansWithBooks(limit)` (mismo patrón de dos pasos loans→books).
  - `fines.countPendingFines()` — multas `pendiente` de todo el sistema.
- **KPIs:** Libros en el catálogo · Usuarios registrados · Préstamos activos ·
  Multas pendientes. Cada uno es `number | null`; si su consulta falla, la tarjeta
  muestra un guion sin tumbar el resto del panel (degradación por KPI).
- **Componentes presentacionales** (Server Components): `KpiCard`
  (icono + etiqueta + valor, tono por color) y `RecentLoansTable`
  (Libro/Usuario/Prestado/Devolución/Estado, responsive con scroll <768px, estado
  efectivo vía `effectiveLoanStatus`, reusa `StatusBadge`).
- **Nav:** "Dashboard" del bibliotecario pasa a `enabled: true`. El resto de ítems
  de admin (Libros, Usuarios, Préstamos, Configuración) sigue deshabilitado hasta
  su subfase.

### Verificaciones (todas en verde)

| Check                          | Resultado                              |
| ------------------------------ | -------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                            |
| `npm run lint`                 | Sin errores ni warnings                |
| `npm run build`                | OK (`/dashboard` como ruta dinámica ƒ) |
| `npm run test -- --run`        | **101/101** (5 nuevos + 96 previos)    |
| `npm audit --audit-level=high` | **exit 0**                             |
| KPIs + RLS (remoto)            | **verificado con rollback** — abajo    |

**Verificación end-to-end (remoto `bibliotec`, con `rollback`, seed intacto):**

- **KPIs del bibliotecario** (impersonando con `set local role authenticated` +
  `request.jwt.claims` del bibliotecario): `books=7`, `users=5`, `active_loans=0`,
  `pending_fines=0` — coincide con la verdad del seed (el único préstamo demo está
  devuelto, por eso 0 activos).
- **Join de préstamos recientes** (loans→books→profiles) resuelve libro
  ("Redes de Computadoras") + usuario ("María García López") + estado (devuelto).
- **RLS como defensa en profundidad:** impersonando a la estudiante María, el
  conteo de `profiles` baja a **1** (solo su propio perfil). Es decir, aunque el
  guard de rol del layout fallara, la RLS restringiría igual. El bibliotecario ve
  los 5 por `is_librarian()` (no por bypass), que es exactamente lo que consume el
  dashboard.

## Interfaz nueva (fronteras)

- `lib/services/dashboard.ts`: `getDashboardData(): Promise<DashboardData>`,
  `buildRecentLoanRows(...)` (pura), tipos `DashboardData`/`DashboardKpis`/
  `RecentLoanRow`, const `RECENT_LOANS_LIMIT`.
- `lib/services/books.ts`: `countBooks(): Promise<number | null>`.
- `lib/services/users.ts`: `countUsers(): Promise<number | null>`,
  `getProfilesByIds(ids): Promise<ProfileName[]>`, tipo `ProfileName`.
- `lib/services/loans.ts`: `countActiveLoans(): Promise<number | null>`,
  `listRecentLoansWithBooks(limit?): Promise<LoanWithBook[] | null>`.
- `lib/services/fines.ts`: `countPendingFines(): Promise<number | null>`.

## Archivos nuevos / tocados

```
app/(admin)/layout.tsx                 · NUEVO · guard de rol bibliotecario + AppShell
app/(admin)/dashboard/page.tsx         · NUEVO · vista (4 estados): KPIs + recientes
app/(admin)/dashboard/loading.tsx      · NUEVO · skeleton del dashboard
lib/services/dashboard.ts              · NUEVO · agregador (compone services) + lógica pura
lib/services/dashboard.test.ts         · NUEVO · tests de buildRecentLoanRows (5)
components/biblioteca/KpiCard.tsx       · NUEVO · tarjeta de KPI
components/biblioteca/RecentLoansTable.tsx · NUEVO · tabla de préstamos recientes
lib/services/books.ts                  · (editado) +countBooks
lib/services/users.ts                  · (editado) +countUsers, +getProfilesByIds, +ProfileName
lib/services/loans.ts                  · (editado) +countActiveLoans, +listRecentLoansWithBooks
lib/services/fines.ts                  · (editado) +countPendingFines
components/layout/nav.ts               · (editado) "Dashboard" enabled
```

**Sin migración nueva:** F5.1 solo lee; no cambia el esquema.

## Decisiones no triviales

1. **Route group `(admin)` con guard en el layout** (no per-página). Centraliza el
   deny-by-default por rol para toda la Fase 5 en un solo sitio. La autorización
   REAL sigue siendo la RLS; el guard es defensa en profundidad + buena UX
   (redirige en vez de mostrar una vista vacía).
2. **KPIs vía la sesión del bibliotecario, no service role.** La RLS
   (`is_librarian()`) ya le da lectura total; no hace falta el service role para
   contar. Menos superficie de service role = más seguro (A01).
3. **`dashboard.ts` compone, no accede a tablas.** Cada conteo vive en el service
   dueño de su tabla; el agregador solo los orquesta. Así no se rompe la frontera
   entre módulos (regla de arquitectura de CLAUDE.md).
4. **`getProfilesByIds` en `users.ts`, no en `loans.ts`.** El nombre del usuario de
   cada préstamo se resuelve por la puerta de `profiles` (users.ts), evitando que
   `loans.ts` lea la tabla de otro módulo.
5. **Préstamos "activos" = no devueltos** (por ausencia de `fecha_devolucion_real`),
   coherente con `effectiveLoanStatus`; no se depende del `estado` persistido.
6. **Degradación por KPI:** un conteo que falla queda en `null` y su tarjeta
   muestra "—" sin romper el panel entero.

## Cómo lo prueba el siguiente dev

1. Inicia sesión como bibliotecario (`Administrador de Biblioteca`, contraseña dev
   `Biblioteca123`). En el sidebar, "Dashboard" ya navega. Verás 7 libros, 5
   usuarios, 0 préstamos activos, 0 multas pendientes, y el préstamo demo de María
   (Redes, devuelto) en "Préstamos recientes".
2. Inicia sesión como estudiante e intenta abrir `/dashboard` por URL → te redirige
   a `/inicio` (guard de rol del layout `(admin)`).
3. `npm run test -- --run` → 101/101 (incluye `buildRecentLoanRows`).

## TODOs / deudas que hereda F5.2+

- [ ] **Sin e2e del dashboard** todavía (verificado con RLS + rollback y tests
      puros). Cuando F6 arme los e2e críticos, añadir uno de admin.
- [ ] Los conteos disparan una consulta `head+count` por KPI. Para decenas de
      filas es trivial; si el volumen creciera, considerar una RPC agregada o una
      vista materializada.
- [ ] **F5.2 reutiliza el layout `(admin)`** para `/libros` y `/usuarios`. `users.ts`
      y `books.ts` deberán extenderse con las mutaciones de admin (crear/editar/
      desactivar) revalidando rol en servidor; la RLS ya permite escritura al
      bibliotecario (`*_insert/update_librarian`). Subida de portadas → Storage.
- [ ] Deudas previas vigentes (F4.2/F4.1): generación de notificaciones/multas en
      render (mover a job programado), Realtime opcional de la campana, `next lint`
      deprecado, vuln low `@supabase/auth-js`, Playwright install en CI, Leaked
      Password Protection en Supabase Auth.
