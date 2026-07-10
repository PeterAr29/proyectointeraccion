# Equipo — Módulos, Fronteras y Convivencia

> **Modo actual: SOLO (1 desarrollador).** Este documento describe cómo está organizado el trabajo por módulos y cómo se activa el modo colaborativo si se suma otra persona (sin rediseñar nada).
>
> Los módulos son **unidades de trabajo**, no asignaciones fijas a personas. Trabajando solo, el catálogo de módulos es tu **mapa de avance**: lo recorres en orden de dependencias. Con 2+ devs, cualquiera reclama un módulo/tarea *Disponible*, lo marca *En progreso* en el tablero, trabaja y lo libera. Ver el tablero en `progreso/tablero-equipo.md` (y el GitHub Project cuando haya equipo).

## Principio central

Propiedad colectiva del código, no "un dev = un módulo". El número de módulos lo define el **dominio** (5 verticales), no el número de devs. Sumar o quitar gente no exige rediseñar nada: el mismo tablero y las mismas fronteras sirven con 1 o con 3 personas.

## Catálogo de módulos

| Módulo | Frontera (interfaz) | Depende de | Estado | Trabajando |
|--------|---------------------|------------|--------|-----------|
| **A — Plataforma & Acceso** | `lib/supabase/*`, `lib/services/users.ts`, `components/ui` + `components/feedback`, shell (`components/layout/*`), `middleware.ts` | — | Disponible (F1, integrador) | — |
| **B — Catálogo** | `lib/services/books.ts` (list/search/getById, favoritos) | A | Bloqueado por A | — |
| **C — Circulación** | `lib/services/loans.ts`, `lib/services/reservations.ts` | A, B | Bloqueado por B | — |
| **D — Multas & Notificaciones** | `lib/services/fines.ts`, `lib/services/notifications.ts` | A, C | Bloqueado por C | — |
| **E — Administración** | consume todos los services (no accede a tablas ajenas) | A, B, C, D | Bloqueado | — |

Estados posibles: **Disponible** · **En progreso** (+ quién) · **Bloqueado** (+ por qué) · **Terminado**.

### Fronteras (contratos)

- La frontera entre módulos es SIEMPRE una función de servicio tipada en `lib/services/`. Ningún módulo accede a las tablas o componentes internos de otro directamente.
- Ejemplo: el módulo C (Circulación) usa `books.getById` para leer un libro; **no** consulta la tabla `books` por su cuenta.
- El módulo E (Admin) orquesta llamando a los services de B/C/D; no reimplementa su lógica.

## Reglas de convivencia

1. **Reclamar antes de codificar.** Marca el módulo/tarea *En progreso* en el tablero ANTES de tocar código. Es lo que evita choques.
2. **Un módulo En progreso no lo toma otro dev.** Sus tareas internas independientes sí pueden repartirse si se acuerdan las fronteras y se anotan.
3. **Las dependencias mandan.** Un módulo Bloqueado no se reclama hasta que su dependencia esté Terminada. Excepción: se puede empezar contra la **interfaz** (mock) de un service ya acordado.
4. **WIP máximo 1-2 por dev.** Terminar y liberar > acaparar.
5. **Sin módulos disponibles:** ayuda a desbloquear (review, pairing) en vez de abrir un frente a medias.
6. **Cambios a una frontera compartida:** avisar al equipo ANTES de codificar; si es de largo plazo, registrar ADR en `docs/adr/`.
7. **Liberar al terminar:** marca Terminado y actualiza a *Disponible* los módulos que desbloquea.

## Fases en modo colaborativo

- **F1 es compartida y secuencial:** un solo dev (el integrador) la ejecuta (repo, BD/RLS, diseño, auth+shell). Solo tras F1 se abren B–E.
- Cada subfase está etiquetada con su módulo `[A]`…`[E]` y sus dependencias en `docs/guia_desarrollo.md`.
- Subfases de módulos sin dependencia mutua son paralelizables.
- **Cada fase cierra con un hito de integración** sin mocks (el "demo" del equipo).
- Handoff docs por módulo: `progreso/fase-{n}.{m}-{modulo}.md`.

## Metodología (Scrum-lite)

- **Iteración semanal** (equipo full-time): reunión corta (15-30 min) para revisar el tablero, desbloquear dependencias y fijar el objetivo de la semana.
- **Hito de integración = review** de la semana/fase: se demuestra el flujo funcionando.
- **Retro exprés** al cerrar cada fase (5 min, 2 preguntas: qué funcionó / qué mejorar).
- Backlog en `docs/backlog.md`; tablero en GitHub Project + espejo en `progreso/tablero-equipo.md`.

## Onboarding de un dev nuevo

1. Clona el repo, lee `CLAUDE.md` y este archivo.
2. Mira el tablero: toma un módulo *Disponible* o una tarea disponible dentro de un módulo activo (coordinando frontera).
3. Márcalo *En progreso* (reclamar antes de codificar).
4. Arranca su sesión de Claude Code: `"Lee CLAUDE.md y el handoff del módulo {X}; tomo la tarea T-{nnn}"`.

## Tablero: GitHub Project + Markdown

Usamos **ambos**: el GitHub Project (Issues por tarea, milestones/labels por módulo) es la verdad para tareas; `progreso/tablero-equipo.md` es el resumen rápido de módulos que se actualiza en el mismo PR que cierra trabajo. Para generar los Issues desde el backlog, ver la nota de `gh` al final de `docs/backlog.md`.
