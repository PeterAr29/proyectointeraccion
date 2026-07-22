# Backlog — BiblioTEC

> Tareas mapeadas desde las subfases de `docs/guia_desarrollo.md`. Una tarea está **Disponible** solo si sus dependencias están Terminadas. Cada dev toma tareas disponibles de cualquier módulo no bloqueado, sin invadir un módulo que otro tiene _En progreso_.

**Estados:** Disponible · En progreso · Review · Done

---

## Módulo A — Plataforma & Acceso (F1, integrador, secuencial)

### T-001 · [A] Setup & tooling

- Depende de: —
- Criterios de aceptación:
  - [ ] Next.js 15 + TS strict + Tailwind + shadcn arrancan en localhost:3000
  - [ ] ESLint + Prettier + Husky/pre-commit con gitleaks
  - [ ] Vitest y Playwright configurados; smoke test verde
  - [ ] CI (lint, typecheck, test, npm audit) y Dependabot
- Estado: Disponible

### T-002 · [A] Base de datos, RLS y seed

- Depende de: T-001
- Criterios de aceptación:
  - [ ] Migraciones de las 8 tablas con RLS activo y políticas por rol
  - [ ] seed.sql con los datos exactos del contexto
  - [ ] Helpers `lib/supabase/{client,server,middleware}.ts`
  - [ ] `.env.example` con variables de Supabase
- Estado: Bloqueado por T-001

### T-003 · [A] Sistema de diseño (kitchen-sink)

- Depende de: T-002
- Criterios de aceptación:
  - [ ] StatusBadge, BookCover, Modal, Toast, EmptyState, ErrorState, Skeleton + diálogos globales
  - [ ] utils cn/dates/currency con tests
  - [ ] `/kitchen-sink` muestra todo; accesibilidad AA
- Estado: Bloqueado por T-002

### T-004 · [A] Acceso + shell + perfil

- Depende de: T-003
- Criterios de aceptación:
  - [ ] Login, registro, recuperar (Zod cliente+servidor); errores en diálogos globales
  - [ ] middleware protege (app) y (admin); rate limiting básico en login
  - [ ] Shell responsive (Sidebar/Topbar/MobileNav); campana
  - [ ] Perfil ver/editar; e2e de login; hito de integración F1
- Estado: Bloqueado por T-003

---

## Módulo B — Catálogo

### T-005 · [B] Listado, búsqueda y filtros

- Depende de: T-004 (interfaz de sesión/servicios de A)
- Criterios de aceptación:
  - [ ] `/catalogo` con listado paginado, búsqueda (título/autor/ISBN) y filtros
  - [ ] `lib/services/books.ts` como única puerta; búsqueda parametrizada
  - [ ] 4 estados; validación Zod; tests de búsqueda/filtrado
- Estado: Bloqueado por T-004

### T-006 · [B] Detalle de libro + favoritos

- Depende de: T-005
- Criterios de aceptación:
  - [ ] `/catalogo/[id]` con detalle completo; id inválido → ErrorState
  - [ ] Favoritos (toggle + `/favoritos`) respetando RLS; tests
  - [ ] Hito de integración F2
- Estado: Bloqueado por T-005

---

## Módulo C — Circulación

### T-007 · [C] Reservas y préstamos

- Depende de: T-006 (frontera `books.ts`); puede arrancar contra mock de books
- Criterios de aceptación:
  - [ ] Prestar si hay stock (decremento atómico); si no, reservar
  - [ ] Cálculo de fecha de devolución; validación de fecha con Zod
  - [ ] Lógica en `loans.ts`/`reservations.ts`; Server Action revalida rol; confirmaciones
  - [ ] Tests: con/sin stock, doble préstamo, fecha pasada
- Estado: Bloqueado por T-006

### T-008 · [C] Mis préstamos (renovar/devolver/vencidos)

- Depende de: T-007
- Criterios de aceptación:
  - [ ] `/mis-prestamos` con LoanTable; renovar (límite y multa pendiente), devolver (repone stock)
  - [ ] Marca 'vencido' correctamente; 4 estados; tests
- Estado: Bloqueado por T-007

### T-009 · [C] Historial

- Depende de: T-008
- Criterios de aceptación:
  - [ ] `/historial` con filtro por estado/fecha (solo lectura, RLS); tests
  - [ ] Hito de integración F3
- Estado: Bloqueado por T-008

---

## Módulo D — Multas & Notificaciones

### T-010 · [D] Cálculo de multas

- Depende de: T-009 (préstamos vencidos y dias_retraso)
- Criterios de aceptación:
  - [ ] `fines.ts`: monto = dias_retraso × multa_diaria; estados pendiente/pagada
  - [ ] Checker de "multa pendiente" que consume `loans.ts` (renovación)
  - [ ] Tests exhaustivos del cálculo (0/varios días, redondeo)
- Estado: Bloqueado por T-009

### T-011 · [D] Motor de notificaciones + vista

- Depende de: T-010
- Criterios de aceptación:
  - [ ] Notifica reserva disponible, vencimiento y multa
  - [ ] `/notificaciones` (marcar leída) + contador en campana; RLS; 4 estados; tests
  - [ ] Hito de integración F4
- Estado: Bloqueado por T-010

---

## Módulo E — Administración

### T-012 · [E] Dashboard con KPIs

- Depende de: T-011 (services de B/C/D listos)
- Criterios de aceptación:
  - [ ] `/admin/dashboard` (solo bibliotecario) con KPIs y préstamos recientes vía services; tests de agregación
- Estado: Bloqueado por T-011

### T-013 · [E] CRUD de libros y usuarios

- Depende de: T-012
- Criterios de aceptación:
  - [ ] CRUD de libros (portada en Storage) y usuarios (rol/activación, sin borrado duro con historial)
  - [ ] Zod cliente+servidor; confirmaciones; 4 estados; tests
- Estado: Bloqueado por T-012

### T-014 · [E] Préstamos, devoluciones y multas

- Depende de: T-013
- Criterios de aceptación:
  - [ ] Registro de devolución (repone stock) con cálculo de multa vía `fines.ts`; marcar multa pagada
  - [ ] Vista global de préstamos activos/vencidos (admin); tests del flujo integrado
- Estado: Bloqueado por T-013

### T-015 · [E] Reportes y configuración

- Depende de: T-014
- Criterios de aceptación:
  - [ ] `/admin/reportes` (préstamos por periodo, más prestados, multas; export CSV)
  - [ ] `/admin/configuracion` (editar settings con Zod, no retroactivo); tests
  - [ ] Hito de integración F5
- Estado: Bloqueado por T-014

---

## Fase 6 — Evaluación IHC & Producción

### T-016 · Evaluación de usabilidad (Nielsen + SUS)

- Depende de: T-015
- Criterios de aceptación:
  - [ ] `docs/evaluacion-usabilidad.md`: heurística de Nielsen, recorrido cognitivo, SUS (≥75)
  - [ ] Hallazgos críticos de UX corregidos (sin tocar lógica de negocio)
- Estado: Bloqueado por T-015

### T-017 · Endurecimiento y despliegue

- Depende de: T-016
- Criterios de aceptación:
  - [ ] Headers de seguridad + CORS + cookies seguras; e2e críticos verdes; `npm audit` limpio
  - [ ] Política de privacidad (Ley 29733); test de restore documentado; deploy a Vercel verificado; tag v1.0.0
- Estado: Bloqueado por T-016

---

## Post-`v1.0.0` — trabajo abierto (auditoría del 2026-07-22)

> Detectado al registrar retroactivamente la iteración de UX del 2026-07-12.
> Contexto completo en `progreso/fase-7-ux.md`.

### T-018 · Iteración de UX post-`v1.0.0` (A/B/C)

- Depende de: T-017
- Entregado el 2026-07-12 en 5 commits (`4a9a684`…`7ae69fa`): rediseño de login/inicio/shell,
  política de préstamo 2+1 y catálogo por áreas académicas. Dos migraciones aplicadas al remoto.
- Estado: ✅ Terminada (registrada retroactivamente)

### T-019 · Quitar los CVEs high de `sharp`

- Depende de: — · _(se creyó bloqueante por CI; **no lo era**: el paso de audit es
  `continue-on-error: true`. El rojo real de CI era el e2e — ver T-025.)_
- Criterios de aceptación:
  - [x] `npm audit --audit-level=high` en exit 0 (`overrides` a `sharp 0.35.3`)
  - [x] `npm run build` sigue verde (28/28) — además se verificó que el proyecto **no
        usa `next/image`**, así que sharp nunca se ejecuta
  - [x] `package-lock.json` comiteado; **sin** `npm audit fix --force` (proponía `next@9.3.3`)
- Estado: ✅ Terminada (commit `76e1793`)

### T-020 · Fix de la regresión del aviso de vencimiento (C/D)

- Depende de: — · _(era bloqueante: bug funcional en producción)_
- Criterios de aceptación:
  - [x] **Migración nueva** `20260722160000_renew_loan_restore_due_soon_marker.sql` que
        re-declara `renew_loan` conservando la suma de 1 día **y** restaurando
        `vencimiento_notificado_en = null`
  - [x] Aplicada al remoto y verificada con rollback: marcador reiniciado, +1.000 día
        exacto, guardas BT101/BT100 intactos, datos sin tocar
  - [x] No se editó la migración ya aplicada
- Estado: ✅ Terminada

### T-025 · Arreglar el e2e del catálogo (CI en rojo desde el 12-jul)

- Depende de: T-018 · **Este era el rojo real de CI**
- El run de `7ae69fa` (12-jul) falló y nadie lo revisó: `main` llevó 10 días con el
  job e2e en rojo. 2 specs quedaron obsoletas con el hub de áreas (la UI era correcta).
- Criterios de aceptación:
  - [x] `tests/e2e/catalog.spec.ts` alineado con el hub (`?ver=todo` para el listado,
        "Volver a las áreas" en el estado vacío)
  - [x] Locator del hub con `.first()` (el área de la carrera sale destacada y en la grilla)
  - [ ] Job **e2e** verde en CI
- Estado: 🔄 En curso

### T-024 · Vigilar el pausado automático de Supabase

- Depende de: —
- El 2026-07-22 se encontró el proyecto `bibliotec` en **`INACTIVE`** (pausado tras 10
  días sin uso): producción caída de facto, aunque `/login` devolvía 200 por estar
  prerenderizado. Restaurado a `ACTIVE_HEALTHY` con los datos íntegros.
- Criterios de aceptación:
  - [ ] Comprobar el estado del proyecto **antes de cada sesión del estudio SUS**
  - [ ] Valorar si conviene un ping programado (o subir de plan) durante la recolección
- Estado: Pendiente

### T-021 · Re-evaluación heurística de la UI rediseñada

- Depende de: T-018
- Criterios de aceptación:
  - [ ] Nielsen + recorrido cognitivo sobre login, inicio (tablero), catálogo por áreas y shell azul
  - [ ] **Contraste AA verificado** en texto claro sobre el degradado azul→índigo
  - [ ] `docs/evaluacion-usabilidad.md` actualizado a las pantallas actuales
- Estado: Pendiente

### T-022 · Recolección del SUS real

- Depende de: T-021 (medir antes de re-evaluar invalidaría el resultado)
- Criterios de aceptación:
  - [ ] 5–8 participantes (≥1 bibliotecario/a) con el kit `docs/sus-kit/`
  - [ ] Tabla real pegada en `docs/evaluacion-usabilidad.md` §4.3, sustituyendo el piloto simulado
  - [ ] SUS ≥ 75 y ≥ 90 % de tareas críticas sin ayuda (si no, corregir severidad ≥3 y re-medir)
  - [ ] CSV de respuestas **no comiteado** (Ley 29733)
- Estado: Bloqueado por T-021

### T-023 · Alinear especificaciones con la política de préstamo 2+1

- Depende de: —
- Criterios de aceptación:
  - [ ] `docs/especificaciones.md` §7.2.2 y §7.2.5 describen préstamo de 2 días + 1 ampliación de 1 día
  - [ ] Glosario y copy revisados ("renovación" → "ampliación")
- Estado: Pendiente

---

## Generar los Issues en GitHub (opcional)

Con el CLI `gh` autenticado y el repo creado, se puede crear un milestone por módulo y un Issue por tarea. Ejemplo por tarea:

```bash
gh issue create --title "T-005 [B] Listado, búsqueda y filtros" \
  --body "Depende de: T-004. Ver docs/backlog.md y docs/guia_desarrollo.md F2.1" \
  --label "modulo-B" --milestone "B — Catálogo"
```

Sugerencia: usar `gh project` para crear el board con columnas Disponible → En progreso → Review → Done y añadir los Issues. Mantener `progreso/tablero-equipo.md` como espejo rápido de módulos.
