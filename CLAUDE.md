# CLAUDE.md — BiblioTEC

> **Archivo de contexto permanente para Claude Code.**
> Se lee automáticamente al abrir el proyecto y al inicio de **cada** sesión, antes de escribir código.
> Contiene el resumen denso del proyecto y el mapa de dónde encontrar cada cosa.

---

## 📌 Identidad del Proyecto

**Nombre:** BiblioTEC

**Descripción breve:** Sistema web de gestión de biblioteca universitaria (catálogo, préstamos, reservas, devoluciones, multas y notificaciones) con foco en la calidad de la experiencia de usuario.

**Tipo:** Web app con usuarios (frontend + backend integrados en Next.js)

**Tamaño:** Mediano

**Contexto académico:** Proyecto del curso de **Interacción Humano–Computador (IHC)**. La calidad de la UX y la aplicación de metáforas de interfaz **son parte del entregable evaluable**, no un extra. Evaluable con heurísticas de Nielsen y cuestionario SUS.

**Equipo:** 2-3 desarrolladores, full-time, metodología Scrum-lite. Ver `## 👥 Convenciones de Equipo`.

---

## 🎯 Problema y Solución

**Problema:** Los sistemas bibliotecarios actuales tienen interfaces poco intuitivas, búsqueda difícil, procesos lentos de préstamo/reserva, ausencia de notificaciones de devolución y escaso control del historial.

**Solución:** Una interfaz moderna, fácil de aprender, con curva de aprendizaje mínima, que cumple las heurísticas de Nielsen y organiza el catálogo, los préstamos y las multas en flujos claros con estados siempre visibles.

**Funcionalidades principales:**
1. Catálogo con búsqueda, filtros y detalle de libros
2. Préstamos y reservas con validación de disponibilidad y fechas
3. Renovaciones y devoluciones con cálculo automático de multas
4. Notificaciones (reserva disponible, vencimiento, multa)
5. Favoritos, historial y perfil del estudiante
6. Panel de administración: dashboard con KPIs, CRUD de libros/usuarios, gestión de préstamos/devoluciones, reportes y configuración

---

## 🏗️ Arquitectura General

Next.js 15 (App Router) con Server Components por defecto; Supabase como backend (Auth + Postgres + Storage + Realtime). La autorización real vive en la base de datos vía **Row Level Security**, no en condicionales de React.

```
Navegador (React / Server Components)
        │  (nunca accede a Supabase directamente)
        ▼
lib/services/*.ts   ← ÚNICA puerta a los datos (frontera entre módulos)
        │
        ▼
Supabase (Postgres + RLS + Auth + Storage)
```

**Reglas inviolables de arquitectura:**
- Ningún componente de React accede a Supabase directamente. **Toda** lectura/escritura pasa por `lib/services/*.ts`.
- La frontera entre módulos es SIEMPRE una función de servicio tipada, nunca acceso directo a las tablas de otro módulo.
- La lógica de negocio (reglas de préstamo, cálculo de multas) vive en la capa de servicios, **no** en la UI.
- Autorización en el servidor: ocultar un botón no es autorización. Cada tabla tiene políticas RLS; cada Server Action revalida el rol.
- `SUPABASE_SERVICE_ROLE_KEY` jamás se importa en un archivo con `"use client"` ni se expone al navegador.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| Framework | Next.js 15 (App Router), Server Components por defecto |
| Lenguaje | TypeScript (strict). Prohibido `any`; usar `unknown` + narrowing |
| Base de datos | PostgreSQL vía Supabase, RLS siempre activo |
| Backend / Auth | Supabase (Auth, Postgres, Storage, Realtime) |
| Estilos | Tailwind CSS + shadcn/ui |
| Formularios | react-hook-form + Zod (Zod se reusa para validar en servidor) |
| Iconos | lucide-react |
| Deploy | Vercel |
| Testing | Vitest (unit/integration) + Playwright (e2e) |

---

## 📂 Estructura del Repositorio (estado actual)

> Esta estructura **crece por fase**. Aquí está lo que existe en el commit actual.
> Cada fase de `docs/guia_desarrollo.md` declara qué carpetas y archivos nuevos introduce.
> **No crear carpetas de fases futuras.**

```
CLAUDE.md                    · este archivo
README.md                    · para humanos
ROADMAP.md                   · vista de progreso
contexto/ContextoInicial.md  · documento fuente original (referencia histórica)
design/                      · prototipo de alta fidelidad (referencia visual)
docs/
  especificaciones.md        · requisitos, seguridad, arquitectura, datos
  guia_desarrollo.md         · fases y subfases con prompts
  glosario.md                · términos del dominio
  equipo.md                  · catálogo de módulos y reglas de convivencia
  backlog.md                 · tareas T-nnn con dependencias
  threat-model.md            · modelo de amenazas
  adr/0001-decisiones-iniciales.md
progreso/
  estado-actual.md           · snapshot vivo entre sesiones
  tablero-equipo.md          · quién trabaja en qué (espejo del GitHub Project)
.github/
  workflows/ci.yml
  PULL_REQUEST_TEMPLATE.md
.env.example
.gitignore
```

El andamiaje de código (`app/`, `components/`, `lib/`, `supabase/`, `tests/`) lo crea la **Fase 1**. Ver `docs/guia_desarrollo.md`.

---

## 🗂️ DÓNDE ENCONTRAR CADA COSA

### docs/especificaciones.md

| Tema | Sección |
|------|---------|
| Roles y usuarios | 2 |
| Requisitos Funcionales | 3 |
| Requisitos No Funcionales | 4 |
| Seguridad (OWASP + ampliada) | 5 |
| Restricciones y exclusiones | 6 |
| Arquitectura y modelo de datos | 7 |
| Especificaciones técnicas (stack, testing) | 8 |
| Infraestructura y despliegue | 9 |
| Evaluación IHC y validación | 10 |
| Cumplimiento regulatorio (Ley 29733) | 11 |

### docs/guia_desarrollo.md

| Tema | Sección |
|------|---------|
| Mapa de fases y subfases | Inicio |
| F1 Fundación & Acceso [A] | F1.1–F1.4 |
| F2 Catálogo [B] | F2.1–F2.2 |
| F3 Circulación [C] | F3.1–F3.3 |
| F4 Multas & Notificaciones [D] | F4.1–F4.2 |
| F5 Administración [E] | F5.1–F5.4 |
| F6 Evaluación IHC & Producción | F6.1–F6.2 |

### Otros

- **ROADMAP.md** — vista resumida del progreso. Consultar antes de cada sesión.
- **docs/equipo.md** — módulos, fronteras, estados, reglas de convivencia.
- **docs/backlog.md** — tareas con dependencias.
- **progreso/estado-actual.md** — snapshot del último cierre. **LEER SIEMPRE al arrancar.**
- **progreso/fase-{n}.{m}-{modulo}.md** — handoff doc de la última subfase. **LEER SIEMPRE al arrancar.**
- **progreso/tablero-equipo.md** — quién trabaja en qué (espejo del GitHub Project).

---

## 🔒 SEGURIDAD INVIOLABLE

Aplica OWASP Top 10 (2025) completo desde la primera línea. Si tienes que elegir entre rápido y seguro, eliges **seguro** y lo explicas en una frase. Detalle en `docs/especificaciones.md` §5.

### OWASP (reglas críticas)

- **A01 Control de acceso:** deny-by-default. Cada tabla con RLS; cada Server Action revalida el rol. El rol `estudiante` **nunca** lee ni escribe datos de otro usuario (garantizado con RLS, no con `if` en React). IDs de recursos con UUID.
- **A02 Cifrado:** HTTPS/HSTS en producción. Contraseñas gestionadas por Supabase Auth (bcrypt/argon2). Secretos solo en variables de entorno.
- **A03 Inyección:** nunca concatenar input en SQL. Cliente de Supabase o consultas parametrizadas. Validación con Zod. Nada de `eval`.
- **A04/A05:** rate limiting en login y recuperación; headers de seguridad (CSP, HSTS, X-Frame-Options); CORS restringido al dominio de Vercel; sin stack traces al cliente.
- **A07 Auth:** contraseñas ≥8 con complejidad; bloqueo tras 5 intentos; sesión se invalida al cerrar.
- **A09 Logging:** logs de login, alta/baja de usuarios, accesos denegados; sin PII ni tokens.

### Secrets

- `.env*` NUNCA al repo (está en `.gitignore`). Existe `.env.example` con valores dummy.
- Si encuentras un secret hardcodeado: **detente**, reemplázalo con `process.env.X`, agrégalo a `.env.example` con valor dummy, y avisa.
- `SUPABASE_SERVICE_ROLE_KEY` solo en Server Actions / Route Handlers, jamás en cliente.

### Logging

- NUNCA loggear: contraseñas, tokens, correos completos, teléfonos, código universitario completo, PII.
- Enmascarar: correo `m***@univ.edu.pe`, código `2021***23`. Sin stack traces al cliente.

### Dependencias

- Versiones pinneadas, lockfile (`package-lock.json`) comiteado.
- `npm audit --audit-level=high` en el checklist de cada fase.
- Al añadir una dep nueva: revisar mantenimiento (<12 meses), vulnerabilidades y peso. Proponérselo al equipo antes.

### Severidad al reportar hallazgos

🔴 CRÍTICO → bloquea y corrige · 🟠 MEDIO → avisa y corrige o deja `// SECURITY:` · 🟡 BAJO → menciónalo.

---

## 🎨 Convenciones de Código

### Estilo

- **Server Components por defecto.** `"use client"` solo cuando haya estado, evento o hook del navegador.
- TypeScript strict. Prohibido `any` y `@ts-ignore`. Usar `unknown` + narrowing.
- Nada de `localStorage` para datos de negocio: la fuente de verdad es Supabase.
- Sin `lorem ipsum`: textos reales en español desde el primer commit.
- Accesibilidad AA: contraste, foco visible, navegación por teclado, `<label>` asociado a cada input.

### Estados que SIEMPRE deben existir

Cada pantalla que carga datos necesita sus **cuatro estados**: cargando (skeleton), vacío (EmptyState), error (ErrorState), con datos. No entregues una vista sin los cuatro.

### Archivos cortos

**Regla:** ningún archivo de código supera ~300 líneas. Si se acerca, divide por responsabilidad.

### Naming

- Servicios: `lib/services/{dominio}.ts` (`loans.ts`, no `handler_v2_final.ts`)
- Validaciones Zod: `lib/validations/{dominio}.ts`
- Componentes UI: PascalCase (`BookCard.tsx`, `StatusBadge.tsx`)
- Tests: `{nombre}.test.ts` (unit) · `tests/e2e/{flujo}.spec.ts` (Playwright)
- Migraciones: `supabase/migrations/{timestamp}_{descripcion}.sql`
- Nombres de archivos/variables/funciones en **inglés**; UI y comentarios de dominio en **español**.

### Git

- **Conventional Commits** con el módulo en el scope: `feat(B): endpoint de búsqueda de catálogo`.
- Ramas: `modulo/tarea-corta` → `b/catalogo-busqueda`. Nadie hace push directo a `main`.
- Tags semánticos al cerrar fases importantes: `v0.1.0` tras F1.

---

## 🌐 Variables de Entorno

Ver `.env.example` para la lista completa. Las sensibles:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # SOLO servidor, jamás en "use client"
```

---

## 📈 Métricas Objetivo

| Métrica | Meta |
|---------|------|
| SUS (System Usability Scale) | ≥ 75 |
| Cobertura de tests en lógica de negocio | ≥ 60% |
| Tareas críticas completables sin ayuda | ≥ 90% de usuarios de prueba |
| Cumplimiento heurísticas Nielsen en PRs de UI | 100% (criterio de aceptación) |

---

## 🚦 Estado Actual del Proyecto

Ver siempre `ROADMAP.md` y `progreso/estado-actual.md` para el estado más fresco.

**Fase activa actual:** Por iniciar — **F1.1** (a cargo del dev integrador).

---

## 💻 Comandos Útiles del Proyecto

> Disponibles a partir de F1.1. Antes de F1.1 el proyecto aún no tiene `package.json`.

```bash
npm run dev            # arranca en localhost:3000
npm run build          # build de producción
npm run lint           # eslint
npm run test           # vitest (unit/integration)
npm run test:e2e       # playwright
npm audit --audit-level=high   # auditoría de dependencias
npx supabase db reset  # aplica migraciones + seed en local
```

---

## 👥 Convenciones de Trabajo

> **Modo actual: SOLO (1 desarrollador).** El proyecto está preparado para incorporar a otra persona más adelante sin rediseñar nada. Las reglas marcadas *(al sumar dev)* se activan cuando entre un segundo desarrollador.

### Modo solo (ahora)

1. **Commits directos a `main` permitidos.** Ramas de feature (`modulo/tarea-corta`) son opcionales pero recomendadas para trabajos grandes.
2. **Sin review obligatorio.** Regla con IA igualmente vigente: *"respondes por lo que tu Claude Code generó"* — si no puedes explicar una línea, no la dejes.
3. **CI debe quedar en verde** (`.github/workflows/ci.yml`): lint, typecheck, tests, audit.
4. **El tablero es tu mapa de avance:** actualiza `progreso/tablero-equipo.md` y `progreso/estado-actual.md` al cerrar cada subfase (aunque trabajes solo, es lo que preserva el contexto entre sesiones).
5. **Commits pequeños y frecuentes** con Conventional Commits (scope = módulo): `feat(B): búsqueda de catálogo`.

### Reglas que aplican siempre (solo o en equipo)

6. **Respeta el orden y las dependencias** de módulos/fases (ver `docs/equipo.md` y `docs/guia_desarrollo.md`).
7. **Cambios a una frontera compartida** (firma de un service): si algún día hay otra persona, avísale ANTES; registra un ADR en `docs/adr/` si es de largo plazo.
8. **F1 es la fundación secuencial:** se completa antes de abrir los módulos B–E.
9. **Cada fase cierra con un hito de integración** sin mocks: se conecta y se prueba el flujo completo.

### Al sumar un segundo dev (activar estas reglas)

- *(al sumar dev)* **Nadie hace push directo a `main`:** todo entra por Pull Request, y protege `main` en GitHub.
- *(al sumar dev)* **Todo PR requiere ≥1 revisión humana**, PRs pequeños (< ~400 líneas), CI verde para mergear.
- *(al sumar dev)* **Reclamar antes de codificar:** marca el módulo/tarea *En progreso* en el tablero antes de tocar código; un módulo *En progreso* no lo toma otro dev.
- El onboarding es incremental: la persona clona, lee `CLAUDE.md` y `docs/equipo.md`, y reclama un módulo *Disponible*. No se regenera nada.

Handoff docs **por módulo**: `progreso/fase-{n}.{m}-{modulo}.md`.

---

## ⛔ ARCHIVOS QUE NO TOCAR SIN AVISAR

Pedir confirmación explícita al equipo antes de modificar:

- `supabase/migrations/*` — migraciones ya aplicadas (modifican el schema)
- `lib/supabase/middleware.ts` y `middleware.ts` — sesión y rutas protegidas
- `.env*` — secretos
- `components/ui/*` — primitivos generados por shadcn
- `.github/workflows/*` — pipeline de CI

---

## ⛔ COSAS QUE CLAUDE CODE NO DEBE HACER NUNCA

1. **No inventar requisitos ni datos del dominio.** Consultar `docs/especificaciones.md`; si falta un dato, preguntar.
2. **No saltarse fases/subfases.** Respetar el orden de `docs/guia_desarrollo.md`. Una subfase = una sesión.
3. **No usar `any` ni `@ts-ignore`.**
4. **No desactivar RLS "temporalmente para probar".**
5. **No acceder a Supabase desde un componente:** todo pasa por `lib/services/*`.
6. **No exponer credenciales en logs ni respuestas.** No hardcodear valores que van en `.env`.
7. **No crear estructura de carpetas para fases futuras.**
8. **No entregar una pantalla sin sus cuatro estados** (cargando, vacío, error, con datos).
9. **No tocar archivos de la lista de "no tocar sin avisar"** sin pedir confirmación.
10. **No mergear a `main` sin PR y CI verde.**

---

## 🔌 Cuándo cerrar esta sesión de Claude Code

Cierra esta sesión y abre una nueva si:

- Llevas más de ~60% de tu ventana de contexto usada
- Has completado la subfase en curso
- Necesitas cambiar de módulo/capa drásticamente
- El usuario te pide algo fuera del scope de la subfase actual

**Antes de cerrar, SIEMPRE:**

1. Asegurar que los tests de la subfase pasan y el lint está limpio
2. Hacer commit con mensaje en Conventional Commits (scope = módulo)
3. Actualizar `progreso/estado-actual.md`
4. Crear/actualizar `progreso/fase-{n}.{m}-{modulo}.md` (handoff doc)
5. Actualizar `progreso/tablero-equipo.md` y el GitHub Project
6. Si quedan TODOs, anotarlos en el handoff doc

**Al arrancar una sesión nueva, SIEMPRE leer en este orden:**

1. CLAUDE.md (este archivo)
2. `progreso/estado-actual.md`
3. El handoff doc más reciente de tu módulo (`progreso/fase-{n}.{m}-{modulo}.md`)
4. La sección correspondiente de `docs/guia_desarrollo.md`

---

## 🆘 Cuando algo falla

- **RLS bloquea una consulta que "debería" funcionar:** revisa la política de la tabla en `supabase/migrations/`. NO desactives RLS; corrige la política.
- **`SUPABASE_SERVICE_ROLE_KEY is undefined` en cliente:** estás importándola en un archivo con `"use client"`. Muévela a un Server Action/Route Handler.
- **Hydration mismatch:** un Server Component está renderizando algo dependiente del navegador (fecha local, `window`). Marca ese fragmento `"use client"`.
- **Tipos de Supabase desactualizados:** regenera con `npx supabase gen types typescript`.

---

## 📞 Referencia Rápida de Contexto

**¿Qué es esto?** Sistema web de gestión de biblioteca universitaria (proyecto de curso IHC).
**¿Quién lo usa?** Estudiantes (buscar/prestar/reservar) y bibliotecarios (administrar).
**¿Cuántos usuarios concurrentes?** Decenas (contexto académico/piloto), no miles.
**¿Entorno de ejecución?** Cloud público: Vercel (app) + Supabase (datos), acceso por internet.

---

_Última actualización: 2026-07-10_
_Versión del documento: 2.0_
