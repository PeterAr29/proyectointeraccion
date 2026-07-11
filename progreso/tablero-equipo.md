# Tablero del Equipo — BiblioTEC

> Espejo rápido de módulos (la verdad de las tareas está en el GitHub Project). **Actualizar ANTES de empezar y AL terminar.** El log de reclamos es _append-only_.

## Módulos

| Módulo                      | Estado                      | Dev        | Desde      |
| --------------------------- | --------------------------- | ---------- | ---------- |
| A — Plataforma & Acceso     | ✅ Completado (Fase 1)      | integrador | 2026-07-10 |
| B — Catálogo                | ✅ Completado (Fase 2)      | integrador | 2026-07-10 |
| C — Circulación             | ✅ Completado (Fase 3)      | integrador | 2026-07-10 |
| D — Multas & Notificaciones | Disponible (desbloq. por C) | —          | —          |
| E — Administración          | Bloqueado por B, C, D       | —          | —          |

## Tareas en curso (dentro de módulos)

| Tarea                                      | Módulo | Dev        | Estado                 |
| ------------------------------------------ | ------ | ---------- | ---------------------- |
| T-001 Setup & tooling (F1.1)               | A      | integrador | ✅ Terminada           |
| T-002 Base de datos, RLS y seed (F1.2)     | A      | integrador | ✅ Terminada           |
| T-003 Sistema de diseño (F1.3)             | A      | integrador | ✅ Terminada           |
| T-004 Acceso + shell + perfil (F1.4)       | A      | integrador | ✅ Terminada           |
| T-005 Catálogo: listado/búsqueda (F2.1)    | B      | integrador | ✅ Terminada           |
| T-006 Catálogo: detalle + favoritos (F2.2) | B      | integrador | ✅ Terminada           |
| T-007 Reservas y préstamos (F3.1)          | C      | integrador | ✅ Terminada           |
| T-008 Mis préstamos (F3.2)                 | C      | integrador | ✅ Terminada           |
| T-009 Historial (F3.3)                     | C      | integrador | ✅ Terminada           |
| T-010 Cálculo de multas (F4.1)             | D      | —          | Disponible (siguiente) |

> El resto de tareas (T-011…T-017) están Bloqueadas por sus dependencias. Ver `docs/backlog.md`.

## Log de reclamos (append-only, evita disputas)

- 2026-07-10 — Kit de documentación generado. Módulo A queda Disponible para el dev integrador; B–E bloqueados hasta cerrar F1.
- 2026-07-10 — F1.1 (Setup & tooling) **cerrada**: repo Next.js arrancable, tooling/CI/tests listos, audit high limpio. Siguiente: F1.2 (BD, RLS y seed). Módulos B–E siguen bloqueados hasta cerrar toda la F1.
- 2026-07-10 — F1.2 (BD, RLS y seed) **cerrada**: esquema completo (8 tablas + enums), RLS por rol probado end-to-end contra el proyecto remoto `bibliotec`, seed aplicado, helpers SSR de Supabase. Siguiente: F1.3 (sistema de diseño). Módulos B–E siguen bloqueados hasta cerrar toda la F1.
- 2026-07-10 — F1.3 (Sistema de diseño / kitchen-sink) **cerrada**: componentes reutilizables (StatusBadge, BookCover, Skeleton, EmptyState, ErrorState, Modal, 10 diálogos globales, Toast) + utils dates/currency con tests, mostrados en `/kitchen-sink`. 17/17 tests, build y audit high verdes. Siguiente: F1.4 (acceso + shell + perfil), última de la fundación. Módulos B–E siguen bloqueados hasta cerrar toda la F1.
- 2026-07-10 — F1.4 (Acceso + shell + perfil) **cerrada** → **Fase 1 COMPLETADA**. Auth contra Supabase (login por código, registro, recuperación), middleware protege rutas, shell responsive, perfil ver/editar, `users.ts` como única puerta a profiles. e2e de login 3/3 contra el remoto; typecheck/lint/build/audit/unit verdes. **Hito M1 (`v0.1.0`)**: módulos **B–E abiertos para reclamar**. Siguiente sugerido: F2.1 (módulo B).
- 2026-07-10 — **Módulo B reclamado** por el dev integrador. F2.1 (Catálogo: listado, búsqueda y filtros) **cerrada**: `/catalogo` con búsqueda parametrizada (título/autor/ISBN), filtros (categoría/ubicación/disponibilidad) y paginación por query params, con los 4 estados; `lib/services/books.ts` única puerta a `books`. 32/32 unit y e2e de catálogo 3/3 contra el remoto; typecheck/lint/build/audit-high verdes. Siguiente: F2.2 (detalle + favoritos).
- 2026-07-10 — F2.2 (Catálogo: detalle + favoritos) **cerrada** → **Fase 2 (Catálogo) COMPLETADA**. `/catalogo/[id]` (detalle + ErrorState "libro no encontrado" + botón préstamo deshabilitado para C) y `/favoritos` (toggle + lista, RLS, 4 estados); `books.ts` extendido (isFavorite/add/remove/listFavorites + `orderBooksByIds` pura); Server Action `toggleFavoriteAction` valida UUID en servidor. 37/37 unit y e2e de catálogo 6/6 contra el remoto (favoritos persisten, verificado por SQL); typecheck/lint/build/audit-high verdes. **Módulo C (Circulación) queda Disponible.** Siguiente sugerido: F3.1 (reservas y préstamos).
- 2026-07-10 — **Módulo C reclamado** por el dev integrador. F3.1 (Reservas y préstamos) **cerrada**: flujo transaccional prestar/reservar. RPC atómicas `create_loan`/`create_reservation` (SECURITY DEFINER, `for update` sobre el stock, índices únicos parciales de "un activo por usuario/libro") aplicadas al remoto; `lib/services/loans.ts` y `reservations.ts` como únicas puertas; `lib/validations/circulation.ts` (fecha no anterior a hoy); Server Actions revalidan el UUID en servidor; el detalle presta/reserva con confirmación (diálogos globales) y ofrece reservar si se agota el stock. 56/56 unit; RPC verificadas end-to-end contra el remoto con rollback (stock 3→2, reserva 'activa', SQLSTATE BT001/BT002/BT003/BT404 correctos); typecheck/lint/build/audit-high verdes. Siguiente: F3.2 (Mis préstamos: renovar/devolver/vencidos).
- 2026-07-10 — F3.2 (Mis préstamos) **cerrada**: `/mis-prestamos` con `LoanTable` responsive (4 estados) y renovar/devolver con confirmación. RPC atómicas `return_loan` (repone stock) y `renew_loan` (§7.2.5: máximo de renovaciones, bloqueo por multa pendiente; aceptan owner o bibliotecario para reuso en F5.3) aplicadas al remoto; `loans.ts` extendido (estado efectivo derivado, `canRenew`, `listOwnLoansWithBooks`, renew/return) + nuevo `settings.ts`; nav "Mis préstamos" activado. 68/68 unit; RPC verificadas end-to-end con rollback (renovaciones 0→1, stock Redes 2→3 al devolver, SQLSTATE BT100/BT101/BT200); typecheck/lint/build/audit-high verdes. Siguiente: F3.3 (Historial, cierra la Fase 3).
- 2026-07-10 — F3.3 (Historial) **cerrada** → **Fase 3 (Circulación) COMPLETADA**. `/historial` (activos/vencidos/devueltos) con filtro por estado y rango de fechas + paginación; reusa `LoanTable` sin acciones; lógica pura `filterLoanHistory` (por estado efectivo + fechas) y `paginateList`; nav "Historial" activado. 79/79 unit; ruta de datos verificada bajo RLS contra el remoto; typecheck/lint/build/audit-high verdes. **Hito de integración F3 verificado** (prestar/reservar/renovar/devolver end-to-end + vistas Mis préstamos/Historial). **Módulo D (Multas & Notificaciones) queda Disponible.** Siguiente sugerido: F4.1 (cálculo de multas). Además: preview desplegada en Vercel (https://proyectointeraccion.vercel.app).

## Reglas rápidas

- Reclamar antes de codificar (mueve a _En progreso_ aquí y en el GitHub Project).
- WIP máx 1-2 por dev. Terminar y liberar > acaparar.
- Un módulo Bloqueado no se reclama hasta que su dependencia esté Terminada.
- Al terminar: marca _Terminado_, pon _Disponible_ lo que desbloquees, actualiza `estado-actual.md`.
