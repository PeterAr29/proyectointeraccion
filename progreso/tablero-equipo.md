# Tablero del Equipo — BiblioTEC

> Espejo rápido de módulos (la verdad de las tareas está en el GitHub Project). **Actualizar ANTES de empezar y AL terminar.** El log de reclamos es *append-only*.

## Módulos

| Módulo | Estado | Dev | Desde |
|--------|--------|-----|-------|
| A — Plataforma & Acceso | Disponible (F1, integrador) | — | — |
| B — Catálogo | Bloqueado por A | — | — |
| C — Circulación | Bloqueado por B | — | — |
| D — Multas & Notificaciones | Bloqueado por C | — | — |
| E — Administración | Bloqueado por B, C, D | — | — |

## Tareas en curso (dentro de módulos)

| Tarea | Módulo | Dev | Estado |
|-------|--------|-----|--------|
| T-001 Setup & tooling | A | — | Disponible |

> El resto de tareas (T-002…T-017) están Bloqueadas por sus dependencias. Ver `docs/backlog.md`.

## Log de reclamos (append-only, evita disputas)

- 2026-07-10 — Kit de documentación generado. Módulo A queda Disponible para el dev integrador; B–E bloqueados hasta cerrar F1.

## Reglas rápidas

- Reclamar antes de codificar (mueve a *En progreso* aquí y en el GitHub Project).
- WIP máx 1-2 por dev. Terminar y liberar > acaparar.
- Un módulo Bloqueado no se reclama hasta que su dependencia esté Terminada.
- Al terminar: marca *Terminado*, pon *Disponible* lo que desbloquees, actualiza `estado-actual.md`.
