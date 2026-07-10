# Handoff — F2.1 Catálogo: listado, búsqueda y filtros (Módulo B)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** B (Catálogo) · **Siguiente:** F2.2 (detalle + favoritos)

## Qué quedó hecho

`/catalogo`: Server Component que lista los libros del catálogo en grid con
búsqueda (título/autor/ISBN), filtros (categoría, ubicación, disponibilidad) y
paginación, todo por query params. Los **cuatro estados** presentes: carga
(`loading.tsx` con skeletons), vacío (`EmptyState` "Sin resultados"), error
(`ErrorState`) y con datos. `lib/services/books.ts` es la **única puerta** a la
tabla `books`.

### Verificaciones (todas en verde)

| Check                          | Resultado                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                           |
| `npm run lint`                 | Sin errores ni warnings                               |
| `npm run build`                | OK (`/catalogo` dinámica ƒ)                           |
| `npm run test -- --run`        | **32/32** (15 nuevos de `books`/catalog + 17 previos) |
| `npm run test:e2e -- catalog`  | **3/3** contra el Supabase remoto (María)             |
| `npm audit --audit-level=high` | **exit 0** (solo low/moderate; ver deudas)            |

**E2E (`tests/e2e/catalog.spec.ts`), verificado en vivo con el seed:**

1. `/catalogo` lista los 7 libros del seed (se ve "Sistemas Operativos Modernos"
   y el contador "N libros encontrados").
2. Buscar "Tanenbaum" filtra a sus 2 libros (Redes, Sistemas Operativos);
   "Bases de Datos" desaparece.
3. `?q=zzzznoexiste` → `EmptyState` "Sin resultados" + enlace "Ver todo el catálogo".

## Interfaz de `lib/services/books.ts` (frontera para el módulo C)

> ÚNICA puerta a `books`. C (circulación) la reutilizará para reservar/prestar.

- `listBooks(filters: CatalogFilters): Promise<ListBooksResult>` — listado
  paginado y filtrado. Devuelve `{ ok: true, books, total, page, totalPages, pageSize }`
  o `{ ok: false }` ante error de BD (la UI lo traduce a ErrorState).
- `getBookById(id: string): Promise<Book | null>` — un libro por id (o `null`).
  **Ya disponible** para que F2.2 (detalle) y el módulo C la consuman.
- `getCatalogFacets(): Promise<{ categorias, ubicaciones }>` — valores distintos
  para poblar los selects de filtro.
- Lógica pura exportada (testeable sin BD): `buildSearchFilter(term)`,
  `computePagination(total, page, pageSize?)`, `isAvailable(book)`, `PAGE_SIZE` (12).
- Tipo `Book` (= fila de `books`) se exporta desde aquí.

`lib/validations/catalog.ts`: `catalogFiltersSchema`, `parseCatalogFilters(searchParams)`
(nunca lanza; tolera basura en la URL), `hasActiveFilters(filters)`, `DISPONIBILIDAD`.

## Decisiones y detalles no triviales

1. **Búsqueda parametrizada / anti-inyección (A03).** `buildSearchFilter` elimina
   los caracteres con significado en la gramática `.or()` de PostgREST (`, ( ) *`)
   y los comodines LIKE (`%`, `\`) antes de armar el filtro `titulo/autor/isbn.ilike`.
   El término del usuario se trata como texto literal. Cubierto por tests.
2. **Filtros por URL (query params), no estado de cliente.** El formulario es un
   `<form method="get">` en un Server Component: sin JS de cliente, URL compartible
   y con historial. Omitir el campo `page` reinicia la paginación a 1 al filtrar.
3. **Paginación con conteo previo.** `listBooks` hace un `count: exact, head: true`
   filtrado, calcula/acota la página con `computePagination`, y luego pide solo la
   ventana con `.range(from, to)`. Una página fuera de rango se acota a la última.
4. **`applyFilters` genérico** sobre el builder de Supabase: comparte los filtros
   entre el query de conteo y el de datos sin duplicar. `no-disponibles` usa
   `.lt("cantidad_disponible", 1)` (equivale a `= 0`, entero ≥ 0) por tipado.
5. **`BookCard` presentacional con `href` opcional.** En F2.1 NO se pasa `href`
   (el detalle es F2.2), así que la tarjeta no enlaza a rutas inexistentes (sin
   404). F2.2 solo tiene que pasarle `href={/catalogo/${id}}`.
6. **Disponibilidad como semáforo.** `StatusBadge` verde "Disponible" /
   rojo "No disponible" según `cantidad_disponible > 0`.
7. **Nav activado.** `components/layout/nav.ts`: el ítem "Catálogo" pasó a
   `enabled: true` (ya no está "próximamente").
8. **Env dummy en tests.** `tests/setup.ts` ahora define `NEXT_PUBLIC_SUPABASE_URL`
   y `..._ANON_KEY` ficticias: importar la capa `lib/services/*` evalúa
   `lib/supabase/config` (que exige esas vars). No se hace ninguna llamada real en
   los unit tests. Reutilizable por los módulos C–E.

## Archivos nuevos / tocados

```
lib/services/books.ts                 · única puerta a books (list/getById/facets + lógica pura)
lib/services/books.test.ts            · tests de búsqueda/paginación/parse (15)
lib/validations/catalog.ts            · Zod de filtros + parseo tolerante
components/biblioteca/BookCard.tsx     · tarjeta de libro (href opcional)
app/(app)/catalogo/page.tsx            · listado + 4 estados
app/(app)/catalogo/loading.tsx         · skeleton (estado cargando)
app/(app)/catalogo/CatalogFilters.tsx  · form GET de búsqueda/filtros
app/(app)/catalogo/Pagination.tsx      · enlaces de paginación que preservan filtros
tests/e2e/catalog.spec.ts             · e2e de listado/búsqueda/vacío
components/layout/nav.ts               · (editado) "Catálogo" enabled
tests/setup.ts                         · (editado) env dummy de Supabase
```

Todos los archivos < 300 líneas.

## TODOs / deudas que hereda F2.2

- [ ] **F2.2**: `/catalogo/[id]` (detalle con `getBookById`) + favoritos
      (`addFavorite`/`removeFavorite`/`listFavorites` extendiendo `books.ts`) +
      `/favoritos`. Pasar `href` a `BookCard` para navegar al detalle.
- [ ] **Nueva vuln low** en `@supabase/auth-js` (Insecure Path Routing, GHSA-8r88-6cj9-9fh5):
      se resuelve subiendo `@supabase/supabase-js` a ≥2.110. Bajo el gate `high`,
      no bloquea; agendar junto con la subida de `next` (deuda previa de postcss).
- [ ] CI: recordar `npx playwright install --with-deps chromium` antes de `test:e2e`
      (deuda arrastrada de F1.4; ya son 2 specs: `auth` + `catalog`).
- [ ] `next lint` sigue deprecado (Next 16): migrar a ESLint CLI (deuda previa).

## Cómo lo prueba el siguiente dev

1. `npm run dev` → login con `202100123` / `Biblioteca123` → ir a **Catálogo**.
2. Buscar "Tanenbaum" (filtra a 2), probar filtro Disponibilidad = "No disponibles"
   (queda "Inteligencia Artificial"), limpiar filtros.
3. `npm run test -- --run` (32/32) y `npm run test:e2e -- catalog` (3/3, requiere
   navegador de Playwright instalado).
