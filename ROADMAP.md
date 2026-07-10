# Roadmap — BiblioTEC

> Vista panorámica del progreso. Actualizar manualmente al cerrar cada subfase (espejo del GitHub Project).

**Inicio estimado:** 2026-07-10
**Cierre estimado:** por definir (equipo full-time, 2-3 devs)

## Leyenda

⏳ Pendiente · 🔄 En curso · ✅ Completada · ⚠️ Bloqueada · ⏸️ Pausada

## Estado general

| Métrica | Valor |
|---------|-------|
| Fases totales | 6 |
| Subfases totales | 17 |
| Completadas | 0 / 17 |
| % avance | 0% |

## Detalle por fase

### F1: Fundación & Acceso — Módulo [A]
**Estado:** ⏳ Pendiente · **A cargo de:** dev integrador (secuencial)
- ⏳ F1.1 [A] — Setup & tooling (Next+TS+Tailwind+shadcn, hooks, CI, tests)
- ⏳ F1.2 [A] — Base de datos, RLS y seed
- ⏳ F1.3 [A] — Sistema de diseño (kitchen-sink)
- ⏳ F1.4 [A] — Acceso + shell + perfil

### F2: Catálogo — Módulo [B]
**Estado:** ⚠️ Bloqueada por A
- ⏳ F2.1 [B] — Listado, búsqueda y filtros
- ⏳ F2.2 [B] — Detalle de libro + favoritos

### F3: Circulación — Módulo [C]
**Estado:** ⚠️ Bloqueada por B
- ⏳ F3.1 [C] — Reservas y préstamos
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

- **M1 — Fundación lista (`v0.1.0`):** al cerrar F1. Módulos B–E abiertos para reclamar.
- **M2 — Estudiante funcional:** al cerrar F4 (catálogo + circulación + multas/notificaciones).
- **M3 — Sistema completo:** al cerrar F5 (admin operativo).
- **M4 — V1.0 en producción (`v1.0.0`):** al cerrar F6.

## Bitácora de cierres

> Anotar fecha y commit cada vez que se cierra una subfase.

| Fecha | Subfase | Módulo | Commit | Notas |
|-------|---------|--------|--------|-------|
| — | — | — | — | (sin cierres aún) |
