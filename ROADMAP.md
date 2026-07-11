# Roadmap — BiblioTEC

> Vista panorámica del progreso. Actualizar manualmente al cerrar cada subfase (espejo del GitHub Project).

**Inicio estimado:** 2026-07-10
**Cierre estimado:** por definir (equipo full-time, 2-3 devs)

## Leyenda

⏳ Pendiente · 🔄 En curso · ✅ Completada · ⚠️ Bloqueada · ⏸️ Pausada

## Estado general

| Métrica          | Valor  |
| ---------------- | ------ |
| Fases totales    | 6      |
| Subfases totales | 17     |
| Completadas      | 7 / 17 |
| % avance         | ~41%   |

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

**Estado:** 🔄 En curso · **A cargo de:** dev integrador

- ✅ F3.1 [C] — Reservas y préstamos
- ⏳ F3.2 [C] — Mis préstamos (renovar/devolver/vencidos)
- ⏳ F3.3 [C] — Historial

### F4: Multas & Notificaciones — Módulo [D]

**Estado:** ⚠️ Bloqueada por C

- ⏳ F4.1 [D] — Cálculo de multas
- ⏳ F4.2 [D] — Motor de notificaciones + vista

### F5: Administración — Módulo [E]

**Estado:** ⚠️ Bloqueada por B, C, D

- ⏳ F5.1 [E] — Dashboard con KPIs
- ⏳ F5.2 [E] — CRUD de libros y usuarios
- ⏳ F5.3 [E] — Préstamos, devoluciones y multas
- ⏳ F5.4 [E] — Reportes y configuración

### F6: Evaluación IHC & Producción

**Estado:** ⚠️ Bloqueada por todas

- ⏳ F6.1 — Evaluación de usabilidad (Nielsen + recorrido cognitivo + SUS)
- ⏳ F6.2 — Endurecimiento y despliegue

## Hitos clave (milestones)

- **M1 — Fundación lista (`v0.1.0`):** ✅ **alcanzado 2026-07-10.** F1 cerrada; módulos B–E abiertos para reclamar.
- **M2 — Estudiante funcional:** al cerrar F4 (catálogo + circulación + multas/notificaciones).
- **M3 — Sistema completo:** al cerrar F5 (admin operativo).
- **M4 — V1.0 en producción (`v1.0.0`):** al cerrar F6.

## Bitácora de cierres

> Anotar fecha y commit cada vez que se cierra una subfase.

| Fecha      | Subfase                         | Módulo | Commit  | Notas                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | F1.1 Setup & tooling            | A      | 7566ec9 | Next 15.5.20 + TS strict + Tailwind + shadcn; hooks, CI, Vitest/Playwright; audit high limpio                                                                                                                                                                                                                                                                                             |
| 2026-07-10 | F1.2 BD, RLS y seed             | A      | 62a6b7d | 8 tablas + 5 enums, RLS por rol probado end-to-end en Supabase remoto `bibliotec`, seed aplicado, helpers SSR + tipos                                                                                                                                                                                                                                                                     |
| 2026-07-10 | F1.3 Sistema de diseño          | A      | 3da6f81 | Componentes reutilizables + 10 diálogos globales + Toast, utils dates/currency con tests, `/kitchen-sink`; 17/17 tests, build y audit high verdes                                                                                                                                                                                                                                         |
| 2026-07-10 | F1.4 Acceso+shell+perfil        | A      | 8d8b3f7 | **Cierra Fase 1** (`v0.1.0`). Auth Supabase (login por código/registro/recuperar), middleware, shell responsive, perfil, `users.ts`; e2e login 3/3                                                                                                                                                                                                                                        |
| 2026-07-10 | F2.1 Catálogo listado/búsqueda  | B      | 46fcb4e | `/catalogo` con búsqueda/filtros/paginación + 4 estados; `books.ts` única puerta a books; 32/32 unit, e2e catálogo 3/3 contra el remoto                                                                                                                                                                                                                                                   |
| 2026-07-10 | F2.2 Catálogo detalle+favoritos | B      | 4c05da6 | **Cierra Fase 2.** `/catalogo/[id]` (detalle + "libro no encontrado") y `/favoritos` (toggle+lista, RLS, 4 estados); `books.ts` +favoritos; 37/37 unit, e2e catálogo 6/6 contra el remoto. Módulo C queda Disponible                                                                                                                                                                      |
| 2026-07-10 | F3.1 Reservas y préstamos       | C      | (pend.) | Flujo transaccional prestar/reservar. RPC atómicas `create_loan`/`create_reservation` (SECURITY DEFINER, `for update`, índices únicos parciales) aplicadas al remoto; `loans.ts`/`reservations.ts` únicas puertas; `circulation.ts` (fecha≥hoy); confirmación con diálogos + oferta de reserva si se agota. 56/56 unit; RPC verificadas end-to-end con rollback (BT001/BT002/BT003/BT404) |
