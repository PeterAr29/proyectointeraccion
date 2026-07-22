# Handoff — F7 Iteración de UX post-`v1.0.0` (registro retroactivo)

**Fecha del trabajo:** 2026-07-12 · **Fecha de este registro:** 2026-07-22 · **Dev:** integrador · **Estado:** ✅ Código entregado / ⚠️ con 2 pendientes abiertos · **Fase:** posterior al cierre formal (F6 ya estaba cerrada)

> **Por qué existe este documento.** Tras cerrar el proyecto (`v1.0.0`, 2026-07-11)
> entraron **5 commits el 2026-07-12** que nadie registró: rediseño visual, un
> **cambio de regla de negocio** (préstamo 2+1) y una **taxonomía nueva del
> catálogo**, con **2 migraciones aplicadas al remoto**. La documentación quedó
> describiendo un sistema que ya no es el que está en producción. Este handoff
> reconstruye ese trabajo y deja anotado lo que quedó pendiente.

## Alcance (commits reconstruidos)

| Commit    | Módulo | Qué cambió                                                                   |
| --------- | ------ | ---------------------------------------------------------------------------- |
| `4a9a684` | A      | Rediseño de login (2 columnas con panel de marca), inicio y acceso al perfil |
| `8fa1b3e` | C      | **Política de préstamo 2 días + 1 ampliación de 1 día** (migración)          |
| `8dc83cb` | A      | Inicio como tablero personalizado con datos reales por rol                   |
| `a6d02e3` | A      | Shell con color: sidebar/drawer en degradado azul→índigo, fondo tintado      |
| `7ae69fa` | B      | Catálogo por **áreas académicas** + 10 carreras en el registro (migración)   |

Total: **29 archivos, +1242 / −139**.

## 1. Cambio de regla de negocio — préstamo 2+1 (Módulo C)

**Es el cambio de mayor impacto: sustituye la política vigente desde F1.2.**

- `settings`: `dias_prestamo = 2`, `max_renovaciones = 1` (migración
  `20260712120000_loan_two_day_policy.sql`, **aplicada al remoto**).
- **`renew_loan` re-declarada**: la ampliación suma **exactamente 1 día**
  (`greatest(fecha_devolucion_estimada, now()) + 1 día`) en vez del plazo completo.
  Partir de `greatest(...)` evita que ampliar deje la fecha en el pasado.
- `lib/validations/settings.ts` acota los rangos del formulario de Configuración y
  el copy pasa de "renovación" a "ampliación".
- **No es retroactivo**: `create_loan` lee `dias_prestamo` al prestar.

⚠️ **Toda la documentación previa que dice "7 días" o "renovaciones" está
desactualizada** (`estado-actual.md` F5.4, `ROADMAP.md`, `docs/especificaciones.md`
§7.2.2/§7.2.5, `docs/evaluacion-usabilidad.md`). Corregido en los documentos de
progreso; **`docs/especificaciones.md` sigue pendiente** (ver §Pendientes).

## 2. Catálogo por áreas académicas (Módulo B)

- **`lib/domain/areas.ts`** (nuevo): taxonomía de **5 áreas** (`AREA_LABELS`, valores
  estables que se guardan en `books.categoria`), mapa `CARRERA_AREA` de las 10
  carreras → área, y helpers `areaForCarrera` / `findAreaByLabel`.
  **Decisión de diseño registrada en el propio archivo:** el catálogo se organiza por
  **área/facultad, no por carrera** — un libro de Estadística sirve a varias carreras
  y etiquetarlo por carrera lo escondería del resto. La carrera solo **personaliza**.
- **`components/catalogo/AreaHub.tsx`** (nuevo): hub de tarjetas con conteo por área
  como entrada a `/catalogo`; al elegir un área se pasa al listado filtrado con
  migas de pan y "ver todo". El área de la carrera del estudiante se destaca.
- `lib/validations/books.ts`: `categoria` pasa de texto libre a **lista controlada**
  (select de áreas en el form del bibliotecario, `BookForm.tsx`).
- `lib/validations/auth.ts`: registro con las **10 carreras reales** (`Carrera`).
- Migración `20260712140000_catalog_areas.sql` (**aplicada al remoto**) + `seed.sql`:
  reclasifica los libros existentes a áreas y añade libros `[demo]` por área.

## 3. Rediseño visual (Módulo A)

- **Login**: dos columnas con panel de marca en escritorio; se quita el texto
  explicativo del código de acceso.
- **Inicio** (`8dc83cb`): deja de ser una página de accesos rápidos y pasa a ser un
  **tablero** — hero con degradado y fecha en español, chip de rol, tira de
  estadísticas **reales por rol** (estudiante: préstamos/favoritos/avisos ·
  bibliotecario: libros/usuarios/préstamos/multas), cada una enlazada a su sección, y
  destacado "Próxima devolución" con urgencia por color.
  Presentación extraída a `components/inicio/InicioUI.tsx` (la `page.tsx` solo obtiene
  datos vía `lib/services`, RLS acota) + `loading.tsx` con skeletons.
- **Shell** (`a6d02e3`): sidebar y drawer móvil en degradado azul→índigo con texto
  claro; fondo de contenido con wash sutil; topbar translúcida con `backdrop-blur`.
- **Perfil**: el avatar del topbar es ahora el botón de Perfil; se retira el ítem
  "Perfil" del sidebar en ambos roles (`nav.ts`).

## Verificación (ejecutada el 2026-07-22 sobre `7ae69fa`)

| Gate                           | Resultado                                   |
| ------------------------------ | ------------------------------------------- |
| `npm run typecheck`            | ✅ limpio                                   |
| `npm run lint`                 | ✅ sin warnings ni errores                  |
| `npx vitest run`               | ✅ **145/145** (18 archivos; +8 desde F6.2) |
| `npm run build`                | ✅ **28/28 páginas**                        |
| `npm audit --audit-level=high` | ❌ **2 high** — ver Pendiente 1             |

Tests nuevos que aportó este trabajo: `lib/domain/areas.test.ts` (46 líneas) y
ampliaciones en `lib/validations/books.test.ts` y `settings.test.ts`.

## ⚠️ Pendientes abiertos (detectados al auditar, NO corregidos aquí)

### Pendiente 1 — 🟠 CI en rojo: `sharp` con CVEs de libvips

`npm audit --audit-level=high` sale **en rojo** y con él **el gate `audit` de CI**:

- **`sharp` < 0.35.0** ([GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj):
  CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591), entra como
  **dependencia opcional de `next` 15.5.20** (`sharp@0.34.5`). Severidad **high**;
  arrastra a `next` como high por propagación.
- **No es culpa de los commits del 12-jul**: el advisory se publicó después del
  cierre de F6.2, cuando el gate estaba verde.
- **Subir Next NO lo arregla**: `next@15.5.21` (la última 15.x) sigue pidiendo
  `sharp: ^0.34.3`.
- **`npm audit fix --force` es inaceptable**: propone `next@9.3.3` — un downgrade de
  6 majors que destruiría el proyecto. **No ejecutarlo.**
- **Fix recomendado**: `overrides` en `package.json` fijando `sharp` a `^0.35.3`
  (última estable, fuera del rango vulnerable), y re-verificar `build` — sharp solo
  interviene en la optimización de imágenes, no en lógica de negocio.
- Las otras 3 (2 low + 1 moderate: `postcss` interno de next, `@supabase/auth-js`)
  siguen bajo el gate `high` y no bloquean.

### Pendiente 2 — 🟠 Regresión funcional: se perdió el reinicio del aviso de vencimiento

La migración `20260712120000_loan_two_day_policy.sql` re-declaró `renew_loan` con
`create or replace` **partiendo de la versión de F3.2, no de la de F4.2** — y con eso
perdió la línea que F4.2 había añadido:

```sql
vencimiento_notificado_en = null -- F4.2: permite avisar del nuevo plazo
```

**Consecuencia:** `syncOwnDueSoonNotifications` filtra por
`.is("vencimiento_notificado_en", null)` (`lib/services/notifications.ts:179`), así
que **un préstamo que ya recibió su aviso de "vencimiento próximo" no vuelve a
avisar tras ampliarse**. El usuario amplía, cree que le avisarán del nuevo plazo, y
no le avisa nadie. Con la política 2+1 el margen es de horas, así que el impacto es
mayor que antes.

**Fix recomendado:** nueva migración que re-declare `renew_loan` conservando el
`update` de esta versión (suma de 1 día) **más** `vencimiento_notificado_en = null`.
Aplicar al remoto y verificar con rollback. **No editar la migración ya aplicada.**

### Pendiente 3 — la evaluación IHC quedó desfasada del producto

`docs/evaluacion-usabilidad.md` (F6.1) evaluó pantallas que **ya no existen**: el
login previo al rediseño, el inicio como accesos rápidos, el catálogo sin hub de
áreas y el sidebar blanco. La evaluación heurística y el recorrido cognitivo hay que
re-pasarlos sobre la UI actual antes de recolectar el SUS real — medir usabilidad y
después cambiar las pantallas invalida la medición. Prioritario: **contraste AA del
texto claro sobre el degradado azul→índigo** del sidebar/hero, que nunca se midió.

### Pendiente 4 — `docs/especificaciones.md` sigue diciendo el plazo viejo

§7.2.2 y §7.2.5 describen la política de préstamo anterior. Es el documento de
requisitos del curso; conviene alinearlo con la política 2+1 realmente implementada.

## Notas para quien siga

- Las **2 migraciones del 12-jul ya están aplicadas al remoto** `bibliotec`; no
  re-aplicarlas. Cualquier corrección va en una migración nueva.
- `books.categoria` es ahora una **lista controlada** (`AREA_LABELS`): cualquier
  libro cargado con una categoría fuera de la lista queda huérfano del hub de áreas.
- El orden sensato de trabajo es: Pendiente 1 y 2 (bloquean CI / son bug real) →
  Pendiente 3 (re-evaluación heurística) → SUS real → Pendiente 4.
