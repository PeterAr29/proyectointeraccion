# Roadmap — BiblioTEC

> Vista panorámica del progreso. Actualizar manualmente al cerrar cada subfase (espejo del GitHub Project).

**Inicio estimado:** 2026-07-10
**Cierre estimado:** por definir (equipo full-time, 2-3 devs)

## Leyenda

⏳ Pendiente · 🔄 En curso · ✅ Completada · ⚠️ Bloqueada · ⏸️ Pausada

## Estado general

| Métrica          | Valor   |
| ---------------- | ------- |
| Fases totales    | 6       |
| Subfases totales | 17      |
| Completadas      | 17 / 17 |
| % avance         | 100%    |

## Detalle por fase

### F1: Fundación & Acceso — Módulo [A]

**Estado:** ✅ Completada (`v0.1.0`) · **A cargo de:** dev integrador (secuencial)

- ✅ F1.1 [A] — Setup & tooling (Next+TS+Tailwind+shadcn, hooks, CI, tests)
- ✅ F1.2 [A] — Base de datos, RLS y seed
- ✅ F1.3 [A] — Sistema de diseño (kitchen-sink)
- ✅ F1.4 [A] — Acceso + shell + perfil

### F2: Catálogo — Módulo [B]

**Estado:** ✅ Completada · **A cargo de:** dev integrador

- ✅ F2.1 [B] — Listado, búsqueda y filtros
- ✅ F2.2 [B] — Detalle de libro + favoritos

### F3: Circulación — Módulo [C]

**Estado:** ✅ Completada · **A cargo de:** dev integrador

- ✅ F3.1 [C] — Reservas y préstamos
- ✅ F3.2 [C] — Mis préstamos (renovar/devolver/vencidos)
- ✅ F3.3 [C] — Historial

### F4: Multas & Notificaciones — Módulo [D]

**Estado:** ✅ Completada · **A cargo de:** dev integrador

- ✅ F4.1 [D] — Cálculo de multas
- ✅ F4.2 [D] — Motor de notificaciones + vista

### F5: Administración — Módulo [E]

**Estado:** ✅ Completada · **A cargo de:** dev integrador

- ✅ F5.1 [E] — Dashboard con KPIs
- ✅ F5.2 [E] — CRUD de libros y usuarios
- ✅ F5.3 [E] — Préstamos, devoluciones y multas
- ✅ F5.4 [E] — Reportes y configuración

### F6: Evaluación IHC & Producción

**Estado:** ✅ Completada (`v1.0.0`) · **A cargo de:** dev integrador

- ✅ F6.1 — Evaluación de usabilidad (Nielsen + recorrido cognitivo + SUS)
- ✅ F6.2 — Endurecimiento, PWA y despliegue

### Post-`v1.0.0`: iteración de UX (fuera del plan de 17 subfases)

**Estado:** ✅ Código entregado (2026-07-12) · ⚠️ 2 pendientes abiertos · **Handoff:** `progreso/fase-7-ux.md`

- ✅ Rediseño visual de login, inicio (tablero con datos reales) y shell (módulo A)
- ✅ **Política de préstamo 2 días + 1 ampliación de 1 día** (módulo C, migración al remoto)
- ✅ Catálogo por áreas académicas + 10 carreras en el registro (módulo B, migración al remoto)
- 🔄 **Pendiente:** gate de `audit` en rojo (`sharp`), regresión del aviso de vencimiento
  tras ampliar, re-evaluación heurística de la UI nueva y SUS real

## Hitos clave (milestones)

- **M1 — Fundación lista (`v0.1.0`):** ✅ **alcanzado 2026-07-10.** F1 cerrada; módulos B–E abiertos para reclamar.
- **M2 — Estudiante funcional:** ✅ **alcanzado 2026-07-10.** F4 cerrada (catálogo + circulación + multas/notificaciones).
- **M3 — Sistema completo:** ✅ **alcanzado 2026-07-11.** F5 cerrada (admin operativo: dashboard, CRUD, circulación, reportes, configuración).
- **M4 — V1.0 en producción (`v1.0.0`):** ✅ **alcanzado 2026-07-11.** F6 cerrada (endurecimiento de seguridad + PWA instalable + política de privacidad + e2e en CI). **Plan de 17 subfases completo.** Resta la entrega operativa: **SUS real** (push a producción y PWA en móvil ya verificados).
- **Post-`v1.0.0` (2026-07-12):** iteración de UX con cambio de regla de negocio (préstamo 2+1) y catálogo por áreas. **El producto en producción ya no es el que evaluó F6.1** → re-evaluación heurística pendiente antes del SUS. Ver `progreso/fase-7-ux.md`.

## Bitácora de cierres

> Anotar fecha y commit cada vez que se cierra una subfase.

| Fecha      | Subfase                               | Módulo | Commit  | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | F1.1 Setup & tooling                  | A      | 7566ec9 | Next 15.5.20 + TS strict + Tailwind + shadcn; hooks, CI, Vitest/Playwright; audit high limpio                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-07-10 | F1.2 BD, RLS y seed                   | A      | 62a6b7d | 8 tablas + 5 enums, RLS por rol probado end-to-end en Supabase remoto `bibliotec`, seed aplicado, helpers SSR + tipos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-10 | F1.3 Sistema de diseño                | A      | 3da6f81 | Componentes reutilizables + 10 diálogos globales + Toast, utils dates/currency con tests, `/kitchen-sink`; 17/17 tests, build y audit high verdes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-10 | F1.4 Acceso+shell+perfil              | A      | 8d8b3f7 | **Cierra Fase 1** (`v0.1.0`). Auth Supabase (login por código/registro/recuperar), middleware, shell responsive, perfil, `users.ts`; e2e login 3/3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-10 | F2.1 Catálogo listado/búsqueda        | B      | 46fcb4e | `/catalogo` con búsqueda/filtros/paginación + 4 estados; `books.ts` única puerta a books; 32/32 unit, e2e catálogo 3/3 contra el remoto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-10 | F2.2 Catálogo detalle+favoritos       | B      | 4c05da6 | **Cierra Fase 2.** `/catalogo/[id]` (detalle + "libro no encontrado") y `/favoritos` (toggle+lista, RLS, 4 estados); `books.ts` +favoritos; 37/37 unit, e2e catálogo 6/6 contra el remoto. Módulo C queda Disponible                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-10 | F3.1 Reservas y préstamos             | C      | 25d60bf | Flujo transaccional prestar/reservar. RPC atómicas `create_loan`/`create_reservation` (SECURITY DEFINER, `for update`, índices únicos parciales) aplicadas al remoto; `loans.ts`/`reservations.ts` únicas puertas; `circulation.ts` (fecha≥hoy); confirmación con diálogos + oferta de reserva si se agota. 56/56 unit; RPC verificadas end-to-end con rollback (BT001/BT002/BT003/BT404)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-07-10 | F3.2 Mis préstamos                    | C      | 52bc1bb | `/mis-prestamos` con `LoanTable` responsive (4 estados) + renovar/devolver con confirmación. RPC atómicas `return_loan` (repone stock) / `renew_loan` (§7.2.5) aplicadas al remoto; `loans.ts` extendido (estado efectivo, canRenew, list/renew/return) + `settings.ts`; nav activado. 68/68 unit; RPC verificadas end-to-end con rollback (renovaciones 0→1, stock 2→3, BT100/BT101/BT200)                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-10 | F3.3 Historial                        | C      | 27adbb8 | **Cierra Fase 3.** `/historial` (activos/vencidos/devueltos) con filtro por estado y rango de fechas + paginación; reusa `LoanTable` sin acciones; lógica pura `filterLoanHistory`/`paginateList`; nav activado. 79/79 unit; ruta de datos verificada bajo RLS contra el remoto. **Módulo D queda Disponible.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-07-10 | F4.1 Cálculo de multas                | D      | 9ec242b | `fines.ts` (única puerta a `fines`): cálculo `dias_retraso × multa_diaria` (redondeo 2 dec.), generación por el sistema (admin/service role) que persiste `vencido` y crea/actualiza la multa `pendiente` (índice único `loan_id`), checker `getPendingFineLoanIds` que "Mis préstamos" pasa a `canRenew`; `markFinePaid` listo para F5.3. 86/86 unit; integración C↔D verificada end-to-end con rollback (multa visible por RLS, renovar bloqueado BT102)                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-07-12 | Post-`v1.0.0` · Iteración de UX       | A/B/C  | 7ae69fa | **Fuera del plan de 17 subfases; registrado retroactivamente el 2026-07-22** en `progreso/fase-7-ux.md`. 5 commits (+1242/−139): rediseño de login/inicio/shell (`4a9a684`, `8dc83cb`, `a6d02e3`); **política de préstamo 2 días + 1 ampliación de 1 día** con migración `..._loan_two_day_policy.sql` aplicada al remoto (`8fa1b3e`); **catálogo por áreas académicas** (`lib/domain/areas.ts`, `AreaHub`, `books.categoria` como lista controlada, 10 carreras en el registro) con migración `..._catalog_areas.sql` aplicada al remoto (`7ae69fa`). Verificado 2026-07-22: typecheck/lint verdes, 145/145 unit, build 28/28. **⚠️ `audit --audit-level=high` en rojo** (`sharp` <0.35.0, advisory posterior al cierre de F6.2) y **regresión detectada**: `renew_loan` perdió `vencimiento_notificado_en = null` de F4.2 → no se re-avisa el vencimiento tras ampliar. |
| 2026-07-11 | F6.2 Endurecimiento, PWA y despliegue | —      | 24cbcec | **Cierra Fase 6 y el proyecto (hito M4 — `v1.0.0`).** Headers de seguridad (CSP deny-by-default + HSTS + X-Frame/Content-Type + Referrer/Permissions-Policy) en `next.config.ts`; PWA instalable (`app/manifest.ts` standalone, íconos 192/512+maskable+apple-touch, meta theme-color/viewport, service worker propio `public/sw.js` con offline básico + `offline.html`, registro que engancha el diálogo global `offline`); rutas públicas PWA en el middleware; `/privacidad` (Ley 29733); job **e2e** en CI (playwright chromium, guard por secretos); `docs/backup-restore.md`; ADR-0002 (SW sin librería). 137/137 unit; typecheck/lint/build (28 páginas)/audit-high verdes; headers/manifest/SW/offline/íconos verificados por HTTP contra el server de producción.                                                                                               |
| 2026-07-11 | F6.1 Evaluación de usabilidad         | —      | 1ce6b6a | Entregable IHC `docs/evaluacion-usabilidad.md`: evaluación heurística de Nielsen pantalla por pantalla (severidad 0–4), recorrido cognitivo de los 4 flujos críticos y cuestionario SUS (instrumento + cálculo + piloto simulado 81.7 ≥ 75, a reemplazar con datos reales). Hallazgos críticos corregidos (solo UX/a11y): diálogos con nombre accesible, trampa de foco + retorno de foco (Modal), copy del login neutral al rol, skip-link. 137/137 unit; typecheck/lint/build/audit-high verdes.                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-11 | F5.4 Reportes y configuración         | E      | 17ea693 | **Cierra Fase 5 (hito M3 — sistema completo).** `/reportes` (préstamos por mes, libros más prestados, resumen de multas, con **export CSV** vía `lib/utils/csv`) y `/configuracion` (editar `dias_prestamo`/`multa_diaria`/`max_renovaciones`, Zod, solo bibliotecario, no retroactivo). `reports.ts` compone loans-admin/fines-admin (puros `loansByMonth`/`topBorrowedBooks`/`summarizeFines`); `settings.updateCirculationSettings`. 137/137 unit; end-to-end con rollback (config afecta préstamo nuevo → plazo 7 días; estudiante no edita settings → 0 filas). **Módulo E completo.**                                                                                                                                                                                                                                                                               |
| 2026-07-11 | F5.3 Préstamos/devoluciones/multas    | E      | 444ecf2 | `/prestamos` (vista global read-only, filtro por estado), `/devoluciones` (registrar devolución de cualquier usuario con **multa integrada**: `syncFineForLoan` congela días antes de `return_loan` que repone stock) y `/multas` (marcar pagada). Services `loans-admin.ts`/`fines-admin.ts` (reads globales + `registerReturn` + puros); reusa `return_loan`/`markFinePaid`/`syncFineForLoan`. Nav Préstamos/Devoluciones/Multas. 125/125 unit; devolución+multa y pago verificados end-to-end con rollback (bibliotecario devuelve préstamo ajeno y repone stock; estudiante no marca multas → 0 filas).                                                                                                                                                                                                                                                               |
| 2026-07-11 | F5.2 CRUD libros y usuarios           | E      | ac33508 | `/libros` y `/usuarios` (listar/crear/editar/baja lógica) bajo el layout `(admin)`. Libros: `books.activo` (el catálogo oculta inactivos), portada a Storage (`book-covers`), `books-admin.ts`. Usuarios: alta con cliente admin, edición contacto+rol+activación, anti-autobloqueo, `users-admin.ts`. **🔴 Fix seguridad**: trigger `prevent_self_privilege_change` corrige escalada de privilegios latente desde F1.2 (estudiante podía auto-promocionarse). 117/117 unit; RLS/Storage/escalada verificados end-to-end con rollback.                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-11 | F5.1 Dashboard con KPIs               | E      | 93cd0b3 | **Abre Fase 5 (Administración).** Route group `(admin)` con `layout.tsx` que exige rol bibliotecario (deny-by-default; RLS = autorización real) + reusa el shell. `/dashboard` con 4 KPIs reales (libros/usuarios/préstamos activos/multas pendientes) + tabla de préstamos recientes, 4 estados. Agregador `dashboard.ts` (compone services, no accede a tablas) + `buildRecentLoanRows` pura; conteos en `books.ts`/`users.ts`/`loans.ts`/`fines.ts`; componentes `KpiCard`/`RecentLoansTable`; nav "Dashboard" activado. 101/101 unit; KPIs y RLS verificados end-to-end con rollback (bibliotecario 7/5/0/0 por `is_librarian`, estudiante restringida a su perfil, join resuelve libro+usuario).                                                                                                                                                                     |
| 2026-07-10 | F4.2 Notificaciones + vista           | D      | 8e035f5 | **Cierra Fase 4 (hito M2).** `notifications.ts` (única puerta): genera `multa_generada` (en `fines.syncFineForLoan`), `vencimiento_proximo` y `reserva_disponible` con cliente admin; idempotencia por marcadores (`vencimiento_notificado_en`/`notificada_disponible_en`, `renew_loan` los reinicia). `/notificaciones` (4 estados) + marcar leída/todas; campana del Topbar con badge de no-leídas (`getUnreadCount` en layout). 96/96 unit; RLS verificada end-to-end con rollback (aislamiento María/Juan). **Módulo E queda Disponible.**                                                                                                                                                                                                                                                                                                                            |
