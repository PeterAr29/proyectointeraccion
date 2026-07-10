# CLAUDE.md — BiblioTEC

> Contexto permanente del proyecto. Léelo completo al inicio de **cada** sesión, antes de escribir código.

---

## 1. Qué es este proyecto

**BiblioTEC** — Sistema web de gestión de biblioteca universitaria.

Permite administrar el catálogo de libros, préstamos, reservas, devoluciones, historial, multas y notificaciones mediante una interfaz intuitiva. Es un proyecto académico del curso de **Interacción Humano–Computador (IHC)**, por lo que la calidad de la experiencia de usuario y la aplicación de metáforas de interfaz **son parte del entregable**, no un extra.

**Problema que resuelve:** los sistemas bibliotecarios actuales tienen interfaces poco intuitivas, búsqueda difícil, procesos lentos de préstamo/reserva, ausencia de notificaciones de devolución y escaso control del historial.

**Objetivo:** una interfaz moderna, fácil de aprender, con curva de aprendizaje mínima, que cumpla las heurísticas de Nielsen y sea evaluable con SUS.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server Components por defecto; `"use client"` solo donde haya interactividad |
| Lenguaje | **TypeScript** (strict) | Prohibido `any`. Usa `unknown` + narrowing |
| Base de datos | **PostgreSQL** (vía Supabase) | Row Level Security **siempre activo** |
| Backend / Auth | **Supabase** | Auth, Postgres, Storage, Realtime |
| Estilos | **Tailwind CSS** + shadcn/ui | Design tokens definidos en §5 |
| Formularios | react-hook-form + **Zod** | Zod se reusa para validar en servidor |
| Iconos | lucide-react | |
| Deploy | **Vercel** | |
| Testing | Vitest (unit) + Playwright (e2e) | |

**Regla de arquitectura:** ningún componente de React accede a Supabase directamente. Toda lectura/escritura pasa por `lib/services/*.ts`.

---

## 3. Mapa del repositorio

```
app/
  (auth)/login/            · (auth)/registro/  · (auth)/recuperar/
  (app)/inicio/            · dashboard estudiante
  (app)/catalogo/          · listado + búsqueda + filtros
  (app)/catalogo/[id]/     · detalle del libro
  (app)/mis-prestamos/
  (app)/historial/
  (app)/favoritos/
  (app)/notificaciones/
  (app)/perfil/
  (admin)/dashboard/       · (admin)/libros/  · (admin)/usuarios/
  (admin)/prestamos/       · (admin)/devoluciones/  · (admin)/multas/
  (admin)/reportes/        · (admin)/configuracion/
components/
  ui/                      · primitivos shadcn (no editar a mano sin avisar)
  layout/                  · Sidebar, Topbar, MobileNav
  biblioteca/              · BookCard, BookCover, StatusBadge, LoanTable
  feedback/                · Modal, Toast, EmptyState, ErrorState, Skeleton
lib/
  supabase/                · client.ts, server.ts, middleware.ts
  services/                · books.ts, loans.ts, reservations.ts, fines.ts, users.ts
  validations/             · esquemas Zod, uno por dominio
  utils/                   · dates.ts, currency.ts, cn.ts
supabase/
  migrations/              · ⚠️ NO editar migraciones ya aplicadas
  seed.sql
docs/                      · especificaciones, ADRs, glosario
progreso/estado-actual.md  · snapshot vivo entre sesiones
```

**Archivos que NO tocas sin avisarme primero:**
`supabase/migrations/*` (ya aplicadas) · `middleware.ts` · `.env*` · `components/ui/*` (generados por shadcn).

---

## 4. Modelo de datos

Tablas principales (todas con RLS):

- `profiles` — id (FK auth.users), codigo_universitario (único), nombre, carrera, correo, telefono, rol (`estudiante` | `bibliotecario`), activo
- `books` — id, titulo, autor, editorial, anio, isbn (único), categoria, ubicacion, descripcion, portada_url, cantidad_total, cantidad_disponible
- `loans` — id, book_id, user_id, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado (`activo` | `vencido` | `devuelto`), renovaciones
- `reservations` — id, book_id, user_id, fecha_reserva, fecha_estimada_disponibilidad, estado (`activa` | `cumplida` | `cancelada`)
- `fines` — id, loan_id, user_id, dias_retraso, monto, estado (`pendiente` | `pagada`)
- `notifications` — id, user_id, tipo, mensaje, leida, created_at
- `favorites` — user_id, book_id
- `settings` — dias_prestamo (14), multa_diaria (1.00), max_renovaciones (2)

**Reglas de negocio (implementar en la capa de servicios, no en la UI):**

1. Un libro solo se presta si `cantidad_disponible > 0`. Si no, se ofrece reservar.
2. La fecha de devolución no puede ser anterior a hoy.
3. Un préstamo pasa a `vencido` automáticamente cuando `fecha_devolucion_estimada < hoy` y no hay devolución real.
4. La multa se calcula como `dias_retraso × multa_diaria` (soles, `S/`).
5. Un préstamo se renueva máximo `max_renovaciones` veces y nunca si está vencido con multa pendiente.
6. Reservar un libro genera una notificación al usuario cuando pase a disponible.
7. El rol `estudiante` **nunca** puede leer ni escribir datos de otro usuario. Esto se garantiza con RLS en Postgres, no con condicionales en React.

Moneda: **soles (S/)**. Fechas mostradas al usuario: **DD/MM/AAAA**. En base de datos: ISO 8601 / `timestamptz`.

---

## 5. Sistema de diseño

Sigue el prototipo de alta fidelidad ya aprobado (referencia visual en `docs/prototipo.png`).

```
Primario     #1D4ED8   (hover #1E40AF)
Texto        #1E3A5F   · Secundario #64748B
Fondos       #FFFFFF · #F8FAFC · #EFF6FF
Bordes       #BFDBFE
Éxito        #16A34A sobre #DCFCE7
Advertencia  #D97706 sobre #FEF3C7
Error        #DC2626 sobre #FEE2E2
```

- Tipografía: **Inter**. Radio: `8px`. Sombras suaves.
- Badges tipo *pill*, fondo tenue + texto del mismo tono.
  - Libro: Disponible (verde) · Reservado (amarillo) · Prestado (rojo)
  - Préstamo: Activo (azul) · Vencido (rojo) · Devuelto (verde)
- Sidebar fija 240px, ítem activo con fondo `#EFF6FF` y borde izquierdo azul.
- Responsive: bajo 768px la sidebar colapsa a menú hamburguesa; las tablas tienen scroll horizontal.
- Transiciones de 150ms. Skeleton loaders al cargar listas.

### Metáforas de interfaz (obligatorias, son parte del curso)

- **Verbales:** Buscar, Reservar, Préstamo, Devolver, Renovar, Historial, Catálogo, Mi biblioteca, Disponibilidad.
- **Visuales:** estanterías 📚, libro 📖, carné 🪪, lupa 🔍, calendario 📅, campana 🔔, semáforo de estados (🟢🟡🔴).
- **De escritorio:** ventanas, menús, barra lateral, botones, carpetas, tablas, formularios, cuadros de diálogo, papelera.

### Estados que SIEMPRE deben existir

Cada pantalla que carga datos necesita sus cuatro estados: **cargando, vacío, error, con datos**. No entregues una vista sin los cuatro.

Diálogos globales reutilizables: Éxito · Advertencia · Error · Confirmación · Sesión expirada · Sin conexión · Sesión iniciada en otro dispositivo · Acceso denegado · Campos incompletos · Fecha inválida.

### Heurísticas de Nielsen (criterio de aceptación de cada PR de UI)

Visibilidad del estado del sistema (toasts, spinners) · Control y libertad del usuario (Cancelar, Deshacer) · Consistencia · **Prevención de errores** (validar antes de enviar) · Reconocer mejor que recordar · Ayuda a reconocer y recuperarse de errores (mensajes en lenguaje humano, nunca códigos de stack).

---

## 6. Seguridad — no negociable

Aplica OWASP Top 10 desde la primera línea. Si tienes que elegir entre rápido y seguro, eliges **seguro** y me lo explicas en una frase.

1. **Nunca** concatenes input en SQL. Usa el cliente de Supabase o consultas parametrizadas.
2. **Nunca** hardcodees claves, tokens ni URLs de servicio. Todo a `.env.local`, y `.env*` va en `.gitignore`. Existe `.env.example` con valores dummy.
3. La `SUPABASE_SERVICE_ROLE_KEY` **jamás** se importa en un archivo con `"use client"` ni se expone al navegador. Solo en Server Actions / Route Handlers.
4. **Autorización en el servidor.** Ocultar un botón no es autorización. Cada tabla tiene políticas RLS; cada Server Action revalida el rol.
5. Validación con Zod **en cliente y en servidor**. La del cliente es UX; la del servidor es seguridad.
6. Nada de `eval`, deserialización insegura ni ejecución de input.
7. No loggees PII, tokens, contraseñas ni correos completos. Sin stack traces al cliente.
8. Cabeceras: CSP, HSTS, `X-Frame-Options`. CORS restringido al dominio de Vercel.
9. Rate limiting en login y recuperación de contraseña.
10. `npm audit` antes de cerrar cada fase.

**Severidad al reportar hallazgos:** 🔴 CRÍTICO → bloquea y corrige · 🟠 MEDIO → avisa y corrige o deja `// SECURITY:` · 🟡 BAJO → menciona.

---

## 7. Convenciones de código

- Archivos de código: **máximo ~300 líneas**. Si crece, se divide.
- Nombres de archivos, variables y funciones en **inglés**; la UI y los comentarios de dominio en **español**.
- Naming predecible: `lib/services/loans.ts`, no `lib/services/handler_v2_final.ts`.
- Server Components por defecto. `"use client"` solo cuando haya estado, evento o hook del navegador.
- Nada de `localStorage` para datos de negocio: la fuente de verdad es Supabase.
- Sin `lorem ipsum`. Textos reales, en español, desde el primer commit.
- Commits con **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Accesibilidad: contraste AA, foco visible, navegación por teclado, `<label>` asociado a cada input.

**Definition of Done de cualquier tarea:** compila · lint pasa · tipos pasan · tests de la funcionalidad pasan · los cuatro estados de UI existen · sin secretos en el diff · commit hecho.

---

## 8. Fases de desarrollo

Trabaja **una subfase por sesión**. No adelantes carpetas de fases futuras.

| Fase | Objetivo | Entregable |
|---|---|---|
| **F1.1** | Setup: Next.js + TS + Tailwind + shadcn, `.env.example`, hooks de pre-commit, lint | Repo que arranca en `localhost:3000` |
| **F1.2** | Supabase: proyecto, migraciones, RLS, seed con los libros del prototipo | `supabase/migrations/` + `seed.sql` |
| **F1.3** | Sistema de diseño: tokens, `StatusBadge`, `BookCover`, `Modal`, `Toast`, `EmptyState`, `ErrorState` | Página `/kitchen-sink` con todos los componentes |
| **F2.1** | Auth: login, registro, recuperar contraseña, middleware de sesión, errores del prototipo | Flujo de acceso completo |
| **F2.2** | Layout de app: sidebar, topbar, campana, responsive | Shell navegable |
| **F3.1** | Catálogo: listado, búsqueda, filtros, paginación, sin resultados, error de búsqueda | `/catalogo` |
| **F3.2** | Detalle del libro + favoritos | `/catalogo/[id]` |
| **F4.1** | Reservas y préstamos: modales, validación de fecha, libro no disponible | Flujo transaccional |
| **F4.2** | Mis préstamos: tabla, renovar, devolver, aviso de vencidos | `/mis-prestamos` |
| **F4.3** | Historial, notificaciones, perfil | Módulo estudiante cerrado |
| **F5.1** | Admin: dashboard con KPIs + préstamos recientes | `/admin/dashboard` |
| **F5.2** | Admin: CRUD de libros y usuarios | Gestión operativa |
| **F5.3** | Admin: préstamos, devoluciones con cálculo de multa, multas | Ciclo completo |
| **F5.4** | Admin: reportes y configuración | Módulo admin cerrado |
| **F6.1** | Evaluación IHC: heurística de Nielsen, recorrido cognitivo, SUS | `docs/evaluacion-usabilidad.md` |
| **F6.2** | Endurecimiento, `npm audit`, e2e críticos, deploy en Vercel | Producción |

Cada fase termina con: checklist verificado, commit, y actualización de `progreso/estado-actual.md`.

---

## 9. Datos semilla (usar exactamente estos)

**Libros:** Bases de Datos (Héctor García Molina · Pearson · 2020 · ISBN 978-612-00-1234-5 · Ingeniería · Estantería 3 – Fila B) · Algoritmos (T. Cormen) · Redes de Computadoras (A. Tanenbaum) · Inteligencia Artificial (S. Russell) · Sistemas Operativos Modernos (A. Tanenbaum · Pearson · 2023 · Estantería 4 – Fila A) · Programación en Java · Estructuras de Datos.

**Usuarios:** María García López — código `202100123`, Ingeniería de Sistemas, `maria.garcia@univ.edu.pe`, tel. 987 654 321 (estudiante) · Juan Pérez · Ana Torres · Luis Díaz · un bibliotecario administrador.

**KPIs del dashboard admin:** Total de libros 1,245 · Usuarios registrados 856 · Préstamos activos 128 · Multas pendientes 35.

---

## 10. Gestión de sesiones

- Antes de escribir código, lee este archivo y `progreso/estado-actual.md`.
- Si llevas más de **~60% de tu contexto usado**, cierra la sesión: actualiza `progreso/estado-actual.md`, escribe el handoff de la subfase en `progreso/handoff-F{n}.{m}.md` y pídeme abrir una sesión nueva.
- Nunca resumas el proyecto entero en el handoff. Solo: qué se hizo, qué archivos se tocaron, qué falta, qué decisión quedó pendiente.
- Si detectas una contradicción entre este archivo y lo que te pido en el chat, **pregúntame cuál vale** antes de asumir.

### Cómo arranco una sesión

```
Lee CLAUDE.md y progreso/estado-actual.md. Empieza la Fase 1.1.
```

---

## 11. Qué NO hacer

- No crear carpetas ni archivos de fases futuras.
- No instalar librerías que no estén en el stack sin proponérmelo antes.
- No usar `any`, ni silenciar errores de TypeScript con `@ts-ignore`.
- No desactivar RLS "temporalmente para probar".
- No inventar datos: si falta un dato del dominio, pregúntame.
- No entregar una pantalla sin sus estados de carga, vacío y error.
