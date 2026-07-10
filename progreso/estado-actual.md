# Estado Actual del Proyecto

**Última actualización:** 2026-07-10 (cierre F1.3)
**Última subfase completada:** F1.3 — Sistema de diseño (kitchen-sink) (módulo A)
**Próxima subfase:** F1.4 — Acceso + shell + perfil (módulo A, dev integrador) — última de la fundación

## Progreso global

- Fases completadas: 0/6
- Subfases completadas: 3/17
- Porcentaje estimado: ~18%

## Resumen de lo construido hasta ahora

**F1.3 completada.** El sistema de diseño reutilizable existe y está mostrado en
`/kitchen-sink` (build prerenderizado estático). Es el catálogo de UI que
consumirán B–E; todo recibe props (sin datos reales):

- **Componentes de dominio:** `StatusBadge` (semáforo de estados con los enums de
  la BD) y `BookCover` (portada con imagen o gradiente estable por título).
- **Feedback:** `Skeleton` (+ variantes), `EmptyState`, `ErrorState`, `Modal`
  (primitivo accesible: role dialog, Escape, foco, scroll-lock), `Dialog` (10
  diálogos globales por variante) y `Toast` (`ToastProvider` + `useToast`).
- **Primitivo:** `components/ui/button.tsx` (`Button`, 6 variantes con cva).
- **Utils:** `lib/utils/dates.ts` (DD/MM/AAAA, maneja date-only sin corrimiento
  UTC) y `currency.ts` (`S/`), ambos con tests. **17/17 tests en verde.**
- Accesibilidad AA (foco visible, contraste, roles ARIA en diálogos/toasts).
- Pendiente para F1.4: montar `<ToastProvider>` en el shell. Detalle y firmas de
  cada componente en `progreso/fase-1.3-A.md`.

### Construido en subfases previas

**F1.2 completada.** La capa de datos existe y está aplicada en el proyecto Supabase remoto `bibliotec` (ref `umjelnabjdvrsfnqoszt`):

- **Esquema** (`supabase/migrations/20260710120000_init_schema.sql`): 8 tablas (profiles, books, loans, reservations, fines, notifications, favorites, settings), 5 enums, índices, triggers de `updated_at`, IDs UUID, checks de integridad (p. ej. `cantidad_disponible <= cantidad_total`). RLS habilitado en todas.
- **Políticas RLS** (`..._rls_policies.sql`): estudiante solo sus filas; books/settings lectura para autenticados; escritura de catálogo/settings solo bibliotecario; función `is_librarian()` (SECURITY DEFINER, evita recursión). **Probado end-to-end**: María (estudiante) ve solo lo suyo, Juan no ve datos de María, el bibliotecario ve todo.
- **Endurecimiento** (`..._harden_functions.sql`): `search_path` fijo y `EXECUTE` de `is_librarian()` revocado de anon/public. Security advisors de Supabase revisados (queda 1 WARN aceptado de bajo riesgo — ver handoff).
- **Seed** (`supabase/seed.sql`): 5 usuarios (4 estudiantes + 1 bibliotecario), 7 libros, settings, 1 préstamo y 1 favorito de demo. Contraseña común dev: `Biblioteca123`.
- **Helpers SSR** (`lib/supabase/{client,server,middleware,config}.ts`) + tipos (`database.types.ts`) escritos a mano fieles al esquema.

Aún **no hay** componentes de dominio, sistema de diseño ni auth funcional (F1.3 y F1.4). `.env.local` ya tiene las claves reales del proyecto (git-ignored). `npm audit --audit-level=high` en exit 0; typecheck/lint/tests en verde. Detalle y decisiones en `progreso/fase-1.2-A.md`.

**F1.1** (previa): repo Next.js 15 arrancable con tooling/CI/tests. Detalle en `progreso/fase-1.1-A.md`.

## Estado por módulo (espejo del tablero)

| Módulo                      | Estado                    | Dev        | Desde      |
| --------------------------- | ------------------------- | ---------- | ---------- |
| A — Plataforma & Acceso     | En curso (F1.4 siguiente) | integrador | 2026-07-10 |
| B — Catálogo                | Bloqueado por A           | —          | —          |
| C — Circulación             | Bloqueado por B           | —          | —          |
| D — Multas & Notificaciones | Bloqueado por C           | —          | —          |
| E — Administración          | Bloqueado por B, C, D     | —          | —          |

## Decisiones técnicas vivas (las que afectan trabajo futuro)

- La frontera entre módulos es la capa `lib/services/*`; un cambio de firma es un cambio de frontera (avisar + ADR si es de largo plazo).
- Autorización real = RLS en Postgres; la UI nunca es la fuente de autorización.
- F1 es secuencial y a cargo de un solo dev; los módulos se reclaman del tablero solo después.

## Issues abiertos del proyecto

- [x] ~~Elegir/crear el proyecto de Supabase y cargar las claves reales en `.env.local`~~ — hecho en F1.2 (proyecto `bibliotec`, `umjelnabjdvrsfnqoszt`; claves en `.env.local`).
- [ ] `supabase link` del repo al proyecto remoto (pide el DB password) para poder usar `supabase db push` desde el CLI. Ver `supabase/README.md`.
- [ ] Instalar **Docker Desktop** si se quiere levantar el stack local (`supabase start` / `db reset`). Hoy la BD se aplica y verifica contra el remoto.
- [ ] Crear el GitHub Project desde `docs/backlog.md` (o generar issues con `gh`).
- [ ] Instalar **gitleaks** localmente (`winget install gitleaks`) para activar el escaneo de secretos en pre-commit (hoy hace fallback si no está).

## Deudas técnicas anotadas

- **Auth:** activar _Leaked Password Protection_ (HaveIBeenPwned) en Supabase Auth al implementar F1.4 (advisor de seguridad, alineado con A07). Es un ajuste de dashboard/config, no de migración.
- **RLS/advisor aceptado (🟡 bajo):** `authenticated` puede llamar `rpc/is_librarian` (revela solo el rol del propio llamante, ningún dato ajeno). Endurecimiento opcional: mover la función a un esquema no expuesto por PostgREST. Ver `fase-1.2-A.md`.
- 2FA para el rol bibliotecario (fuera del MVP; anotado en especificaciones §5.8).
- Notificaciones por email/push (F4 solo genera notificaciones in-app).
- `next lint` deprecado (se elimina en Next 16): migrar a ESLint CLI antes de subir de major.
- 2 vulnerabilidades **moderate** en el `postcss` interno de next 15.5.20 (bajo el gate `high`); se resolverán al actualizar next.
