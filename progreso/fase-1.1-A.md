# Handoff — F1.1 Setup & tooling (Módulo A)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Siguiente:** F1.2 (BD, RLS y seed)

## Qué quedó hecho

Proyecto **Next.js 15 (App Router) + TypeScript strict + Tailwind + shadcn/ui** arrancable en `localhost:3000`, con tooling de calidad, tests y CI listos. Sin lógica de dominio ni Supabase todavía (eso es F1.2).

### Verificaciones (todas en verde)

| Check                            | Resultado                          |
| -------------------------------- | ---------------------------------- |
| `npm run dev` → `localhost:3000` | 200, HTML con "BiblioTEC"          |
| `npm run lint`                   | Sin errores ni warnings            |
| `npx tsc --noEmit`               | Sin errores                        |
| `npm run test -- --run`          | 2/2 tests (smoke)                  |
| `npm audit --audit-level=high`   | **exit 0** (sin high/critical)     |
| Husky pre-commit                 | Activo (`core.hooksPath=.husky/_`) |

## Versiones instaladas (pinneadas, sin `^`/`~`)

- **next 15.5.20**, react 19.0.0, react-dom 19.0.0
- typescript 5.7.3, @types/node 22.10.7, @types/react 19.0.7
- tailwindcss 3.4.17, postcss 8.5.16, autoprefixer 10.4.20
- class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 2.6.0, tailwindcss-animate 1.0.7, lucide-react 0.469.0
- zod 3.24.1, react-hook-form 7.54.2, @hookform/resolvers 3.10.0
- eslint 8.57.1, eslint-config-next 15.5.20, eslint-config-prettier 9.1.0, prettier 3.4.2, prettier-plugin-tailwindcss 0.6.9
- husky 9.1.7, lint-staged 15.5.2
- **vitest 4.1.10**, @vitest/coverage-v8 4.1.10, jsdom 25.0.1, @testing-library/react 16.1.0, @testing-library/jest-dom 6.6.3
- **@playwright/test 1.55.1**
- Runtime local: Node v22.21.1, npm 10.9.4 (CI usa Node 20)

## Decisiones de configuración (y por qué)

1. **Husky (no `.pre-commit-config.yaml`).** Husky v9 + lint-staged es lo natural en un repo JS. El hook `.husky/pre-commit` corre `lint-staged` (eslint --fix + prettier sobre lo staged) y luego **gitleaks** (RNF-SEC-SEC-3). Si gitleaks no está instalado localmente, avisa 🟡 pero **no bloquea** el commit (modo solo, Windows). Instalarlo: `winget install gitleaks`. En un entorno endurecido conviene hacerlo obligatorio.
2. **Tailwind v3 (no v4)** con `tailwind.config.ts` clásico + `postcss.config.mjs`, por compatibilidad directa con shadcn/ui. Tokens del prototipo (`design/`) mapeados a variables HSL tipo shadcn en `app/globals.css`: primario `#1D4ED8`, activo `#EFF6FF` (`--primary-soft`), verde `#16A34A` (`--success`, disponible), ámbar `#D97706` (`--warning`, reservado), rojo `#DC2626` (`--destructive`). Radio base **8px** (`--radius: 0.5rem`). Foco visible AA global. Tipografía **Inter** vía `next/font` (`--font-inter`).
3. **shadcn/ui inicializado sin generar primitivos.** Hay `components.json` (style new-york, alias `utils` → `@/lib/utils/cn`) y `lib/utils/cn.ts`. Los componentes (`components/ui/*`, feedback, etc.) llegan en **F1.3** para no crear estructura de fases futuras. El util `cn` se adelanta porque es la base de shadcn.
4. **Vitest 4 (no 2).** Se subió a 4.1.10 para **eliminar high/critical** del stack de test (vite/esbuild). Se **omite `@vitejs/plugin-react`**: el transform JSX/TSX lo hace el esbuild integrado de Vite (runtime automatic), así queda una única `vite@8.1.4` deduplicada y el audit limpio. Si en el futuro se necesita fast-refresh en tests, reevaluar añadirlo con una versión compatible con vite 8.
5. **CI (`.github/workflows/ci.yml`) sin cambios.** El archivo existente ya cubre install → lint → typecheck → test → `npm audit --audit-level=high` (audit en `continue-on-error`). El job e2e queda comentado hasta F1.4. Está en la lista de "no tocar sin avisar"; como ya cumplía F1.1, no se modificó.

## Estructura nueva introducida

```
app/layout.tsx, app/page.tsx, app/globals.css   · landing en español + Inter + tokens
lib/utils/cn.ts                                  · util base de shadcn
tests/setup.ts, tests/smoke.test.ts, tests/e2e/  · Vitest + Playwright
package.json, package-lock.json, tsconfig.json   · deps pinneadas, TS strict
next.config.ts, tailwind.config.ts, postcss.config.mjs, components.json
.eslintrc.json, .prettierrc.json, .prettierignore
.husky/pre-commit, .github/dependabot.yml
vitest.config.ts, playwright.config.ts
```

## Deudas / TODOs anotados

- 🟡 **`next lint` está deprecado** (se elimina en Next 16). Antes de subir a Next 16, migrar a ESLint CLL: `npx @next/codemod@canary next-lint-to-eslint-cli .`
- 🟡 **2 vulnerabilidades moderate** quedan (`postcss` empaquetado **dentro de next 15.5.20**). Están **por debajo del gate** `--audit-level=high`. Corregirlas exigiría degradar next a 9.x (inaceptable); se limpiarán solas cuando next actualice su postcss interno. Revisar en cada bump de next.
- **gitleaks** conviene volverlo obligatorio (quitar el fallback) cuando el equipo lo tenga instalado o en CI.

## Para F1.2 (BD, RLS y seed)

- La base de datos **aún no existe**. `.env.local` ya está creado localmente (ignorado por git) pero las claves reales de Supabase se cargan en F1.2.
- `.env.example` ya lista las variables de Supabase (dummy).
- Crear `supabase/migrations/*`, `supabase/seed.sql` y `lib/supabase/{client,server,middleware}.ts`. No desactivar RLS.
