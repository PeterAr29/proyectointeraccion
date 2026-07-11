# Handoff — F4.1 Multas: cálculo de multas (Módulo D)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** D (Multas & Notificaciones) · **Siguiente:** F4.2 (Motor de notificaciones + vista)

## Qué quedó hecho

`lib/services/fines.ts` (ÚNICA puerta a `fines`) con el cálculo de multas
(§7.2.4: `monto = dias_retraso × multa_diaria`, soles) y la integración con el
Módulo C (no renovar con multa pendiente, §7.2.5).

- **Cálculo puro y probado:** `computeDaysOverdue(fechaEstimada, now)` (días
  completos de retraso, 0 si no vence) y `computeFineAmount(dias, multaDiaria)`
  (redondeo a 2 decimales, sin negativos).
- **Generación por el sistema** (`syncFineForLoan`, cliente admin/service role):
  ante un préstamo vencido, **persiste `estado='vencido'`** en el préstamo y
  **crea/actualiza** su multa `pendiente` con el monto vigente. Respeta las
  `pagada` (no las resucita). Una multa por préstamo (índice único `loan_id`).
- **Sincronización del usuario** (`syncOwnOverdueFines`): detecta los vencidos
  del usuario (RLS) y asegura sus multas. **La vista "Mis préstamos" la invoca**
  antes de listar (idempotente), así el checker de renovación refleja la realidad.
- **Checker para C** (`getPendingFineLoanIds`): ids de préstamos con multa
  pendiente; `LoanTable` los pasa a `canRenew` → el botón **Renovar** se
  deshabilita con tooltip. La RPC `renew_loan` revalida en BD (BT102).
- **Pago listo** (`markFinePaid`): lo registra el bibliotecario en F5.3 (RLS
  `fines_update_librarian`); el estudiante solo lee. `listOwnFines` para lecturas.

### Verificaciones (todas en verde)

| Check                          | Resultado                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                           |
| `npm run lint`                 | Sin errores ni warnings                               |
| `npm run build`                | OK                                                    |
| `npm run test -- --run`        | **86/86** (7 nuevos + 79 previos)                     |
| `npm audit --audit-level=high` | **exit 0**                                            |
| Integración C↔D (remoto)      | **verificado con rollback** (no muta el seed) — abajo |

**Verificación end-to-end (remoto, con `rollback`):** se venció el préstamo del
seed y se generó su multa (dias 3, S/ 3.00). Impersonando a María:

- **La multa es visible para ella** (RLS `fines_select_own`): 1 pendiente.
- **Renovar queda bloqueado por multa pendiente** → SQLSTATE **BT102**.

## Interfaz de `lib/services/fines.ts`

- Puro: `computeDaysOverdue(fechaEstimada, now?)`, `computeFineAmount(dias, multaDiaria)`.
- Lectura (sesión, RLS): `getPendingFineLoanIds(): string[]` (checker para C),
  `listOwnFines(): Fine[] | null`.
- Generación (admin): `syncFineForLoan(loanId, multaDiaria, now?): Fine | null`,
  `syncOwnOverdueFines(multaDiaria, now?): void`.
- Pago: `markFinePaid(fineId): { ok }` (bibliotecario, RLS; se usa en F5.3).

## Archivos nuevos / tocados

```
supabase/migrations/20260710150000_fines_unique_loan.sql · índice único fines(loan_id) (APLICADO al remoto)
lib/services/fines.ts                 · servicio de multas (cálculo, generación, checker, pago)
lib/services/fines.test.ts            · tests del cálculo (0/varios días, redondeo)
components/biblioteca/LoanTable.tsx    · (editado) +prop pendingFineLoanIds → canRenew
app/(app)/mis-prestamos/page.tsx       · (editado) sincroniza multas vencidas + pasa el checker
```

`fines.ts` = 185 líneas.

## Decisiones no triviales

1. **Generación con cliente admin (service role):** la RLS de `fines` solo deja
   escribir al bibliotecario; la multa la genera "el sistema", así que
   `syncFineForLoan` usa `createAdminClient` (server-only). Las **lecturas** del
   estudiante van con su sesión (RLS). Alineado con el comentario de la migración
   de RLS de F1.2.
2. **`estado='vencido'` ahora se persiste** al generar la multa (lo que F3.2
   dejó como derivado). La UI sigue usando `effectiveLoanStatus`, que coincide.
3. **Una multa por préstamo** (índice único `loan_id`): un préstamo se devuelve
   una vez, así que acumula a lo sumo una multa que crece mientras siga vencido.
   `syncFineForLoan` hace buscar-o-crear/actualizar.
4. **Checker en la UI + guardián en BD:** `canRenew` consume `hasPendingFine`
   (UI, deshabilita el botón) y la RPC `renew_loan` revalida (BT102). Defensa en
   profundidad: aunque alguien fuerce la acción, la BD la rechaza.

## Handoff a F4.2 (Motor de notificaciones + vista)

- **`multa_generada`:** cuando `syncFineForLoan` **crea** una multa nueva (no al
  actualizar el monto), generar una notificación `multa_generada`. Conviene que
  `syncFineForLoan` devuelva si la multa fue recién creada, o que F4.2 lo detecte.
- **`reserva_disponible`:** enganchar en `return_loan`/`create_reservation` — al
  devolver un libro con reservas activas, notificar al primero de la cola.
- **`vencimiento_proximo`:** barrido de préstamos por vencer (N días antes).
- **Servicios que consume D-notif:** `fines.ts`, `reservations.ts`, `loans.ts`.
- La campana del Topbar (Módulo A) espera el contador de no-leídas (F4.2).

## TODOs / deudas que hereda F4.2

- [ ] **Generación en render (deuda):** `syncOwnOverdueFines` corre en el render
      (GET) de "Mis préstamos". Es idempotente y sirve para el piloto, pero en
      producción debería moverse a un **job programado** (cron/Edge Function con
      service role) que barra todos los usuarios, no solo al que abre la vista.
- [ ] **Notificar `multa_generada`** al crear la multa (F4.2).
- [ ] **e2e de multa** (vencer→generar→renovar bloqueado): sin e2e aún por mutar
      estado compartido del remoto; ya verificado end-to-end con `rollback`.
- [ ] Deudas previas vigentes (next lint deprecado, vuln low @supabase/auth-js,
      playwright install en CI, Leaked Password Protection en Supabase Auth).

## Cómo lo prueba el siguiente dev

1. Genera un vencido: en `mis-prestamos`, un préstamo cuya
   `fecha_devolucion_estimada` sea pasada → al abrir la vista se le crea la multa
   `pendiente` y el botón **Renovar** queda deshabilitado ("multa pendiente").
2. `npm run test -- --run` → 86/86 (incluye 0 días, varios días y redondeo a 2
   decimales del cálculo de multa).
