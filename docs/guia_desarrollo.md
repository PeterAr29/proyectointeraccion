# Guía de Desarrollo Incremental — BiblioTEC

## Cómo usar esta guía

Desarrolla el sistema de forma incremental, **una subfase por sesión de Claude Code**, en modo equipo (2-3 devs).

**Reglas de oro:**
- Una subfase = una sesión de Claude Code.
- No saltar fases ni subfases (orden estricto respetando dependencias entre módulos).
- Commit + handoff doc al final de cada subfase.
- Validar la Definition of Done antes de avanzar.
- **Reclamar antes de codificar:** marca el módulo/tarea *En progreso* en el GitHub Project y en `progreso/tablero-equipo.md`.

**Al arrancar cada sesión, leer en este orden:**
1. `CLAUDE.md`
2. `progreso/estado-actual.md`
3. El handoff doc más reciente de tu módulo: `progreso/fase-{n}.{m}-{modulo}.md`
4. La sección de la subfase que toca en esta guía

**Etiquetas:** cada subfase lleva su módulo `[A]`…`[E]` y sus dependencias. **F1 es compartida y secuencial**, la ejecuta un solo dev (el integrador). Solo tras F1 se abren los módulos B–E para reclamar. Cada fase cierra con un **hito de integración sin mocks**.

## Mapa General de Fases y Subfases

| Fase | Módulo | Subfases | Paralelizable | Dependencia |
|------|--------|----------|---------------|-------------|
| F1 Fundación & Acceso | [A] | F1.1, F1.2, F1.3, F1.4 | No (secuencial, integrador) | Ninguna |
| F2 Catálogo | [B] | F2.1, F2.2 | Sí (tras F1) | A |
| F3 Circulación | [C] | F3.1, F3.2, F3.3 | Parcial (interfaz de B) | A, B |
| F4 Multas & Notificaciones | [D] | F4.1, F4.2 | Parcial | A, C |
| F5 Administración | [E] | F5.1, F5.2, F5.3, F5.4 | Sí entre sí (subfases) | A, B, C, D |
| F6 Evaluación IHC & Producción | — | F6.1, F6.2 | No (integración final) | Todas |

**Sugerencia de paralelización (equipo full-time):** un dev ejecuta toda la F1. Al terminar, dos devs abren F2 [B] y preparan la interfaz de services de F3 [C] contra mocks; luego convergen. F5 [E] se abre cuando B/C/D exponen sus services; sus 4 subfases son bastante independientes entre sí.

---

## FASE 1: Fundación & Acceso [A]

**Subfases:** 4 · **A cargo de:** dev integrador · **Dependencia previa:** ninguna

### 🎯 Objetivo de la fase
Dejar el repo arrancable, la base de datos con RLS y seed, el sistema de diseño reutilizable y el acceso (auth + shell de app) funcionando. Tras esta fase, cualquier dev puede reclamar un módulo B–E.

### 📂 Estructura que introduce esta fase
**Carpetas nuevas:** `app/`, `components/ui/`, `components/layout/`, `components/feedback/`, `lib/supabase/`, `lib/services/`, `lib/validations/`, `lib/utils/`, `supabase/migrations/`, `tests/`, `.husky/`
**Archivos que modifica:** `.env.example`, `package.json`, `.github/workflows/ci.yml`

### 🏁 Hito de integración de la fase
Un usuario del seed inicia sesión, ve el shell (sidebar + topbar responsive) y su perfil; un no autenticado es redirigido a login. `/kitchen-sink` muestra todos los componentes de diseño.

---

### SUBFASE 1.1: Setup & tooling
**Sesión Claude Code:** 1 · **Capa/módulo:** [A] infraestructura

#### 🎯 Objetivo
Proyecto Next.js 15 + TS strict + Tailwind + shadcn que arranca en `localhost:3000`, con pre-commit hooks, CI y frameworks de test configurados.

#### 📂 Contexto que cargar
- `CLAUDE.md`, `docs/especificaciones.md` (§8), `progreso/estado-actual.md`

#### 📄 Archivos esperados
- `package.json`, `tsconfig.json` (strict), `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`
- `.husky/pre-commit`, `.pre-commit-config.yaml` (o husky+lint-staged), `.eslintrc`, `.prettierrc`
- `vitest.config.ts`, `playwright.config.ts`, `tests/smoke.test.ts`
- `.github/workflows/ci.yml` (ajustado), `.github/dependabot.yml`

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y docs/especificaciones.md §8. Estamos en F1.1 (módulo A, integrador).
Crea el proyecto BiblioTEC con Next.js 15 (App Router), TypeScript strict (sin any),
Tailwind CSS y shadcn/ui inicializado. Configura:
- ESLint + Prettier
- Husky + lint-staged con gitleaks para escanear secretos en pre-commit
- Vitest (unit) con un tests/smoke.test.ts que pase, y Playwright inicializado
- .github/workflows/ci.yml: install, lint, typecheck, test, npm audit --audit-level=high
- Dependabot semanal
Aplica los design tokens de CLAUDE.md §Sistema de diseño (colores, Inter, radio 8px).
Deja una landing mínima en app/page.tsx en español (sin lorem ipsum).
No crees carpetas de fases futuras (nada de app/(app) todavía).
Al terminar: verifica npm run dev, npm run lint, npm run test; commit y handoff F1.1→F1.2.
```

#### 🧪 Cómo probar
- `npm run dev` → carga en `localhost:3000`. `npm run lint` y `npm run test` en verde. `git commit` dispara los hooks.

#### ✅ Definition of Done
- [ ] Arranca en localhost:3000 · [ ] lint/typecheck/test verdes · [ ] pre-commit hooks activos · [ ] CI configurado · [ ] `npm audit` limpio · [ ] commit Conventional · [ ] `estado-actual.md` actualizado · [ ] `progreso/fase-1.1-A.md` creado

#### ⛔ Lo que NO hacer
- No configurar Supabase todavía (es F1.2). No crear componentes de dominio ni rutas de app.

#### 🔜 Handoff a F1.2
Anota versiones instaladas, decisiones de config (husky vs pre-commit), y que la BD aún no existe.

---

### SUBFASE 1.2: Base de datos, RLS y seed
**Sesión Claude Code:** 2 · **Capa/módulo:** [A] datos

#### 🎯 Objetivo
Migraciones de todas las tablas del modelo de datos con RLS activo y políticas por rol, más `seed.sql` con los datos del contexto.

#### 📂 Contexto que cargar
- `CLAUDE.md`, `docs/especificaciones.md` (§7), `progreso/fase-1.1-A.md`

#### 📄 Archivos esperados
- `supabase/migrations/{ts}_init_schema.sql`, `{ts}_rls_policies.sql`
- `supabase/seed.sql`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`
- `.env.example` (variables de Supabase)

#### 💬 Prompt sugerido
```
Lee CLAUDE.md, docs/especificaciones.md §7 y progreso/fase-1.1-A.md. Estamos en F1.2 (módulo A).
Crea el esquema de BiblioTEC en supabase/migrations: profiles, books, loans, reservations,
fines, notifications, favorites, settings, con los tipos y enums del §7.2. IDs con UUID.
Activa RLS en TODAS las tablas y escribe políticas: el estudiante solo accede a sus propias
filas (loans, reservations, fines, notifications, favorites); books es lectura pública para
autenticados; profiles legibles/editables solo por su dueño; el bibliotecario tiene acceso
ampliado. settings solo lo edita bibliotecario.
Crea supabase/seed.sql con exactamente los libros y usuarios del CLAUDE.md §Datos semilla.
Crea lib/supabase/{client,server,middleware}.ts (helpers SSR de Supabase).
Actualiza .env.example con NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY (dummy). Documenta cómo correr supabase db reset.
No desactives RLS para probar. Commit y handoff F1.2→F1.3.
```

#### 🧪 Cómo probar
- `npx supabase db reset` aplica migraciones + seed sin errores. Una query como estudiante solo devuelve sus filas.

#### ✅ Definition of Done
- [ ] Todas las tablas con RLS · [ ] políticas por rol probadas · [ ] seed exacto del contexto · [ ] helpers de Supabase · [ ] `.env.example` actualizado · [ ] commit · [ ] handoff `fase-1.2-A.md`

#### ⛔ Lo que NO hacer
- No construir UI ni services de dominio aún. No editar migraciones una vez aplicadas (crear una nueva).

#### 🔜 Handoff a F1.3
Documenta el esquema final, nombres exactos de tablas/columnas y cualquier política no trivial.

---

### SUBFASE 1.3: Sistema de diseño (kitchen-sink)
**Sesión Claude Code:** 3 · **Capa/módulo:** [A] UI base

#### 🎯 Objetivo
Componentes reutilizables del sistema de diseño y los diálogos globales, mostrados en `/kitchen-sink`.

#### 📂 Contexto que cargar
- `CLAUDE.md` (§Sistema de diseño), `design/` (prototipo), `progreso/fase-1.2-A.md`

#### 📄 Archivos esperados
- `components/biblioteca/StatusBadge.tsx`, `BookCover.tsx`
- `components/feedback/Modal.tsx`, `Toast.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Skeleton.tsx`, `Dialog*.tsx` (globales)
- `lib/utils/cn.ts`, `lib/utils/dates.ts`, `lib/utils/currency.ts`, `app/kitchen-sink/page.tsx`

#### 💬 Prompt sugerido
```
Lee CLAUDE.md §Sistema de diseño, mira el prototipo en design/ y progreso/fase-1.2-A.md.
Estamos en F1.3 (módulo A). Crea los componentes de diseño reutilizables siguiendo los
tokens y metáforas del prototipo (badges pill, semáforo de estados 🟢🟡🔴, radio 8px, Inter):
- StatusBadge (variantes: libro Disponible/Reservado/Prestado; préstamo Activo/Vencido/Devuelto)
- BookCover, Modal, Toast, EmptyState, ErrorState, Skeleton
- Diálogos globales reutilizables: Éxito, Advertencia, Error, Confirmación, Sesión expirada,
  Sin conexión, Acceso denegado, Campos incompletos, Fecha inválida
- utils: cn, dates (formato DD/MM/AAAA), currency (S/)
Monta app/kitchen-sink/page.tsx mostrando todos los componentes y estados.
Accesibilidad AA: foco visible, contraste, roles ARIA en diálogos.
Archivos <300 líneas. Escribe tests unit de dates y currency. Commit y handoff F1.3→F1.4.
```

#### 🧪 Cómo probar
- `/kitchen-sink` muestra cada componente en sus variantes. Tests de `dates`/`currency` pasan.

#### ✅ Definition of Done
- [ ] Todos los componentes + diálogos globales · [ ] `/kitchen-sink` completo · [ ] AA · [ ] tests de utils · [ ] commit · [ ] handoff `fase-1.3-A.md`

#### ⛔ Lo que NO hacer
- No conectar a datos reales; los componentes reciben props. No crear páginas de dominio.

#### 🔜 Handoff a F1.4
Lista los nombres y props de cada componente (será el catálogo que B–E reutilizan).

---

### SUBFASE 1.4: Acceso + shell + perfil
**Sesión Claude Code:** 4 · **Capa/módulo:** [A] auth + layout

#### 🎯 Objetivo
Login, registro y recuperación funcionando contra Supabase Auth; middleware de sesión; shell de app (sidebar/topbar/campana responsive); rutas protegidas; perfil del estudiante (acceso + rectificación).

#### 📂 Contexto que cargar
- `CLAUDE.md`, `design/` (pantallas de auth), `progreso/fase-1.3-A.md`

#### 📄 Archivos esperados
- `app/(auth)/login/page.tsx`, `registro/page.tsx`, `recuperar/page.tsx`
- `app/(app)/layout.tsx`, `inicio/page.tsx`, `perfil/page.tsx`
- `components/layout/Sidebar.tsx`, `Topbar.tsx`, `MobileNav.tsx`
- `lib/services/users.ts`, `lib/validations/auth.ts`, `middleware.ts`

#### 💬 Prompt sugerido
```
Lee CLAUDE.md, mira las pantallas de auth en design/ y progreso/fase-1.3-A.md.
Estamos en F1.4 (módulo A, última de la fundación). Implementa el acceso con Supabase Auth:
- Login (código universitario + contraseña), registro (código, nombre, carrera, correo,
  teléfono), recuperar contraseña. Validación con Zod en cliente Y servidor (lib/validations/auth).
- Errores en lenguaje humano usando los diálogos globales de F1.3. Rate limiting básico en login.
- middleware.ts protege (app) y (admin); redirige a login si no hay sesión.
- Shell: Sidebar 240px (ítem activo con fondo #EFF6FF y borde azul), Topbar con campana,
  MobileNav (<768px colapsa a hamburguesa). Server Components por defecto.
- lib/services/users.ts como única puerta a profiles. Perfil: ver y editar datos (derechos
  de acceso y rectificación, Ley 29733).
Los 4 estados donde cargue datos. No loggear PII. Commit y handoff F1.4 → cierre de fase (hito).
```

#### 🧪 Cómo probar
- Login con usuario del seed entra al shell; logout invalida sesión; ruta protegida sin sesión redirige. Perfil edita y persiste. Playwright e2e de login.

#### ✅ Definition of Done
- [ ] Login/registro/recuperar · [ ] middleware protege rutas · [ ] shell responsive · [ ] perfil (ver/editar) · [ ] Zod cliente+servidor · [ ] e2e login · [ ] commit · [ ] handoff + **hito de integración F1 verificado** · [ ] tag `v0.1.0`

#### ⛔ Lo que NO hacer
- No implementar catálogo ni préstamos. No poner autorización solo en la UI (usa RLS + revalidación en server).

#### 🔜 Handoff a Fase 2
Documenta la interfaz de `users.ts`, cómo obtener la sesión/rol en server, y confirma que el catálogo de módulos B–E queda **abierto para reclamar**.

---

## FASE 2: Catálogo [B]

**Subfases:** 2 · **Depende de:** A · **Paralelizable:** sí (tras F1)

### 🎯 Objetivo de la fase
Listado, búsqueda, filtros, paginación, detalle de libro y favoritos.

### 📂 Estructura que introduce
`app/(app)/catalogo/`, `app/(app)/catalogo/[id]/`, `app/(app)/favoritos/`, `components/biblioteca/BookCard.tsx`, `lib/services/books.ts`, `lib/validations/catalog.ts`

### 🏁 Hito de integración
Un estudiante busca y filtra libros reales del seed, abre un detalle y marca un favorito que persiste; la disponibilidad refleja `cantidad_disponible`.

---

### SUBFASE 2.1: Listado, búsqueda y filtros
**Sesión Claude Code:** 1 (del módulo B) · **Capa/módulo:** [B]

#### 🎯 Objetivo
`/catalogo` con listado paginado, búsqueda por título/autor/ISBN y filtros por categoría/disponibilidad/ubicación, con los 4 estados.

#### 📂 Contexto que cargar
- `CLAUDE.md`, `progreso/fase-1.4-A.md`, `lib/supabase/*`, componentes de F1.3

#### 📄 Archivos esperados
- `app/(app)/catalogo/page.tsx`, `components/biblioteca/BookCard.tsx`, `lib/services/books.ts`, `lib/validations/catalog.ts`

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y progreso/fase-1.4-A.md. Reclamé el módulo B en el tablero. Estamos en F2.1.
Implementa /catalogo: Server Component que consume lib/services/books.ts (única puerta a la
tabla books). Listado en grid con BookCard (portada, título, autor, StatusBadge de
disponibilidad), paginación, búsqueda por título/autor/ISBN y filtros por categoría,
disponibilidad y ubicación (query params). Los 4 estados: skeleton al cargar, EmptyState
"sin resultados", ErrorState, y con datos. Búsqueda parametrizada (nunca concatenar en SQL).
Valida los filtros con Zod (lib/validations/catalog). Archivos <300 líneas. Textos en español.
Escribe tests de la lógica de búsqueda/filtrado en books.ts. Commit feat(B) y handoff F2.1→F2.2.
```

#### 🧪 Cómo probar
- Buscar "Tanenbaum" filtra; categoría vacía muestra EmptyState; paginación funciona. Tests de `books.ts` pasan.

#### ✅ Definition of Done
- [ ] Listado + búsqueda + filtros + paginación · [ ] 4 estados · [ ] `books.ts` como única puerta · [ ] Zod · [ ] tests · [ ] commit · [ ] handoff `fase-2.1-B.md`

#### ⛔ Lo que NO hacer
- No implementar el detalle ni favoritos (es F2.2). No prestar/reservar (es módulo C).

#### 🔜 Handoff a F2.2
Documenta la firma de `books.ts` (list/search/getById) — será la frontera que consume el módulo C.

---

### SUBFASE 2.2: Detalle de libro + favoritos
**Sesión Claude Code:** 2 (del módulo B) · **Capa/módulo:** [B]

#### 🎯 Objetivo
`/catalogo/[id]` con detalle completo y favoritos (`/favoritos`).

#### 📂 Contexto que cargar
- `CLAUDE.md`, `progreso/fase-2.1-B.md`, `lib/services/books.ts`

#### 📄 Archivos esperados
- `app/(app)/catalogo/[id]/page.tsx`, `app/(app)/favoritos/page.tsx`, extensión de `lib/services/books.ts` (favoritos)

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y progreso/fase-2.1-B.md. Estamos en F2.2 (módulo B).
Implementa /catalogo/[id]: detalle del libro (portada, metadatos, descripción, ubicación,
disponibilidad con StatusBadge) usando books.getById. Botón "Reservar/Prestar" que por ahora
solo enruta o queda deshabilitado con tooltip (el flujo transaccional es del módulo C).
Añade favoritos: toggle en el detalle y página /favoritos que lista los favoritos del usuario
(tabla favorites, respetando RLS). Estados: si un id no existe, ErrorState "libro no encontrado".
/favoritos vacío muestra EmptyState. Extiende lib/services/books.ts con addFavorite/removeFavorite/
listFavorites. Tests de la lógica de favoritos. Commit feat(B) y handoff F2.2 → hito de fase.
```

#### 🧪 Cómo probar
- Abrir un id válido muestra detalle; id inválido → ErrorState. Marcar favorito aparece en `/favoritos` y persiste.

#### ✅ Definition of Done
- [ ] Detalle completo · [ ] favoritos (toggle + página) · [ ] 4 estados · [ ] RLS respetado · [ ] tests · [ ] commit · [ ] handoff + **hito F2 verificado**

#### ⛔ Lo que NO hacer
- No implementar la transacción de préstamo/reserva (módulo C).

#### 🔜 Handoff a Fase 3
Confirma que `books.ts` expone lo que C necesita (getById, decremento de disponibilidad se hará en C).

---

## FASE 3: Circulación [C]

**Subfases:** 3 · **Depende de:** A, B · **Paralelizable:** parcial (puede arrancar contra la interfaz de `books.ts` con mock)

### 🎯 Objetivo de la fase
Préstamos, reservas, renovaciones, devoluciones, "mis préstamos" e historial.

### 📂 Estructura que introduce
`app/(app)/mis-prestamos/`, `app/(app)/historial/`, `lib/services/loans.ts`, `lib/services/reservations.ts`, `lib/validations/circulation.ts`, `components/biblioteca/LoanTable.tsx`

### 🏁 Hito de integración
Un estudiante presta un libro disponible (baja el stock), intenta prestar uno sin stock (se le ofrece reservar), renueva y devuelve, y ve todo en "mis préstamos" e historial — con datos reales, sin mocks.

---

### SUBFASE 3.1: Reservas y préstamos
**Sesión Claude Code:** 1 (módulo C) · **Capa/módulo:** [C]

#### 🎯 Objetivo
Flujo transaccional: prestar si hay stock, reservar si no; validación de fecha; decremento seguro de disponibilidad.

#### 📂 Contexto que cargar
- `CLAUDE.md`, `docs/especificaciones.md` (§7.2 reglas de negocio), `progreso/fase-2.2-B.md`

#### 📄 Archivos esperados
- `lib/services/loans.ts`, `lib/services/reservations.ts`, `lib/validations/circulation.ts`, modales de préstamo/reserva en `app/(app)/catalogo/[id]/`

#### 💬 Prompt sugerido
```
Lee CLAUDE.md, docs/especificaciones.md §7.2 y progreso/fase-2.2-B.md. Reclamé el módulo C.
Estamos en F3.1. Implementa el flujo transaccional en lib/services/loans.ts y reservations.ts
(única puerta a esas tablas), con la lógica de negocio en el service, no en la UI:
- Prestar: solo si cantidad_disponible > 0; calcula fecha_devolucion_estimada = hoy + dias_prestamo
  (leer settings); decrementa disponibilidad de forma atómica (transacción/rpc para evitar
  doble préstamo). Si no hay stock, ofrece reservar.
- Reservar: crea reservation 'activa' con fecha estimada.
- Validaciones Zod (circulation): fecha no anterior a hoy.
- Server Action con revalidación de rol/sesión (no confíes en la UI).
- Modales de confirmación (diálogos globales) desde el detalle del libro.
Tests unit: préstamo con/sin stock, cálculo de fecha, no permitir doble préstamo. Confirmación
obligatoria antes de la acción. Commit feat(C) y handoff F3.1→F3.2.
```

#### 🧪 Cómo probar
- Prestar baja `cantidad_disponible`; sin stock ofrece reservar; fecha pasada rechazada. Tests de concurrencia/stock pasan.

#### ✅ Definition of Done
- [ ] Préstamo y reserva transaccionales · [ ] lógica en services · [ ] Zod · [ ] Server Action revalida rol · [ ] confirmaciones · [ ] tests · [ ] commit · [ ] handoff `fase-3.1-C.md`

#### ⛔ Lo que NO hacer
- No calcular multas todavía (módulo D). No construir la tabla "mis préstamos" (F3.2).

#### 🔜 Handoff a F3.2
Documenta firmas de `loans.ts`/`reservations.ts` y el mecanismo de decremento atómico.

---

### SUBFASE 3.2: Mis préstamos (renovar/devolver/vencidos)
**Sesión Claude Code:** 2 (módulo C) · **Capa/módulo:** [C]

#### 🎯 Objetivo
`/mis-prestamos`: tabla de préstamos activos con renovar, devolver y aviso de vencidos.

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y progreso/fase-3.1-C.md. Estamos en F3.2 (módulo C).
Implementa /mis-prestamos con LoanTable (responsive, scroll horizontal <768px): préstamos del
usuario con StatusBadge (Activo/Vencido/Devuelto), fecha de devolución y acciones:
- Renovar: máximo max_renovaciones veces; nunca si está vencido con multa pendiente (leer regla
  del §7.2). Recalcula fecha. 
- Devolver: marca fecha_devolucion_real, repone cantidad_disponible; confirmación obligatoria.
- Marca 'vencido' cuando fecha_devolucion_estimada < hoy sin devolución.
Los 4 estados; EmptyState "no tienes préstamos activos". Toda la lógica en loans.ts.
Tests: renovar dentro/fuera de límite, devolver repone stock. Commit feat(C) y handoff F3.2→F3.3.
```

#### 🧪 Cómo probar
- Renovar incrementa `renovaciones`; al llegar al máximo se bloquea; devolver repone stock y pasa a Devuelto.

#### ✅ Definition of Done
- [ ] Tabla + renovar + devolver + vencidos · [ ] reglas del §7.2 · [ ] 4 estados · [ ] tests · [ ] commit · [ ] handoff `fase-3.2-C.md`

#### ⛔ Lo que NO hacer
- No calcular el monto de multa (solo marca vencido). El monto es de F4.1.

#### 🔜 Handoff a F3.3
Anota qué necesita D: préstamos vencidos y sus `dias_retraso` para calcular multa.

---

### SUBFASE 3.3: Historial
**Sesión Claude Code:** 3 (módulo C) · **Capa/módulo:** [C]

#### 🎯 Objetivo
`/historial`: todos los préstamos del usuario (activos, devueltos, vencidos) con filtro por estado/fecha.

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y progreso/fase-3.2-C.md. Estamos en F3.3 (módulo C, última de circulación).
Implementa /historial: lista paginada del historial completo de préstamos del usuario con
filtro por estado y rango de fechas (fechas mostradas DD/MM/AAAA). Reusa LoanTable y los
estados. Solo lectura, vía loans.ts (RLS garantiza que solo ve lo suyo). Tests de filtrado.
Commit feat(C) y handoff F3.3 → hito de integración de la fase.
```

#### ✅ Definition of Done
- [ ] Historial con filtros · [ ] 4 estados · [ ] RLS · [ ] tests · [ ] commit · [ ] handoff + **hito F3 verificado**

#### ⛔ Lo que NO hacer
- No mezclar lógica de admin. No exponer historial de otros usuarios.

#### 🔜 Handoff a Fase 4
Confirma los datos que D consumirá (préstamos vencidos, notificaciones pendientes).

---

## FASE 4: Multas & Notificaciones [D]

**Subfases:** 2 · **Depende de:** A, C

### 🎯 Objetivo de la fase
Cálculo de multas y motor de notificaciones (reserva disponible, vencimiento, multa) con su vista.

### 📂 Estructura que introduce
`app/(app)/notificaciones/`, `lib/services/fines.ts`, `lib/services/notifications.ts`

### 🏁 Hito de integración
Un préstamo vencido genera la multa correcta y una notificación; una reserva que pasa a disponible notifica al usuario; el usuario ve y marca leídas sus notificaciones.

---

### SUBFASE 4.1: Cálculo de multas
**Sesión Claude Code:** 1 (módulo D) · **Capa/módulo:** [D]

#### 💬 Prompt sugerido
```
Lee CLAUDE.md, docs/especificaciones.md §7.2 y progreso/fase-3.3-C.md. Reclamé el módulo D.
Estamos en F4.1. Implementa lib/services/fines.ts (única puerta a fines):
- Al detectar/registrar un préstamo vencido, calcula monto = dias_retraso × multa_diaria
  (leer settings.multa_diaria, moneda S/). Crea/actualiza la fine en estado 'pendiente'.
- Marcar fine como 'pagada' (operación que en el estudiante es solo lectura; el pago lo
  registra el bibliotecario en el módulo E — deja la función lista).
- Regla ligada a C: no permitir renovar con multa pendiente (exponer un checker que loans.ts
  ya consume). 
Tests exhaustivos del cálculo (0 días, varios días, redondeo a 2 decimales). Sin loggear PII.
Commit feat(D) y handoff F4.1→F4.2.
```

#### ✅ Definition of Done
- [ ] Cálculo correcto y probado · [ ] estados pendiente/pagada · [ ] checker de multa pendiente para C · [ ] tests · [ ] commit · [ ] handoff `fase-4.1-D.md`

#### ⛔ Lo que NO hacer
- No construir la UI de notificaciones (F4.2). No registrar pagos (eso es UI de admin, F5.3).

---

### SUBFASE 4.2: Motor de notificaciones + vista
**Sesión Claude Code:** 2 (módulo D) · **Capa/módulo:** [D]

#### 💬 Prompt sugerido
```
Lee CLAUDE.md y progreso/fase-4.1-D.md. Estamos en F4.2 (módulo D).
Implementa lib/services/notifications.ts y /notificaciones:
- Genera notificaciones para: reserva que pasa a disponible (engancha con reservations),
  vencimiento próximo, y multa generada (engancha con fines).
- /notificaciones: lista del usuario con no-leídas destacadas, marcar como leída, y wiring del
  contador en la campana del Topbar (módulo A). Realtime opcional con Supabase.
- Los 4 estados; EmptyState "sin notificaciones". RLS: solo las propias.
Tests de generación y de marcar-leída. Commit feat(D) y handoff F4.2 → hito de fase.
```

#### ✅ Definition of Done
- [ ] Generación de los 3 tipos · [ ] vista + campana · [ ] 4 estados · [ ] RLS · [ ] tests · [ ] commit · [ ] handoff + **hito F4 verificado**

#### ⛔ Lo que NO hacer
- No enviar emails reales (fuera del MVP salvo que se acuerde). No exponer notificaciones de otros.

#### 🔜 Handoff a Fase 5
Confirma qué services consume el admin: books, loans, reservations, fines, notifications, users.

---

## FASE 5: Administración [E]

**Subfases:** 4 (bastante independientes entre sí) · **Depende de:** A, B, C, D

### 🎯 Objetivo de la fase
Panel de administración completo: dashboard con KPIs, CRUD de libros/usuarios, gestión de préstamos/devoluciones con cálculo de multa, reportes y configuración.

### 📂 Estructura que introduce
`app/(admin)/dashboard/`, `libros/`, `usuarios/`, `prestamos/`, `devoluciones/`, `multas/`, `reportes/`, `configuracion/`

### 🏁 Hito de integración
El bibliotecario ve KPIs reales, crea/edita un libro, registra una devolución con retraso que genera la multa correcta, y ajusta la configuración que afecta a los préstamos nuevos.

---

### SUBFASE 5.1: Dashboard con KPIs
```
Lee CLAUDE.md y el handoff de F4.2-D. Reclamé el módulo E. Estamos en F5.1.
Implementa /admin/dashboard (solo rol bibliotecario, protegido por middleware + RLS):
KPIs (total de libros, usuarios registrados, préstamos activos, multas pendientes) y tabla de
préstamos recientes. Consume los services existentes (no accede a tablas directamente). Skeleton
y ErrorState. Tests de la agregación de KPIs. Commit feat(E) y handoff F5.1→F5.2.
```
**DoD:** KPIs reales · acceso solo admin · consume services · tests · commit · handoff `fase-5.1-E.md`.
**No hacer:** CRUD todavía (F5.2).

### SUBFASE 5.2: CRUD de libros y usuarios
```
Lee CLAUDE.md y progreso/fase-5.1-E.md. Estamos en F5.2 (módulo E).
Implementa /admin/libros y /admin/usuarios: listar, crear, editar y desactivar (no borrar en
duro a usuarios con historial). Subida de portada a Supabase Storage. Formularios con Zod
(cliente+servidor). Confirmación en acciones destructivas. Cambio de rol/activación de usuarios.
Extiende users.ts/books.ts con las operaciones admin (revalidando rol en server). 4 estados.
Tests de las mutaciones. Commit feat(E) y handoff F5.2→F5.3.
```
**DoD:** CRUD libros+usuarios · Storage portadas · Zod · confirmaciones · tests · commit · handoff `fase-5.2-E.md`.
**No hacer:** gestión de devoluciones (F5.3).

### SUBFASE 5.3: Préstamos, devoluciones y multas
```
Lee CLAUDE.md y progreso/fase-5.2-E.md. Estamos en F5.3 (módulo E).
Implementa /admin/prestamos, /admin/devoluciones y /admin/multas: el bibliotecario registra
devoluciones (usa loans.ts, repone stock), el sistema calcula la multa con fines.ts si hay
retraso, y el bibliotecario marca multas como pagadas. Vista de préstamos activos/vencidos de
todos los usuarios (rol admin). Confirmaciones y 4 estados. Tests del cálculo integrado de
devolución con multa. Commit feat(E) y handoff F5.3→F5.4.
```
**DoD:** devolución+multa integradas · pago de multas · vista global · tests · commit · handoff `fase-5.3-E.md`.
**No hacer:** reportes/config (F5.4).

### SUBFASE 5.4: Reportes y configuración
```
Lee CLAUDE.md y progreso/fase-5.3-E.md. Estamos en F5.4 (módulo E, última).
Implementa /admin/reportes (préstamos por periodo, libros más prestados, multas — con export
CSV) y /admin/configuracion (editar settings: dias_prestamo, multa_diaria, max_renovaciones;
solo bibliotecario, valida con Zod). Los cambios afectan préstamos nuevos, no retroactivos.
4 estados. Tests de los reportes y de la edición de settings. Commit feat(E) y handoff F5.4 →
hito de integración de la fase.
```
**DoD:** reportes+export · edición de settings · tests · commit · handoff + **hito F5 verificado**.
**No hacer:** cambios retroactivos a préstamos existentes al editar settings.

---

## FASE 6: Evaluación IHC & Producción

**Subfases:** 2 · **Depende de:** todas · **Integración final**

### 🎯 Objetivo de la fase
Validar la usabilidad (entregable del curso) y endurecer para producción.

### 📂 Estructura que introduce
`docs/evaluacion-usabilidad.md`, `tests/e2e/*` (flujos críticos), configuración de headers de seguridad, política de privacidad.

---

### SUBFASE 6.1: Evaluación de usabilidad (Nielsen + SUS)
```
Lee CLAUDE.md y el estado-actual. Estamos en F6.1. Realiza la evaluación IHC y documéntala en
docs/evaluacion-usabilidad.md: (1) evaluación heurística de Nielsen pantalla por pantalla con
hallazgos y severidad, (2) recorrido cognitivo de los flujos críticos (buscar+prestar, renovar,
devolver, reservar), (3) plantilla y resultados del cuestionario SUS con el cálculo del puntaje
(objetivo ≥75). Corrige los hallazgos críticos de UX detectados. No cambies la lógica de negocio.
Commit docs(F6.1) y handoff F6.1→F6.2.
```
**DoD:** evaluación heurística + recorrido cognitivo + SUS documentados · hallazgos críticos corregidos · commit · handoff `fase-6.1.md`.

### SUBFASE 6.2: Endurecimiento y despliegue
```
Lee CLAUDE.md y progreso/fase-6.1.md. Estamos en F6.2 (última). Endurece y despliega:
- Headers de seguridad (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy),
  CORS al dominio de Vercel, cookies seguras.
- Playwright e2e de los flujos críticos en verde en CI.
- npm audit --audit-level=high sin vulnerabilidades. Revisión de que ninguna PII se loggea.
- Política de privacidad accesible (Ley 29733). Test de restore de backup documentado.
- Deploy a Vercel con variables de entorno de producción; verifica el flujo end-to-end.
Commit chore(F6.2), tag v1.0.0, y actualiza estado-actual + ROADMAP a 100%.
```
**DoD:** headers+CORS · e2e críticos verdes · audit limpio · política de privacidad · restore probado · deploy verificado · tag `v1.0.0`.

---

## CIERRE DE LA GUÍA

Al completar las 6 fases tendrás:
- Sistema BiblioTEC completo (estudiante + admin) en producción sobre Vercel + Supabase.
- Seguridad OWASP Top 10 aplicada con RLS como autorización real.
- Evaluación de usabilidad documentada (entregable del curso IHC) con SUS ≥ 75.
- Suite de tests (unit ≥60% en lógica + e2e de flujos críticos) y CI verde.

### Después del proyecto
- Añadir 2FA para admin (deuda técnica anotada).
- Notificaciones por email/push. Pagos de multas en línea.
- Internacionalización si se abre a otras sedes.
