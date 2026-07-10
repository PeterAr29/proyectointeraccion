# Estado Actual del Proyecto

**Última actualización:** 2026-07-10 (generación del kit)
**Última subfase completada:** ninguna
**Próxima subfase:** F1.1 — Setup & tooling (módulo A, dev integrador)

## Progreso global

- Fases completadas: 0/6
- Subfases completadas: 0/17
- Porcentaje estimado: 0%

## Resumen de lo construido hasta ahora

Nada de código todavía. El proyecto tiene el kit de documentación completo (CLAUDE.md, especificaciones, guía de desarrollo, roadmap, glosario, docs de equipo, backlog, threat-model y ADR-0001) y un prototipo de alta fidelidad en `design/`. El siguiente paso es que **un** dev ejecute la Fase 1 (fundación compartida) antes de abrir los módulos B–E.

## Estado por módulo (espejo del tablero)

| Módulo | Estado | Dev | Desde |
|--------|--------|-----|-------|
| A — Plataforma & Acceso | Disponible (F1, integrador) | — | — |
| B — Catálogo | Bloqueado por A | — | — |
| C — Circulación | Bloqueado por B | — | — |
| D — Multas & Notificaciones | Bloqueado por C | — | — |
| E — Administración | Bloqueado por B, C, D | — | — |

## Decisiones técnicas vivas (las que afectan trabajo futuro)

- La frontera entre módulos es la capa `lib/services/*`; un cambio de firma es un cambio de frontera (avisar + ADR si es de largo plazo).
- Autorización real = RLS en Postgres; la UI nunca es la fuente de autorización.
- F1 es secuencial y a cargo de un solo dev; los módulos se reclaman del tablero solo después.

## Issues abiertos del proyecto

- [ ] Elegir/crear el proyecto de Supabase y cargar las claves reales en `.env.local` (F1.2).
- [ ] Crear el GitHub Project desde `docs/backlog.md` (o generar issues con `gh`).

## Deudas técnicas anotadas

- 2FA para el rol bibliotecario (fuera del MVP; anotado en especificaciones §5.8).
- Notificaciones por email/push (F4 solo genera notificaciones in-app).
