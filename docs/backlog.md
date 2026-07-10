# Backlog — BiblioTEC

> Tareas mapeadas desde las subfases de `docs/guia_desarrollo.md`. Una tarea está **Disponible** solo si sus dependencias están Terminadas. Cada dev toma tareas disponibles de cualquier módulo no bloqueado, sin invadir un módulo que otro tiene *En progreso*.

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

## Generar los Issues en GitHub (opcional)

Con el CLI `gh` autenticado y el repo creado, se puede crear un milestone por módulo y un Issue por tarea. Ejemplo por tarea:

```bash
gh issue create --title "T-005 [B] Listado, búsqueda y filtros" \
  --body "Depende de: T-004. Ver docs/backlog.md y docs/guia_desarrollo.md F2.1" \
  --label "modulo-B" --milestone "B — Catálogo"
```

Sugerencia: usar `gh project` para crear el board con columnas Disponible → En progreso → Review → Done y añadir los Issues. Mantener `progreso/tablero-equipo.md` como espejo rápido de módulos.
