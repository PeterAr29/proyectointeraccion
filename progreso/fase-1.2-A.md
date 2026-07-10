# Handoff — F1.2 Base de datos, RLS y seed (Módulo A)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Siguiente:** F1.3 (sistema de diseño / kitchen-sink)

## Qué quedó hecho

Capa de datos completa de BiblioTEC (esquema + RLS + seed) y helpers SSR de
Supabase. **Aplicada y verificada contra el proyecto Supabase remoto** `bibliotec`
(ref `umjelnabjdvrsfnqoszt`, us-east-2), porque esta máquina no tiene Docker para
levantar el stack local. Aún no hay UI de dominio ni auth (F1.3/F1.4).

### Verificaciones (todas en verde)

| Check                                | Resultado                                                 |
| ------------------------------------ | --------------------------------------------------------- |
| Migraciones aplicadas al remoto      | init_schema, rls_policies, harden_functions → OK          |
| Seed aplicado                        | profiles 5 · books 7 · loans 1 · favorites 1 · settings 1 |
| RLS — María (estudiante)             | ve 1 perfil (suyo), 7 libros, 1 préstamo (suyo)           |
| RLS — Juan (estudiante)              | **0 préstamos** (no ve el de María), 1 perfil             |
| RLS — Admin (bibliotecario)          | 5 perfiles, 1 préstamo, `is_librarian()`=true             |
| `is_librarian()` ejecutable por anon | **false** (revocado)                                      |
| `npx tsc --noEmit`                   | Sin errores                                               |
| `npm run lint`                       | Sin errores ni warnings                                   |
| `npm run test -- --run`              | 2/2 (smoke)                                               |
| `npm audit --audit-level=high`       | **exit 0**                                                |

## Esquema final (nombres exactos — esto es lo que consumen B–E)

Todas las tablas en `public`, con RLS activo, IDs `uuid` (salvo `settings.id`
singleton `integer`), timestamps `timestamptz`.

- **profiles**: `id`(FK auth.users), `codigo_universitario`(unique), `nombre`, `carrera?`, `correo`, `telefono?`, `rol`(enum), `activo`, `created_at`, `updated_at`
- **books**: `id`, `titulo`, `autor`, `editorial?`, `anio?`, `isbn?`(unique), `categoria?`, `ubicacion?`, `descripcion?`, `portada_url?`, `cantidad_total`, `cantidad_disponible`, timestamps. Check: `cantidad_disponible <= cantidad_total`.
- **loans**: `id`, `book_id`, `user_id`, `fecha_prestamo`, `fecha_devolucion_estimada`, `fecha_devolucion_real?`, `estado`(enum), `renovaciones`, timestamps
- **reservations**: `id`, `book_id`, `user_id`, `fecha_reserva`, `fecha_estimada_disponibilidad?`, `estado`(enum), timestamps
- **fines**: `id`, `loan_id`, `user_id`, `dias_retraso`, `monto`(numeric 10,2), `estado`(enum), timestamps
- **notifications**: `id`, `user_id`, `tipo`(enum), `mensaje`, `leida`, `created_at`
- **favorites**: `user_id`, `book_id` (PK compuesta), `created_at`
- **settings**: `id`(=1 singleton), `dias_prestamo`(14), `multa_diaria`(1.00), `max_renovaciones`(2), `updated_at`

**Enums:** `user_role`(estudiante|bibliotecario) · `loan_status`(activo|vencido|devuelto) · `reservation_status`(activa|cumplida|cancelada) · `fine_status`(pendiente|pagada) · `notification_type`(reserva_disponible|vencimiento_proximo|multa_generada).

## Decisiones y detalles no triviales

1. **Autorización = `is_librarian()` (SECURITY DEFINER).** Función que devuelve
   si el usuario actual es bibliotecario activo. Es DEFINER **a propósito**: la
   política de `profiles` la invoca, y si fuera INVOKER se auto-consultaría
   `profiles` bajo RLS → recursión. Con DEFINER se salta RLS al leer `profiles`.
2. **RLS evalúa la función con permiso del rol INVOCANTE.** Comprobado en vivo:
   revocar `EXECUTE` a `authenticated` da `permission denied for function` y
   rompe RLS. Por eso `authenticated` **conserva** EXECUTE; se revoca de
   `public` y `anon` (que no tienen políticas). Endurecimiento en
   `20260710120200_harden_functions.sql`.
3. **Generación de multas/notificaciones por el sistema:** el INSERT de `fines`
   y `notifications` está limitado a bibliotecario en RLS. El Módulo D generará
   estas filas **server-side con `SUPABASE_SERVICE_ROLE_KEY`**, que ignora RLS.
   El estudiante solo lee sus multas/notificaciones y marca notificaciones leídas.
4. **Fila única `settings`:** patrón singleton con `id integer PK check (id = 1)`.
   Lectura para cualquier autenticado (los services necesitan `dias_prestamo`,
   `multa_diaria`, `max_renovaciones`); edición solo bibliotecario.
5. **Tipos a mano:** `lib/supabase/database.types.ts` se escribió fiel al
   esquema (no había BD conectada al generar). **Regenerar** con
   `npx supabase gen types typescript` cuando cambie el esquema (ver `supabase/README.md`).
6. **Sin trigger `handle_new_user`:** el perfil se crea desde la app en el
   registro (F1.4), amparado por la policy `profiles_insert_self` (id = auth.uid()).

## Seed — procedencia de los datos

- **Del contexto (§9), exactos:** libros "Bases de Datos" y "Sistemas Operativos
  Modernos" (datos completos), usuaria María García López, y los títulos/autores
  del resto de libros + nombres del resto de usuarios.
- **Fixtures de demo** (marcados `-- [demo]` en `seed.sql`): correos/códigos de
  Juan/Ana/Luis y del bibliotecario, contraseña común (`Biblioteca123`),
  cantidades de todos los libros, y 1 préstamo + 1 favorito de María.
- **Faltantes no inventados:** campos bibliográficos no dados quedan `NULL`;
  "Programación en Java" y "Estructuras de Datos" no traen autor en el contexto →
  `autor = 'Autor desconocido'` (placeholder explícito, `autor` es NOT NULL).
- "Inteligencia Artificial" tiene `cantidad_disponible = 0` a propósito, para
  poder probar el flujo de reserva (Módulo C) más adelante.

## Archivos nuevos

```
supabase/config.toml                                  · CLI (generado por supabase init)
supabase/README.md                                    · cómo aplicar/reset/link/gen-types + usuarios seed
supabase/migrations/20260710120000_init_schema.sql    · tablas, enums, índices, triggers, RLS on
supabase/migrations/20260710120100_rls_policies.sql   · políticas por rol + is_librarian()
supabase/migrations/20260710120200_harden_functions.sql · endurecimiento (advisors)
supabase/seed.sql                                     · datos semilla
lib/supabase/config.ts                                · lectura validada de env públicas
lib/supabase/client.ts                                · createBrowserClient (navegador)
lib/supabase/server.ts                                · createServerClient (RSC/Actions, cookies async)
lib/supabase/middleware.ts                            · updateSession() (lo usará el middleware raíz en F1.4)
lib/supabase/database.types.ts                        · tipos del esquema (a mano; regenerar)
```

`package.json`: se añadieron `@supabase/supabase-js@2.47.10` y `@supabase/ssr@0.5.2` (pinneadas).

## Seguridad — estado de los advisors

Tras aplicar, `get_advisors(security)` quedó en:

- ✅ **Corregido:** `function_search_path_mutable` en `set_updated_at`.
- ✅ **Corregido:** exposición de `is_librarian()` al rol **anon**.
- 🟡 **Aceptado (bajo):** `authenticated_security_definer_function_executable` —
  un autenticado puede llamar `rpc/is_librarian`, pero solo revela **su propio**
  rol (ningún dato ajeno). Fix opcional futuro: mover la función a un esquema
  privado no expuesto por PostgREST.
- 🟠 **Pendiente (config Auth, F1.4):** _Leaked Password Protection_ deshabilitado.
  Activar en Supabase Auth (HaveIBeenPwned), alinea con A07.

## TODOs para F1.3 / F1.4

- [ ] (F1.4) Crear `middleware.ts` raíz que consuma `lib/supabase/middleware.ts:updateSession` y proteja `(app)`/`(admin)`. **Recordatorio:** `middleware.ts` y `lib/supabase/middleware.ts` están en la lista de "no tocar sin avisar".
- [ ] (F1.4) Activar Leaked Password Protection en Supabase Auth.
- [ ] `supabase link --project-ref umjelnabjdvrsfnqoszt` para habilitar `supabase db push` (pide DB password).
- [ ] Regenerar `database.types.ts` con el CLI en cuanto se haga `link` (validar que coincide con el escrito a mano).

## Cómo lo prueba el siguiente dev

1. `.env.local` ya tiene URL + anon + service_role del proyecto `bibliotec`.
2. Con Docker: `npx supabase start && npx supabase db reset` reproduce todo en local.
3. Sin Docker: el remoto ya está aplicado; los helpers de `lib/supabase/*` conectan directo.
4. Login de prueba (cuando exista auth en F1.4): `maria.garcia@univ.edu.pe` / `Biblioteca123`.
