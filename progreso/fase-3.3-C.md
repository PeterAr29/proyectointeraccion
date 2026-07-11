# Handoff — F3.3 Circulación: Historial (Módulo C) — cierra la Fase 3

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** C (Circulación) · **Siguiente:** Fase 4 (Módulo D, Multas & Notificaciones) · **Cierra la Fase 3**

## Qué quedó hecho

Nueva ruta **`/historial`**: el historial **completo** de préstamos del usuario
(activos, vencidos y devueltos) con **filtro por estado y rango de fechas** y
paginación. Solo lectura.

- **Reusa `LoanTable` con `withActions={false}`** (ya trae la columna
  "Devuelto el …" y oculta renovar/devolver). Estado mostrado por
  `effectiveLoanStatus` (mismo criterio que Mis préstamos).
- **Filtros por URL** (`<form method="get">`, Server Component, sin JS de
  cliente): estado (Todos/Activo/Vencido/Devuelto) y rango `desde`/`hasta`
  (`<input type="date">`). Fechas mostradas DD/MM/AAAA (RNF-08).
- **Filtro por estado EFECTIVO**: coincide con la insignia que ve el usuario
  (un préstamo activo cuya fecha ya venció cuenta como "Vencido"), no con el
  `estado` crudo de la BD.
- **Paginación** (`HISTORY_PAGE_SIZE = 10`) que preserva los filtros en la URL.
- **Cuatro estados**: carga (`loading.tsx`), error, vacío (distingue "sin
  historial" de "sin resultados para el filtro") y datos.
- **Nav "Historial" activado** (`components/layout/nav.ts`).

### Verificaciones (todas en verde)

| Check                          | Resultado                                        |
| ------------------------------ | ------------------------------------------------ |
| `npx tsc --noEmit`             | Sin errores                                      |
| `npm run lint`                 | Sin errores ni warnings                          |
| `npm run build`                | OK (`/historial` dinámica ƒ)                     |
| `npm run test -- --run`        | **79/79** (11 nuevos + 68 previos)               |
| `npm audit --audit-level=high` | **exit 0**                                       |
| Ruta de datos (remoto)         | RLS OK: María ve solo su préstamo (join a books) |

## Interfaz añadida (lógica pura, en `lib/services/loans.ts`)

- `filterLoanHistory(items, { estado, desde, hasta })` — filtra por estado
  efectivo y rango de fechas de préstamo (día completo; fecha inválida se ignora).
- `paginateList<T>(items, page, pageSize?)` → `Paged<T>` — pagina en memoria una
  lista ya filtrada, acotando la página al total real. `HISTORY_PAGE_SIZE = 10`.
- **Datos:** se reusa `listOwnLoansWithBooks(true)` (F3.2) para traer TODO el
  historial (incluidos devueltos); el filtro y la paginación son en memoria
  (escala piloto, RLS acota a lo propio — decenas de filas).

`lib/validations/circulation.ts`: `parseHistoryFilters` (tolerante),
`historyFiltersSchema`, `HISTORY_ESTADOS`, `hasActiveHistoryFilters`.

## Archivos nuevos / tocados

```
app/(app)/historial/page.tsx           · historial (4 estados, filtros, paginación)
app/(app)/historial/loading.tsx        · skeleton de tabla
app/(app)/historial/HistoryFilters.tsx · form GET (estado + rango de fechas)
app/(app)/historial/Pagination.tsx     · paginación que preserva filtros
lib/services/loans.ts                  · (editado) +filterLoanHistory, paginateList, Paged, HISTORY_PAGE_SIZE
lib/services/loans.test.ts             · (editado) +filtro/paginación (7 tests)
lib/validations/circulation.ts         · (editado) +filtros de historial
lib/validations/circulation.test.ts    · (editado) +parseHistoryFilters (4 tests)
components/layout/nav.ts               · (editado) "Historial" enabled: true
```

`lib/services/loans.ts` = 297 líneas (bajo el límite de ~300; si Módulo D/E
necesitan añadir más aquí, conviene extraer la lógica pura a un `loans-logic.ts`).

## Decisiones no triviales

1. **Filtro/paginación en memoria** (no en la BD): el estado "vencido" es
   derivado (no persistido, ver F3.2), así que filtrar por estado en SQL sería
   inconsistente con la insignia. A escala piloto, traer todo lo propio y filtrar
   en memoria es simple y correcto. Si el volumen creciera, se persistiría
   "vencido" (F4.1) y se movería el filtro a la consulta.
2. **Rango por `fecha_prestamo`**: el filtro de fechas acota por cuándo se hizo
   el préstamo (lo más intuitivo para "historial").
3. **Solo lectura, sin lógica de admin** (regla de la subfase): el bibliotecario
   verá el historial global desde el Módulo E (F5.3), no desde aquí.

## Hito de la Fase 3 — verificado

Flujo completo de circulación, sin mocks, contra el remoto:

- **Prestar** un libro disponible baja el stock (`create_loan`, atómico) ·
  **sin stock** se ofrece **reservar** (`create_reservation`) · **renovar**
  recalcula la fecha y respeta el máximo (`renew_loan`) · **devolver** repone el
  stock (`return_loan`). Todo verificado end-to-end con `rollback` (F3.1/F3.2).
- El usuario ve sus préstamos en **Mis préstamos** e **Historial** (RLS: solo lo
  suyo — confirmado por consulta). **La Fase 3 (Circulación) queda cerrada.**

## Handoff a Fase 4 (Módulo D — Multas & Notificaciones)

- **Vencidos para multas (F4.1):** hoy "vencido" se **deriva** con
  `effectiveLoanStatus` (regla: `fecha_devolucion_estimada < hoy` sin
  `fecha_devolucion_real`). D debe **persistir** `estado='vencido'` y calcular
  `dias_retraso` (p. ej. `daysBetween(fecha_devolucion_estimada, hoy)`), y con
  `multa_diaria` de `getCirculationSettings()` generar la `fine` (§7.2.4).
- **Checker de multa pendiente:** F4.1 debe exponer un checker que alimente
  `canRenew(loan, max, hasPendingFine)` (hoy la UI pasa `false`; la RPC
  `renew_loan` ya bloquea en BD leyendo `fines`).
- **Notificaciones (F4.2):** enganchar `reserva_disponible` cuando un libro
  reservado vuelve a tener stock (ocurre en `return_loan`), `vencimiento_proximo`
  y `multa_generada`; y cablear el contador de la campana del Topbar (Módulo A).
- **Servicios que consume D:** `loans.ts` (vencidos), `reservations.ts`
  (reservas activas por libro), `settings.ts` (`multa_diaria`).

## TODOs / deudas que hereda la Fase 4

- [ ] **Persistir `estado='vencido'`** y generar multa (F4.1).
- [ ] **Cablear el checker de multa pendiente** de D en `canRenew` (hoy `false`).
- [ ] **e2e de circulación** (prestar→renovar→devolver→ver en historial): sin e2e
      aún por mutar estado compartido del remoto; conviene `afterEach`/seed reset.
      Las 4 RPC ya se probaron end-to-end con `rollback`.
- [ ] Si `loans.ts` necesita crecer (D/E), extraer la lógica pura a `loans-logic.ts`.
- [ ] Deudas previas vigentes: `next lint` deprecado, vuln low `@supabase/auth-js`,
      `playwright install` en CI, Leaked Password Protection en Supabase Auth.

## Cómo lo prueba el siguiente dev

1. `npm run dev` → login `202100123` / `Biblioteca123` (María).
2. **Historial** (nav): aparece "Redes de Computadoras" (préstamo del seed).
3. Filtra por **Estado = Devuelto** → vacío ("sin resultados"); por **Activo** →
   aparece. Prueba un rango de fechas que lo incluya/excluya.
4. Presta y devuelve libros del catálogo y verás cómo crece el historial.
5. `npm run test -- --run` → 79/79.
