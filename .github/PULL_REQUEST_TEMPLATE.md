# Pull Request — BiblioTEC

## ¿Qué hace este PR?

<!-- Descripción breve del cambio. -->

## Módulo y tarea

- **Módulo:** [ ] A · [ ] B · [ ] C · [ ] D · [ ] E · [ ] F6
- **Tarea(s):** T-___
- **Subfase:** F_._

## Checklist

- [ ] Tests de la funcionalidad escritos y pasando (`npm run test`)
- [ ] Lint y typecheck pasan (`npm run lint`, `npx tsc --noEmit`)
- [ ] `npm audit --audit-level=high` sin vulnerabilidades nuevas
- [ ] **Sin secretos** en el diff (`.env*` no incluido; gitleaks limpio)
- [ ] Sin `any` ni `@ts-ignore`; archivos < ~300 líneas
- [ ] Los 4 estados de UI existen donde se cargan datos (cargando/vacío/error/con datos)
- [ ] Acceso a datos solo vía `lib/services/*` (ningún componente toca Supabase directamente)
- [ ] RLS respetado; autorización revalidada en servidor (no solo en la UI)
- [ ] Tablero actualizado (`progreso/tablero-equipo.md` + GitHub Project) y handoff doc si cierra subfase
- [ ] Si cambié una **frontera** (firma de un service): avisado al equipo / ADR si aplica

## ¿Cómo probarlo?

<!-- Pasos o comandos para verificar el cambio. -->

## Notas para el revisor

<!-- Regla con IA: respondes por lo que tu Claude Code generó. Si no puedes explicar una línea, no se mergea. -->
- PR pequeño (< ~400 líneas de diff). Si es más grande, justificar o dividir.
