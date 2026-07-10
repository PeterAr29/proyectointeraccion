# BiblioTEC

Sistema web de gestión de biblioteca universitaria: catálogo, préstamos, reservas, devoluciones, multas y notificaciones, con una interfaz intuitiva evaluable con las heurísticas de Nielsen y el cuestionario SUS. Proyecto del curso de Interacción Humano–Computador (IHC).

## Características principales

- Catálogo con búsqueda, filtros, paginación y detalle de libros
- Préstamos y reservas con validación de disponibilidad y fechas
- Renovaciones y devoluciones con cálculo automático de multas (soles, `S/`)
- Favoritos, historial, notificaciones y perfil del estudiante
- Panel de administración: dashboard con KPIs, CRUD de libros/usuarios, gestión de préstamos/devoluciones, reportes y configuración
- Seguridad OWASP Top 10 con Row Level Security en la base de datos como autorización real

## Capturas / Demo

Prototipo de alta fidelidad en `design/`. (Añadir capturas y URL de despliegue tras F6.2.)

## Stack

- **Next.js 15** (App Router) + **TypeScript** strict
- **Supabase** (PostgreSQL, Auth, Storage, Realtime) con RLS
- **Tailwind CSS** + **shadcn/ui**, **lucide-react**
- **react-hook-form** + **Zod**
- **Vitest** (unit/integration) + **Playwright** (e2e)
- Deploy en **Vercel**

## Requisitos previos

- Node.js 20+
- Git
- Cuenta de Supabase (proyecto propio) y Supabase CLI para desarrollo local
- Cuenta de Vercel (para desplegar)

## Instalación local

```bash
git clone <url-del-repo>
cd BiblioTEC
npm install
cp .env.example .env.local
# Editar .env.local con las claves de tu proyecto Supabase
npx supabase db reset      # aplica migraciones + seed (a partir de F1.2)
npm run dev                # arranca en http://localhost:3000
```

## Estructura del proyecto

La estructura crece por fase (ver `docs/guia_desarrollo.md`). A alto nivel:

```
app/           · rutas (auth, app de estudiante, admin)
components/    · ui (shadcn), layout, biblioteca, feedback
lib/           · supabase/, services/ (única puerta a datos), validations/, utils/
supabase/      · migrations/, seed.sql
docs/          · especificaciones, guía, glosario, equipo, backlog, ADRs, threat-model
progreso/      · estado-actual y handoffs entre sesiones
tests/         · unit e2e
```

**Regla de arquitectura:** ningún componente accede a Supabase directamente; todo pasa por `lib/services/*.ts`.

## Cómo correr los tests

```bash
npm run test        # Vitest (unit/integration)
npm run test:e2e    # Playwright (e2e)
npm run lint        # ESLint
npm audit --audit-level=high
```

## Cómo contribuir

**Modo actual: solo (1 desarrollador).** El proyecto está preparado para incorporar a otra persona sin rediseñar nada. Lee `docs/equipo.md` y `CLAUDE.md` (§Convenciones de Trabajo).

Trabajando solo:
1. Desarrolla con Claude Code **una subfase por sesión**; sigue el orden de `docs/guia_desarrollo.md`.
2. Commits con Conventional Commits y el módulo en el scope: `feat(B): ...`. Ramas de feature opcionales; commits directos a `main` permitidos.
3. Deja el **CI en verde** (lint, typecheck, tests, audit).
4. Al cerrar cada subfase: actualiza `progreso/estado-actual.md`, el handoff doc y el tablero.

Cuando entre un segundo desarrollador se activan: PRs con ≥1 review, `main` protegida y "reclamar antes de codificar" en el tablero (ver `docs/equipo.md`).

**Regla con IA:** respondes por lo que tu Claude Code generó; si no puedes explicar una línea, no la dejes.

## Cómo deployar

Deploy automático a Vercel al mergear a `main` (preview deploys por PR). Migraciones con Supabase CLI (`supabase db push`) o desde el dashboard; nunca editar migraciones ya aplicadas. Detalle en `docs/especificaciones.md` §9.

## Privacidad y datos

Maneja datos personales de estudiantes bajo la **Ley N.º 29733 (Perú)**. Ver `docs/especificaciones.md` §11.

## Licencia

Proyecto académico. Definir licencia antes de publicar.

## Autores / Contacto

Equipo BiblioTEC (2-3 desarrolladores) — curso de IHC.
