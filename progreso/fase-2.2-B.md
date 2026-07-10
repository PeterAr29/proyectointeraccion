# Handoff — F2.2 Catálogo: detalle de libro + favoritos (Módulo B)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** B (Catálogo) · **Siguiente:** Fase 3 (módulo C, Circulación) · **Cierra la Fase 2**

## Qué quedó hecho

- **`/catalogo/[id]`** — detalle del libro: portada, disponibilidad (StatusBadge +
  "N de M ejemplares disponibles"), metadatos (editorial, año, ISBN, categoría,
  ubicación), descripción y acciones. Server Component vía `getBookById`. Un id
  que no es UUID o que no existe → **ErrorState "Libro no encontrado"** (no 404
  crudo). Botón **Prestar/Reservar deshabilitado** con tooltip: el flujo
  transaccional es del módulo C, no se promete algo que aún no ocurre.
- **Favoritos** — toggle (corazón) en el detalle y página **`/favoritos`** que
  lista los favoritos del usuario (más reciente primero), respetando RLS.
- **Los cuatro estados** en ambas rutas: carga (`loading.tsx` con skeletons),
  vacío (`EmptyState`), error (`ErrorState`) y con datos.
- **`BookCard` ahora navega** al detalle (se le pasa `href` en catálogo y
  favoritos). Ítem **"Favoritos" activado** en el nav del estudiante.

### Verificaciones (todas en verde)

| Check                          | Resultado                                        |
| ------------------------------ | ------------------------------------------------ |
| `npx tsc --noEmit`             | Sin errores                                      |
| `npm run lint`                 | Sin errores ni warnings                          |
| `npm run build`                | OK (`/catalogo/[id]` y `/favoritos` dinámicas ƒ) |
| `npm run test -- --run`        | **37/37** (5 nuevos + 32 previos)                |
| `npm run test:e2e -- catalog`  | **6/6** contra el Supabase remoto (María)        |
| `npm audit --audit-level=high` | **exit 0** (solo low/moderate; ver deudas)       |

**E2E (`tests/e2e/catalog.spec.ts`), verificado en vivo con el seed (6 casos):**
listado, búsqueda por autor, estado vacío, **abrir detalle**, **id inexistente →
"Libro no encontrado"**, y **marcar/quitar favorito reflejado en `/favoritos`**.
El flujo de favoritos se probó end-to-end de verdad: el `addFavorite` persiste en
la tabla `favorites` del remoto (verificado por SQL) y el `removeFavorite`
restaura el estado del seed. El test se autolimpia.

## Interfaz de `lib/services/books.ts` (frontera del módulo B)

> ÚNICA puerta a `books` y `favorites`. Añadido en F2.2 sobre lo de F2.1.

- `getBookById(id): Promise<Book | null>` — (ya existía) detalle por id.
- `isFavorite(bookId): Promise<boolean>` — si el usuario actual lo tiene marcado.
- `addFavorite(bookId): Promise<{ ok: boolean }>` — idempotente (upsert sobre la
  PK compuesta; repetir no falla). `ok: false` sin sesión o ante error de BD.
- `removeFavorite(bookId): Promise<{ ok: boolean }>` — idempotente.
- `listFavorites(): Promise<Book[] | null>` — favoritos del usuario, más reciente
  primero. `null` = error (→ ErrorState); `[]` = sin favoritos (→ EmptyState).
- Lógica pura exportada (testeable sin BD): `orderBooksByIds(books, orderedIds)`.

`lib/validations/catalog.ts`: nuevo `parseBookId(value)` — valida UUID y devuelve
`null` si no lo es (nunca confía en el segmento crudo de la URL; A01/A03).

## Decisiones y detalles no triviales

1. **`listFavorites` en dos pasos** (ids en `favorites` → filas en `books` con
   `.in("id", ids)`), no con join embebido de PostgREST: los tipos escritos a
   mano tienen `Relationships: []`, así que un `select("books(*)")` no infiere
   bien. `orderBooksByIds` (pura) reordena para respetar "más reciente primero"
   y descarta ids sin libro (favorito de un libro borrado). Cubierto por tests.
2. **Escrituras acotadas por `user_id`** además de la RLS `*_own`: cada
   `add/remove/isFavorite` filtra por `auth.uid()` explícitamente (defensa en
   profundidad, no solo confiar en la política). Sin sesión → `{ ok: false }`.
3. **`addFavorite` idempotente** con `upsert(..., { ignoreDuplicates: true })`:
   marcar dos veces no rompe. `removeFavorite` idempotente por naturaleza.
4. **Server Action `toggleFavoriteAction`** (`app/(app)/favoritos/actions.ts`):
   revalida el id con `parseBookId` en el servidor (no confía en el cliente),
   delega en el service (RLS), y `revalidatePath` de `/favoritos` y del detalle.
5. **`FavoriteButton`** (cliente, reutilizable): optimista con `useTransition`;
   revierte y avisa (toast) si el servidor falla; `router.refresh()` tras éxito
   para reflejar la lista. Dos variantes: `full` (detalle, con etiqueta) e `icon`
   (superpuesto en la tarjeta de `/favoritos`). En la lista va como **hermano**
   de la tarjeta-enlace (no anidado), para no meter un `<button>` dentro de un
   `<a>` (HTML inválido / a11y).
6. **Detalle sin transacción de préstamo** (regla de la subfase): el botón
   Prestar/Reservar queda deshabilitado con tooltip. El módulo C lo activará.
7. **"Libro no encontrado" como ErrorState**, no `notFound()`: coincide con el
   texto pedido y mantiene el layout (volver al catálogo a un clic).

## Archivos nuevos / tocados

```
lib/services/books.ts                    · (editado) +favoritos (isFavorite/add/remove/list) + orderBooksByIds
lib/services/books.test.ts               · (editado) +5 tests (orderBooksByIds, parseBookId)
lib/validations/catalog.ts               · (editado) +parseBookId (UUID)
app/(app)/catalogo/[id]/page.tsx         · detalle del libro (4 estados)
app/(app)/catalogo/[id]/loading.tsx      · skeleton del detalle
app/(app)/favoritos/page.tsx             · lista de favoritos (4 estados)
app/(app)/favoritos/loading.tsx          · skeleton de favoritos
app/(app)/favoritos/actions.ts           · Server Action toggleFavoriteAction
components/biblioteca/FavoriteButton.tsx  · botón favorito (cliente, 2 variantes)
app/(app)/catalogo/page.tsx              · (editado) BookCard con href al detalle
components/layout/nav.ts                  · (editado) "Favoritos" enabled
tests/e2e/catalog.spec.ts                · (editado) +3 casos (detalle, id inexistente, favoritos)
```

Todos los archivos < 300 líneas (`books.ts` = 283).

## Hito de la Fase 2 — verificado

Un estudiante (María) **busca y filtra** libros reales del seed, **abre un
detalle**, **marca un favorito que persiste** en `/favoritos` y lo quita; la
disponibilidad refleja `cantidad_disponible`. Comprobado por e2e 6/6 contra el
remoto. **La Fase 2 (Catálogo) queda cerrada.**

## Handoff a Fase 3 (módulo C — Circulación)

- `books.ts` ya expone lo que C necesita: **`getBookById`** para el detalle desde
  el que se presta/reserva. El **decremento de `cantidad_disponible`** se hará en
  C (transacción/rpc atómica), no aquí.
- El botón **Prestar/Reservar del detalle** está listo para engancharse: hoy es
  un `<button disabled>` con tooltip en `LoanAction` (dentro de
  `app/(app)/catalogo/[id]/page.tsx`); C lo reemplaza por el modal transaccional.
- Ítems de nav de C (`/mis-prestamos`, `/historial`) siguen `enabled: false`
  hasta que existan sus rutas.

## TODOs / deudas que hereda la Fase 3

- [ ] **e2e de favoritos muta estado compartido del remoto**: se autolimpia al
      pasar, pero si un caso falla a mitad deja el favorito de Redes de María.
      Para CI conviene un `afterEach`/seed reset. Anotado; no bloquea el piloto.
- [ ] **Vuln low** en `@supabase/auth-js` (GHSA-8r88-6cj9-9fh5): subir
      `@supabase/supabase-js` a ≥2.110 (junto con la subida de `next`). Bajo el
      gate `high`, no bloquea.
- [ ] CI: `npx playwright install --with-deps chromium` antes de `test:e2e`
      (deuda arrastrada; ya son 2 specs: `auth` + `catalog`).
- [ ] `next lint` deprecado (Next 16): migrar a ESLint CLI (deuda previa).
- [ ] Portadas: `BookCover` usa `<img>` con `eslint-disable` de `no-img-element`;
      migrar a `next/image` cuando se cierre la subida de portadas (F5.2/Storage).

## Cómo lo prueba el siguiente dev

1. `npm run dev` → login `202100123` / `Biblioteca123`.
2. **Catálogo** → clic en un libro → ver el detalle; el botón Prestar/Reservar
   está deshabilitado (con tooltip). Marcar el corazón "Añadir a favoritos".
3. Ir a **Favoritos** (nav) → el libro aparece; quitarlo lo saca de la lista.
4. Visitar `/catalogo/<uuid-inexistente>` → "Libro no encontrado".
5. `npm run test -- --run` (37/37) y `npm run test:e2e -- catalog` (6/6, requiere
   el navegador de Playwright y `.env.local` con el remoto).
