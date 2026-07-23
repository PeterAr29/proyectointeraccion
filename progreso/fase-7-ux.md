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

## ⚠️ Pendientes detectados al auditar

> **Actualización 2026-07-22:** los pendientes 1 y 2 quedaron **resueltos** el mismo
> día (ver §Resolución al final). Los pendientes 3 y 4 siguen abiertos.

### Pendiente 1 — 🟠 `sharp` con CVEs de libvips ✅ RESUELTO

> **Corrección (2026-07-22):** este documento afirmaba primero que el fallo de
> `npm audit` **rompía CI**. Es **falso**: el paso `Dependency audit (warning only)`
> de `.github/workflows/ci.yml` tiene `continue-on-error: true`, así que nunca
> bloqueó. Lo que sí llevaba **CI en rojo desde el 12-jul** era el job **e2e**
> (ver Pendiente 5). El arreglo de `sharp` sigue valiendo —elimina 4 CVEs high
> reales— pero no era urgente por CI.

`npm audit --audit-level=high` salía en rojo (sin bloquear el pipeline):

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

### Pendiente 2 — 🟠 Regresión funcional: se perdió el reinicio del aviso de vencimiento ✅ RESUELTO

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

### Pendiente 3 — la evaluación IHC quedó desfasada del producto ✅ RESUELTO (T-021, 2026-07-23)

`docs/evaluacion-usabilidad.md` (F6.1) evaluó pantallas que **ya no existen**: el
login previo al rediseño, el inicio como accesos rápidos, el catálogo sin hub de
áreas y el sidebar blanco. La evaluación heurística y el recorrido cognitivo hay que
re-pasarlos sobre la UI actual antes de recolectar el SUS real — medir usabilidad y
después cambiar las pantallas invalida la medición. Prioritario: **contraste AA del
texto claro sobre el degradado azul→índigo** del sidebar/hero, que nunca se midió.

**Resuelto:** `docs/evaluacion-usabilidad.md` re-pasado sobre la UI actual (§2.1
login 2 columnas, §2.2 catálogo por áreas, §2.3 circulación 2+1, §2.8 Inicio-tablero
nuevo, §2.7 transversal), recorrido cognitivo actualizado (§3.1 hub, §3.2 ampliación
2+1) y **§8** con el resumen de la re-evaluación. El **contraste AA se midió por
primera vez** (peor caso `#1D4ED8`): 4 textos con opacidad `/70`–`/75` estaban en
4.10–4.48:1 (bajo AA 4.5:1); **corregidos a `/85` → 5.30:1** (commit `abbc94f`,
T-021). Quedan abiertos, sev ≤ 2: **R2** (badge de urgencia oculto en móvil),
**R3** (nombre "Renovar"/"Ampliar" mixto), **R4** (login sin aclaración de rol) — no
bloquean el SUS. **T-022 (SUS real) desbloqueado.**

### Pendiente 5 — 🟠 CI en rojo desde el 12-jul: el e2e del catálogo ✅ RESUELTO

**Este era el rojo de verdad.** Detectado al hacer push el 2026-07-22: el run de CI
del commit `7ae69fa` (12-jul, catálogo por áreas) **falló y nadie lo miró**; desde
entonces `main` arrastraba el job **e2e** en rojo. Los runs "success" del 13 y el
20-jul son de Dependabot sobre otras ramas, no de `main`.

Fallaban 2 de 9 specs de `tests/e2e/catalog.spec.ts`, ambas por el rediseño:

| Spec                                    | Por qué falla                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `el catálogo lista los libros del seed` | `/catalogo` sin filtros ahora muestra el **hub de áreas**, no el listado de libros       |
| `búsqueda sin coincidencias`            | el enlace del estado vacío pasó de **"Ver todo el catálogo"** a **"Volver a las áreas"** |

La UI se comporta **como fue diseñada**; los tests eran los obsoletos. Actualizados:
la primera spec se divide en "abre en el hub de áreas" + "«ver todo» lista los libros
del seed" (`?ver=todo`), y la tercera busca el enlace nuevo. El locator del hub usa
`.first()` porque el área de la carrera se pinta destacada **y** en la grilla.

Al arreglarlos apareció un tercer desajuste: la spec del listado afirmaba un título
concreto ("Sistemas Operativos Modernos"), pero con los libros `[demo]` que añadió el
seed del 12-jul el catálogo pasó a 15 libros **paginados** y ese título ya no cae en
la primera página. Ahora comprueba que hay listado (conteo + tarjetas), no un libro
concreto.

**Verificado en local contra el build de producción** (`CI=1`, como en el workflow):
**9/10 pasan y 1 queda _flaky_** — "marcar y quitar un favorito" falla a veces en el
primer intento y pasa al reintento (carrera entre el Server Action y el toast; ya
existía). Datos del remoto intactos tras la corrida (3 favoritos, como antes).

**Lección:** el rediseño del 12-jul no tocó los e2e y nadie revisó el run. Un cambio
de entrada de una vista rompe sus specs aunque los unit sigan verdes; y afirmar un
dato concreto del seed en un e2e lo vuelve frágil en cuanto crecen los datos.

### Pendiente 4 — `docs/especificaciones.md` sigue diciendo el plazo viejo

§7.2.2 y §7.2.5 describen la política de préstamo anterior. Es el documento de
requisitos del curso; conviene alinearlo con la política 2+1 realmente implementada.

## Resolución de los pendientes 1 y 2 (2026-07-22)

### El proyecto Supabase estaba pausado

Al ir a aplicar la corrección se descubrió que el proyecto `bibliotec` estaba en
estado **`INACTIVE`**: Supabase lo pausó tras 10 días sin actividad (última: 12-jul).
**Producción estaba caída de facto** — `/login` seguía devolviendo HTTP 200 porque
Next lo sirve prerenderizado, pero cualquier llamada a Supabase Auth moría por
timeout. La caída no se ve desde fuera, que es lo que la hace peligrosa.

Restaurado a **`ACTIVE_HEALTHY`** con los datos íntegros: 7 perfiles, 7 usuarios de
auth, 15 libros, 11 préstamos, 1 reserva, 3 favoritos. La restauración pasa por
`COMING_UP` → `RESTORING` → `ACTIVE_HEALTHY`; **durante `COMING_UP` la BD acepta
conexiones pero `public` está vacío**, así que no se debe aplicar DDL hasta ver
`ACTIVE_HEALTHY` (se esperó a propósito).

> ⚠️ **Volverá a pausarse** tras ~7 días sin uso. Comprobar el estado antes de cada
> sesión del estudio SUS, o los participantes se encontrarán un login que no entra.

### Pendiente 1 — `overrides` a `sharp 0.35.3` (commit `76e1793`)

Antes de aplicarlo se comprobó que **el proyecto no importa `next/image` en ningún
archivo** ni configura `images` en `next.config.ts` → sharp nunca se ejecuta y el
override no puede romper nada. Versión pinneada, como el resto de dependencias.

Resultado: `npm audit --audit-level=high` en **exit 0** (quedan 2 low + 2 moderate,
bajo el gate), `sharp@0.35.3 overridden`, **145/145 unit**, build **28/28**.

### Pendiente 2 — migración `20260722160000_renew_loan_restore_due_soon_marker.sql`

Regresión **confirmada viva en el remoto** antes de tocar nada
(`reinicia_marcador: false`, `suma_un_dia: true`). La migración re-declara
`renew_loan` conservando íntegra la política 2+1 y devolviendo el reinicio del
marcador. Aplicada al remoto y **verificada con rollback** actuando como el dueño del
préstamo (`set local request.jwt.claims`, RLS real):

| Comprobación                     | Resultado                             |
| -------------------------------- | ------------------------------------- |
| Marcador reiniciado tras ampliar | ✅ `vencimiento_notificado_en null`   |
| Días sumados al plazo            | ✅ **1.000** exacto                   |
| `renovaciones`                   | ✅ 0 → 1                              |
| Segunda ampliación bloqueada     | ✅ **BT101**                          |
| Ampliar préstamo ajeno bloqueado | ✅ **BT100**                          |
| Datos tras el rollback           | ✅ intactos (11 préstamos, 15 libros) |

## Notas para quien siga

- Las **2 migraciones del 12-jul ya están aplicadas al remoto** `bibliotec`; no
  re-aplicarlas. Cualquier corrección va en una migración nueva.
- **Lección de la regresión:** `create or replace function` re-declara la función
  entera. Antes de re-declarar una RPC hay que partir de la **última** versión
  aplicada, no de la que aparezca primero al buscar. Conviene comprobar con
  `pg_get_functiondef` que la definición final conserva todo lo acumulado.
- `books.categoria` es ahora una **lista controlada** (`AREA_LABELS`): cualquier
  libro cargado con una categoría fuera de la lista queda huérfano del hub de áreas.
- Orden restante: ~~Pendiente 3 (re-evaluación heurística)~~ ✅ → **SUS real (T-022)**
  → Pendiente 4 (alinear especificaciones, T-023). Backlog UX menor: R2/R3/R4.
