# Estado Actual del Proyecto

**Última actualización:** 2026-07-10 (cierre F1.1)
**Última subfase completada:** F1.1 — Setup & tooling (módulo A)
**Próxima subfase:** F1.2 — Base de datos, RLS y seed (módulo A, dev integrador)

## Progreso global

- Fases completadas: 0/6
- Subfases completadas: 1/17
- Porcentaje estimado: ~6%

## Resumen de lo construido hasta ahora

**F1.1 completada.** El repo ya es un proyecto Next.js 15 (App Router) + TypeScript strict + Tailwind + shadcn/ui que arranca en `localhost:3000`, con ESLint/Prettier, pre-commit hooks (husky + lint-staged + gitleaks), Vitest (smoke test en verde) y Playwright inicializados, CI y Dependabot. Tokens del prototipo aplicados (Inter, radio 8px, semáforo de estados). `npm audit --audit-level=high` en exit 0. Detalle y decisiones en `progreso/fase-1.1-A.md`.

Aún **no hay** base de datos, Supabase, componentes de dominio ni auth (eso empieza en F1.2). El kit de documentación (CLAUDE.md, especificaciones, guía, roadmap, glosario, equipo, backlog, threat-model, ADR-0001) y el prototipo en `design/` siguen siendo la referencia.

## Estado por módulo (espejo del tablero)

| Módulo                      | Estado                      | Dev | Desde |
| --------------------------- | --------------------------- | --- | ----- |
| A — Plataforma & Acceso     | Disponible (F1, integrador) | —   | —     |
| B — Catálogo                | Bloqueado por A             | —   | —     |
| C — Circulación             | Bloqueado por B             | —   | —     |
| D — Multas & Notificaciones | Bloqueado por C             | —   | —     |
| E — Administración          | Bloqueado por B, C, D       | —   | —     |

## Decisiones técnicas vivas (las que afectan trabajo futuro)

- La frontera entre módulos es la capa `lib/services/*`; un cambio de firma es un cambio de frontera (avisar + ADR si es de largo plazo).
- Autorización real = RLS en Postgres; la UI nunca es la fuente de autorización.
- F1 es secuencial y a cargo de un solo dev; los módulos se reclaman del tablero solo después.

## Issues abiertos del proyecto

- [ ] Elegir/crear el proyecto de Supabase y cargar las claves reales en `.env.local` (F1.2).
- [ ] Crear el GitHub Project desde `docs/backlog.md` (o generar issues con `gh`).
- [ ] Instalar **gitleaks** localmente (`winget install gitleaks`) para activar el escaneo de secretos en pre-commit (hoy hace fallback si no está).

## Deudas técnicas anotadas

- 2FA para el rol bibliotecario (fuera del MVP; anotado en especificaciones §5.8).
- Notificaciones por email/push (F4 solo genera notificaciones in-app).
- `next lint` deprecado (se elimina en Next 16): migrar a ESLint CLI antes de subir de major.
- 2 vulnerabilidades **moderate** en el `postcss` interno de next 15.5.20 (bajo el gate `high`); se resolverán al actualizar next.
