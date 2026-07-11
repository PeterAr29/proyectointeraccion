# Handoff — F3.2 Circulación: Mis préstamos (renovar/devolver/vencidos) (Módulo C)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** C (Circulación) · **Siguiente:** F3.3 (Historial)

## Qué quedó hecho

Nueva ruta **`/mis-prestamos`**: el estudiante ve sus préstamos activos y
vencidos y puede **renovar** y **devolver**, con confirmación obligatoria.

- **Tabla responsive** (`LoanTable`): columnas Libro (enlaza al detalle), Estado
  (StatusBadge Activo/Vencido/Devuelto), Devolución, Renovaciones ("x de N") y
  Acciones. Bajo 768px hace **scroll horizontal** (RNF-05).
- **Estado efectivo derivado en lectura** (`effectiveLoanStatus`): un préstamo
  activo cuya `fecha_devolucion_estimada` ya pasó se muestra **Vencido** sin
  depender de un `estado` persistido que pudiera quedar desactualizado (§7.2.3).
- **Renovar** (RF-C04): recalcula la fecha (hoy + `dias_prestamo`), incrementa
  `renovaciones`. Se **deshabilita con tooltip** si la regla §7.2.5 lo impide
  (máximo alcanzado o multa pendiente). La RPC revalida lo mismo en BD.
- **Devolver** (RF-C05): marca `fecha_devolucion_real`, pasa a `devuelto` y
  **repone el stock** de forma atómica; confirmación obligatoria.
- **Cuatro estados**: carga (`loading.tsx` con `TableRowSkeleton`), error
  (ErrorState), vacío ("No tienes préstamos activos" + CTA al catálogo) y datos.
- **Nav "Mis préstamos" activado** (`components/layout/nav.ts`).

### Verificaciones (todas en verde)

| Check                          | Resultado                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                           |
| `npm run lint`                 | Sin errores ni warnings                               |
| `npm run build`                | OK (`/mis-prestamos` dinámica ƒ)                      |
| `npm run test -- --run`        | **68/68** (12 nuevos + 56 previos)                    |
| `npm audit --audit-level=high` | **exit 0**                                            |
| RPC end-to-end (remoto)        | **verificado con rollback** (no muta el seed) — abajo |

**Verificación transaccional contra el remoto (`bibliotec`, con `rollback`)**,
impersonando a María sobre su préstamo del seed (Redes):

- `renew_loan` → `renovaciones` **0 → 1**, `estado` activo, fecha **hoy + 14**.
- `return_loan` → `estado` devuelto, `fecha_devolucion_real` seteada, stock de
  Redes **2 → 3** (reposición atómica, leída en sentencia aparte).
- SQLSTATE: **BT100** (renovar inexistente/ajeno/devuelto), **BT101** (máximo de
  renovaciones), **BT200** (devolver inexistente). Todo revertido; seed intacto.

## Interfaz añadida a `lib/services/loans.ts` (frontera del módulo C)

- `listOwnLoansWithBooks(includeReturned = false): Promise<LoanWithBook[] | null>`
  — préstamos del usuario con su libro (dos pasos loans→books, como favoritos).
  `false` = activos/vencidos ("Mis préstamos"); `true` = todo (**lo usa F3.3**).
  `null` = error (→ ErrorState); `[]` = sin préstamos (→ EmptyState).
- `renewLoan(loanId): Promise<RenewResult>` — delega en RPC `renew_loan`.
  `reason ∈ {not-renewable, limit-reached, pending-fine, no-session, error}`.
- `returnLoan(loanId): Promise<ReturnResult>` — delega en RPC `return_loan`.
  `reason ∈ {not-returnable, no-session, error}`.
- **Puro/testeable:** `effectiveLoanStatus(loan)`, `canRenew(loan, max,
hasPendingFine)` (→ `{allowed, reason}`), `mergeLoansWithBooks(loans, books)`,
  `mapRenewError`, `mapReturnError`.
- Tipos: `LoanWithBook`, `LoanBook` (id/titulo/autor), `RenewBlockReason`.

**`lib/services/settings.ts` (nuevo):** `getCirculationSettings()` →
`{ diasPrestamo, multaDiaria, maxRenovaciones }`, con
`DEFAULT_CIRCULATION_SETTINGS` de fallback. Lectura para cualquier autenticado
(RLS). Lo reusará D (multa_diaria) y E (F5.4, edición).

**`lib/validations/circulation.ts`:** `parseLoanId` (UUID).

### RPC (SQLSTATE → motivo)

| SQLSTATE | return_loan    | renew_loan    |
| -------- | -------------- | ------------- |
| BT000    | no-session     | no-session    |
| BT200    | not-returnable | —             |
| BT100    | —              | not-renewable |
| BT101    | —              | limit-reached |
| BT102    | —              | pending-fine  |

## Archivos nuevos / tocados

```
supabase/migrations/20260710140000_loan_return_renew.sql · RPC return_loan/renew_loan (APLICADA al remoto)
lib/supabase/database.types.ts        · (editado) +Functions.return_loan / renew_loan
lib/services/loans.ts                 · (editado) +estado efectivo, canRenew, merge, list/renew/return
lib/services/loans.test.ts            · (editado) +12 tests
lib/services/settings.ts              · getCirculationSettings (nuevo servicio)
lib/validations/circulation.ts        · (editado) +parseLoanId
lib/validations/circulation.test.ts   · (editado) +test parseLoanId
components/biblioteca/LoanTable.tsx    · tabla responsive (server, reutilizable en historial)
components/biblioteca/LoanRowActions.tsx · acciones por fila (client, confirmación + diálogos)
app/(app)/mis-prestamos/page.tsx       · página (4 estados)
app/(app)/mis-prestamos/loading.tsx    · skeleton de tabla
app/(app)/mis-prestamos/actions.ts     · Server Actions renewAction / returnAction
components/layout/nav.ts               · (editado) "Mis préstamos" enabled: true
```

Todos los archivos < 300 líneas (`loans.ts` = 242).

## Decisiones y detalles no triviales

1. **`return_loan`/`renew_loan` aceptan owner O bibliotecario** (`is_librarian()`
   dentro de la RPC): así **F5.3** (admin registra devoluciones) reutiliza la
   misma RPC sin duplicar lógica ni exponer una escritura de stock aparte.
2. **`vencido` no se persiste en F3.2:** se deriva en lectura
   (`effectiveLoanStatus`). Es race-free y evita escrituras durante el render de
   un Server Component. La **persistencia** del estado `vencido` (y la generación
   de la multa) es natural que ocurra en el barrido de **F4.1** (fines). D
   consumirá los vencidos y sus `dias_retraso` con la misma regla de fechas.
3. **`hasPendingFine` cableado pero hoy `false`:** las multas no existen aún
   (Módulo D). La UI pasa `false` a `canRenew`; el **guardián real** de "no
   renovar con multa pendiente" ya está en la RPC `renew_loan` (lee `fines`).
   Cuando F4.1 exponga su checker, se alimenta `canRenew` para reflejarlo en la UI.
4. **Reposición de stock acotada** con `least(cantidad_total, disponible + 1)`:
   respaldo del check `cantidad_disponible <= cantidad_total`.
5. **Advisor (🟡 aceptado):** `return_loan`/`renew_loan` añaden el mismo WARN
   `authenticated_security_definer_function_executable` que `create_loan`/
   `is_librarian`. Intencional; autorizan por `auth.uid()`/`is_librarian()`. Sin
   advisors nuevos de nivel ERROR.

## Handoff a F3.3 (Historial)

- Usar **`listOwnLoansWithBooks(true)`** para el historial completo (incluye
  devueltos) y **reutilizar `LoanTable` con `withActions={false}`** (ya soporta
  la columna "Devuelto el …" y oculta acciones). Falta el **filtro por estado y
  rango de fechas** y la paginación (F3.3).
- Todo por `loans.ts` (RLS garantiza que solo ve lo suyo). Solo lectura.

## TODOs / deudas que hereda F3.3 / F4

- [ ] **Persistir `estado='vencido'`** y generar multa: en F4.1 (barrido de
      vencidos con `fines.ts`). Hoy el vencido es derivado en lectura.
- [ ] **Cablear el checker de multa pendiente** de D en `canRenew` (hoy `false`).
- [ ] **e2e de circulación** (préstamo→renovar→devolver): aún sin e2e por mutar
      estado compartido del remoto; conviene `afterEach`/seed reset antes de CI.
      Las 4 RPC ya se probaron end-to-end con `rollback` (no destructivo).
- [ ] Deudas previas vigentes: `next lint` deprecado, vuln low `@supabase/auth-js`,
      `playwright install` en CI, Leaked Password Protection en Supabase Auth.

## Cómo lo prueba el siguiente dev

1. `npm run dev` → login `202100123` / `Biblioteca123` (María).
2. **Mis préstamos** (nav): aparece "Redes de Computadoras" (préstamo del seed).
3. **Renovar** → confirmar → diálogo con la nueva fecha; "Renovaciones" sube a
   "1 de 2". Renueva hasta el máximo → el botón Renovar queda deshabilitado.
4. **Devolver** → confirmar → sale de la lista; en el catálogo, Redes sube su
   disponibilidad (reposición).
5. Presta un libro del catálogo y verás que aparece aquí. `npm run test -- --run`
   → 68/68.
