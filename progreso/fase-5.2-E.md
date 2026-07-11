# Handoff — F5.2 CRUD de libros y usuarios (Módulo E)

**Fecha:** 2026-07-11 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** E (Administración) · **Siguiente:** F5.3 (Préstamos, devoluciones y multas)

## Qué quedó hecho

El bibliotecario gestiona el **catálogo** (`/libros`) y los **usuarios**
(`/usuarios`): listar, crear, editar y dar de baja/alta lógica, con subida de
portada a Storage, formularios Zod (cliente+servidor) y confirmación en las
acciones destructivas. Todo bajo el layout `(admin)` (rol bibliotecario) y con
las Server Actions revalidando el rol en el servidor.

### Libros (`/libros`, `/libros/nuevo`, `/libros/[id]`)

- **Baja lógica** con la nueva columna `books.activo` (no se borra en duro → se
  preserva el historial de préstamos, además protegido por `on delete restrict`).
  El catálogo del estudiante **oculta** los inactivos (`.eq("activo", true)` en
  `listBooks`/`getBookById`/`getCatalogFacets`/`listFavorites`/`countBooks`).
- **Crear/editar** con `bookFormSchema` (año 1450–2100, `disponible ≤ total`,
  ISBN opcional). ISBN duplicado → mensaje "ya existe" (índice único, 23505).
- **Portada a Supabase Storage** (bucket `book-covers`, público para leer,
  escritura solo bibliotecario). `uploadBookCover` sube con nombre aleatorio y
  devuelve la URL pública; el form la sube antes de guardar el libro.

### Usuarios (`/usuarios`, `/usuarios/nuevo`, `/usuarios/[id]`)

- **Alta** (estudiante o bibliotecario) con cliente admin (crea la cuenta de Auth
  - perfil; compensa borrando el Auth si falla el perfil). Unicidad de
    código/correo comprobada.
- **Edición** de contacto + **rol** + **activación**. Correo y código son
  identidad (no editables aquí: cambiarlos rompería el login por código→correo).
- **Baja lógica** (`activo=false`, conserva historial). **Anti-autobloqueo:** el
  admin no puede desactivarse ni quitarse el rol a sí mismo (guard en la action +
  botón oculto para la propia fila).

### 🔴 Corrección de seguridad (escalada de privilegios) — importante

Durante la verificación se detectó y **corrigió** un hueco **latente desde F1.2**:
la política `profiles_update_own_or_librarian` permitía al dueño actualizar su
propia fila con `with check (id = auth.uid())`, **incluidas `rol` y `activo`**. Un
estudiante podía, hablando directo con PostgREST (anon key público + su token),
**auto-promocionarse a bibliotecario**. Confirmado explotable contra el remoto.

- **Fix** (migración `..._profiles_privilege_guard.sql`): trigger
  `prevent_self_privilege_change` que bloquea (42501) cualquier cambio de
  `rol`/`activo` hecho por un autenticado no-bibliotecario. El service role
  (`auth.uid()` nulo) y el bibliotecario (`is_librarian()`) siguen gestionándolos.

### Verificaciones (todas en verde)

| Check                          | Resultado                             |
| ------------------------------ | ------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                           |
| `npm run lint`                 | Sin errores ni warnings               |
| `npm run build`                | OK (6 rutas admin nuevas)             |
| `npm run test -- --run`        | **117/117** (16 nuevos + 101 previos) |
| `npm audit --audit-level=high` | **exit 0**                            |
| RLS + escalada (remoto)        | **verificado con rollback** — abajo   |

**End-to-end (remoto, con `rollback`, seed intacto):**

- Bibliotecario **crea** un libro y lo **da de baja** (`activo=false`); un
  estudiante **NO** puede `insert` en `books` (RLS 42501).
- Estudiante **NO** puede escalar su rol (trigger 42501) pero **SÍ** edita su
  nombre; el **bibliotecario SÍ** cambia rol/activación de otros.
- Bucket `book-covers` creado con 4 policies (lectura pública; insert/update/
  delete solo bibliotecario).

## Interfaz nueva (fronteras)

- `lib/services/books-admin.ts` (módulo B): `listBooksAdmin`, `getBookForAdmin`,
  `createBook`, `updateBook`, `setBookActive`, `uploadBookCover`.
- `lib/services/users-admin.ts` (módulo A): `listUsers`, `getUserById`,
  `adminCreateUser`, `adminUpdateUser`, `setUserActive`.
- `lib/services/users.ts`: `isCurrentUserLibrarian()` (guard de rol para actions).
- `lib/services/books.ts`: lecturas del catálogo ahora filtran `activo=true`.
- `lib/validations/books.ts` y `lib/validations/admin-users.ts` (Zod + puros).

## Archivos nuevos / tocados

```
supabase/migrations/20260711120000_books_activo_and_covers_storage.sql · APLICADO
supabase/migrations/20260711120100_profiles_privilege_guard.sql        · APLICADO (fix seguridad)
lib/validations/books.ts (+test) · lib/validations/admin-users.ts (+test)
lib/services/books-admin.ts · lib/services/users-admin.ts
lib/services/books.ts (filtro activo + countBooks) · users.ts (isCurrentUserLibrarian)
lib/supabase/database.types.ts (books.activo)
app/(admin)/libros/{page,loading,actions,BookForm,BooksAdminList}.tsx + nuevo/ + [id]/
app/(admin)/usuarios/{page,loading,actions,UserForm,UsersAdminList}.tsx + nuevo/ + [id]/
components/layout/nav.ts (Libros y Usuarios enabled)
```

## Decisiones no triviales

1. **Baja lógica en vez de borrado** (elegido con el usuario): preserva historial;
   el catálogo filtra `activo` en la capa de servicios (módulo B), no en la UI.
2. **Split de services por tamaño**: `books-admin.ts`/`users-admin.ts` son del
   mismo módulo que `books.ts`/`users.ts`; se separan solo por la regla de ≤300
   líneas. Siguen siendo puertas del mismo dominio.
3. **Correo/código no editables** en la edición de usuario para no desincronizar
   el login (código→correo→Auth). Cambiar correo requeriría actualizar Auth.
4. **Alta con cliente admin** (crea la cuenta de Auth); edición/activación con la
   sesión del bibliotecario (RLS). Nunca se borra en duro.
5. **Guard anti-autobloqueo** del propio admin, en la Server Action.
6. **Fix de escalada de privilegios** por trigger (no solo RLS): la RLS por sí
   sola no distingue columnas sensibles en un UPDATE del propio dueño.

## TODOs / deudas que hereda F5.3+

- [ ] **Editar correo de un usuario** (y reflejarlo en Supabase Auth) queda
      pendiente: hoy correo/código son de solo lectura en la edición.
- [ ] **Limpieza de portadas huérfanas en Storage**: al reemplazar/eliminar una
      portada no se borra el archivo anterior del bucket. Job de limpieza futuro.
- [ ] **Sin e2e de admin** todavía (verificado con RLS + rollback y tests puros).
      Añadir en F6 (flujos críticos): crear libro, subir portada, dar de baja.
- [ ] `getBookForAdmin`/`listBooksAdmin` no paginan (decenas de libros en el
      piloto). Añadir búsqueda/paginación admin si el catálogo crece.
- [ ] Deudas previas vigentes (F5.1/F4): generación de notificaciones/multas en
      render (→ job programado), Realtime de la campana, `next lint` deprecado,
      vuln low `@supabase/auth-js`, Playwright install en CI, Leaked Password
      Protection en Supabase Auth.
