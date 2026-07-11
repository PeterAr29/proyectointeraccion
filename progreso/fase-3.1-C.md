# Handoff — F3.1 Circulación: reservas y préstamos (Módulo C)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** C (Circulación) · **Siguiente:** F3.2 (Mis préstamos)

## Qué quedó hecho

El detalle del libro (`/catalogo/[id]`) ya **presta y reserva de verdad**, con
confirmación obligatoria y estados de éxito/error claros:

- **Prestar** (si `cantidad_disponible > 0`): registra el préstamo, calcula
  `fecha_devolucion_estimada = hoy + dias_prestamo` (de `settings`, 14 por
  defecto) y **decrementa el stock de forma atómica**. Muestra diálogo de éxito
  con la fecha de devolución.
- **Reservar** (si no hay stock): crea una `reservation` en estado `activa` y
  **estima la disponibilidad** con la devolución más próxima entre los préstamos
  activos del libro. Diálogo de éxito con la fecha estimada.
- **Carrera de stock:** si alguien toma el último ejemplar entre que se pinta la
  vista y se pulsa "Prestar", la acción devuelve `no-stock` y la UI **ofrece
  reservar** en el acto (RF-C01).
- **Botón F2.2 reemplazado:** el `<button disabled>` con tooltip pasó a
  `components/biblioteca/LoanActions.tsx` (client), que orquesta los diálogos.

### Verificaciones (todas en verde)

| Check                          | Resultado                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                           |
| `npm run lint`                 | Sin errores ni warnings                               |
| `npm run build`                | OK                                                    |
| `npm run test -- --run`        | **56/56** (19 nuevos + 37 previos)                    |
| `npm audit --audit-level=high` | **exit 0** (solo low/moderate; ver deudas)            |
| RPC end-to-end (remoto)        | **verificado con rollback** (no muta el seed) — abajo |

**Verificación transaccional contra el remoto (`bibliotec`, con `rollback`):**
impersonando a María (`role authenticated` + `request.jwt.claims.sub`):

- `create_loan('Algoritmos')` → stock **3 → 2** (decremento atómico correcto).
- `create_reservation('Inteligencia Artificial')` (stock 0) → reserva `activa`.
- SQLSTATE de negocio: **BT001** (sin stock), **BT002** (doble préstamo del mismo
  libro — María ya tiene "Redes"), **BT003** (reservar con stock), **BT404**
  (libro inexistente). Todo revertido: seed intacto (stock 3/0, 1 loan, 0 res.).

## Arquitectura del flujo transaccional (lo importante)

```
LoanActions (client)  →  Server Action (borrow/reserveAction)  →  service  →  RPC Postgres
  confirmación            revalida UUID en servidor              única puerta   atómica + RLS-bypass controlado
```

**Por qué RPC y no dos statements desde el service:**

1. **Atomicidad (§2.3):** `create_loan` hace `select … for update` sobre la fila
   del libro, valida stock, inserta el loan y decrementa `cantidad_disponible`
   en una sola transacción → **imposible vender el último ejemplar dos veces**.
2. **RLS:** el estudiante **no puede** actualizar `books` (política solo del
   bibliotecario). Las RPC son `SECURITY DEFINER` (owner con BYPASSRLS) para
   poder tocar el stock; la autorización real la dan los **checks explícitos por
   `auth.uid()`** dentro de cada función, no la RLS.

**Garantías de BD añadidas:** índices únicos parciales
`loans_one_active_per_user_book` y `reservations_one_active_per_user_book`
(un activo por usuario/libro), respaldo del check ante concurrencia.

## Interfaz de servicios (frontera del módulo C)

### `lib/services/loans.ts` — ÚNICA puerta a `loans`

- `borrowBook(bookId): Promise<BorrowResult>` — `{ ok:true, loan }` o
  `{ ok:false, reason }` con `reason ∈ {no-stock, already-loaned, not-found,
no-session, error}`. Delega en la RPC `create_loan`.
- `listOwnLoans(estado?): Promise<Loan[] | null>` — préstamos del usuario (RLS).
  Listo para que **F3.2** construya "Mis préstamos".
- Puro/testeable: `computeDueDate(from, dias)`, `mapCreateLoanError(code)`.

### `lib/services/reservations.ts` — ÚNICA puerta a `reservations`

- `reserveBook(bookId): Promise<ReserveResult>` — `reason ∈ {has-stock,
already-reserved, not-found, no-session, error}`. Delega en `create_reservation`.
- `listOwnReservations(estado?): Promise<Reservation[] | null>`.
- Puro/testeable: `mapCreateReservationError(code)`.

### `lib/validations/circulation.ts`

- `parseBookId(value)` — UUID o `null` (no confía en la URL cruda).
- `isDueDateValid(value)` / `dueDateSchema` — regla §7.2.2 (fecha no anterior a
  hoy). Hoy cuenta como válido. **Lo consumirá F3.2** al renovar.

### RPC (SQLSTATE → motivo)

| SQLSTATE | Significado                        | loans          | reservations     |
| -------- | ---------------------------------- | -------------- | ---------------- |
| BT000    | sin sesión (`auth.uid()` null)     | no-session     | no-session       |
| BT404    | libro inexistente                  | not-found      | not-found        |
| BT001    | sin stock                          | no-stock       | —                |
| BT002    | ya tiene préstamo activo del libro | already-loaned | —                |
| BT003    | hay stock (prestar, no reservar)   | —              | has-stock        |
| BT004    | ya tiene reserva activa del libro  | —              | already-reserved |

## Archivos nuevos / tocados

```
supabase/migrations/20260710130000_circulation_rpcs.sql · RPC create_loan/create_reservation + índices únicos (APLICADA al remoto)
lib/supabase/database.types.ts        · (editado) +Functions.create_loan / create_reservation
lib/services/loans.ts                 · servicio de préstamos (borrowBook, listOwnLoans, puros)
lib/services/loans.test.ts            · tests (computeDueDate, mapCreateLoanError)
lib/services/reservations.ts          · servicio de reservas (reserveBook, listOwnReservations, puro)
lib/services/reservations.test.ts     · tests (mapCreateReservationError)
lib/validations/circulation.ts        · Zod (parseBookId, isDueDateValid, dueDateSchema)
lib/validations/circulation.test.ts   · tests (parseBookId, isDueDateValid, dueDateSchema)
components/biblioteca/LoanActions.tsx  · UI cliente prestar/reservar (confirmación + diálogos)
app/(app)/catalogo/[id]/actions.ts     · Server Actions borrowAction / reserveAction
app/(app)/catalogo/[id]/page.tsx       · (editado) usa <LoanActions>, elimina LoanAction deshabilitado
```

Todos los archivos < 300 líneas.

## Decisiones y detalles no triviales

1. **Pending en el botón, no en el diálogo:** al confirmar, el diálogo se cierra
   y el botón disparador muestra "Prestando…/Reservando…" (`useTransition`).
   Evita doble submit sin bloquear la UI. Tras éxito, `router.refresh()` re-pinta
   el detalle (stock/estado actualizados) y se muestra el diálogo de éxito.
2. **`no-stock` no es un error para el usuario:** es el caso esperado de RF-C01;
   se convierte en la oferta de reservar. `has-stock` al reservar dispara un
   toast informativo + refresh (el libro volvió a tener stock).
3. **Estimación de disponibilidad server-side:** el estudiante no ve préstamos de
   otros (RLS), así que la `min(fecha_devolucion_estimada)` se calcula dentro de
   la RPC `create_reservation` (SECURITY DEFINER).
4. **Advisor de seguridad (🟡 aceptado):** las dos RPC quedan como
   `authenticated_security_definer_function_executable` (misma naturaleza que
   `is_librarian`): son invocables por `authenticated` **a propósito** y
   autorizan por `auth.uid()` internamente. No exponen datos ajenos. Sin
   advisors nuevos de nivel ERROR.

## Handoff a F3.2 (Mis préstamos)

- Consumir **`listOwnLoans(estado?)`** para la tabla de "Mis préstamos"; renovar
  y devolver serán **nuevas RPC** (devolver debe **reponer** el stock de forma
  atómica, simétrico a `create_loan`, y respetar la regla §7.2.5: no renovar si
  está vencido con multa pendiente — el checker de multa lo aporta D en F4.1).
- Reutilizar `dueDateSchema` de `circulation.ts` al recalcular la fecha de
  renovación.
- **Activar el ítem de nav "Mis préstamos"** (`components/layout/nav.ts`,
  `enabled: false` → `true`) cuando exista la ruta `/mis-prestamos`.
- Marcar `vencido` cuando `fecha_devolucion_estimada < hoy` sin devolución (se
  puede hacer al listar, o con una RPC/tarea; F3.2 decide).

## TODOs / deudas que hereda F3.2

- [ ] **e2e de circulación:** no se añadió aún (mutar stock del remoto compartido
      es delicado, como ya se anotó para favoritos). Conviene un `afterEach`/seed
      reset antes de meter e2e de préstamo/reserva en CI. Las RPC ya se probaron
      end-to-end con `rollback` (no destructivo).
- [ ] Deudas previas siguen vigentes: `next lint` deprecado (Next 16), vuln low
      `@supabase/auth-js` (subir `supabase-js` ≥2.110), `playwright install` en CI,
      Leaked Password Protection en Supabase Auth.

## Cómo lo prueba el siguiente dev

1. `npm run dev` → login `202100123` / `Biblioteca123` (María).
2. **Catálogo** → abrir un libro **con stock** → "Prestar" → confirmar → diálogo
   de éxito con fecha; recargar detalle: el stock bajó y el badge lo refleja.
3. Abrir **"Inteligencia Artificial"** (sin stock) → botón "Reservar" → confirmar
   → diálogo de éxito con la fecha estimada.
4. Volver a prestar el mismo libro que ya tienes → toast "Ya tienes un préstamo
   activo de este libro" (BT002).
5. `npm run test -- --run` → 56/56.
