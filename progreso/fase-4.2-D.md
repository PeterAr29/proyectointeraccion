# Handoff — F4.2 Motor de notificaciones + vista (Módulo D)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** D (Multas & Notificaciones) · **Cierra:** Fase 4 (hito M2) · **Siguiente:** F5.1 (Dashboard con KPIs, Módulo E)

## Qué quedó hecho

`lib/services/notifications.ts` (ÚNICA puerta a `notifications`) genera y expone los
avisos in-app de tres tipos, y `/notificaciones` los muestra con sus cuatro
estados. La campana del Topbar (Módulo A) queda cableada con el contador de
no-leídas.

- **Tres tipos generados por el sistema** (cliente admin/service role, porque la
  RLS de `notifications` solo deja INSERT al bibliotecario):
  - **`multa_generada`** — enganchado en `fines.syncFineForLoan`: al **crear** una
    multa nueva (no al actualizar el monto) emite el aviso con el monto en S/. El
    índice único `fines(loan_id)` garantiza que sale una sola vez por préstamo.
  - **`vencimiento_proximo`** — `syncOwnDueSoonNotifications`: barre los préstamos
    activos del usuario (sesión, RLS) y avisa los que vencen dentro de
    `DUE_SOON_THRESHOLD_DAYS` (3 días) y aún no se avisaron. Marca
    `loans.vencimiento_notificado_en` para no repetir.
  - **`reserva_disponible`** — `syncAvailableReservations`: barrido del sistema
    (admin) que recorre las reservas activas sin avisar cuyo libro recuperó stock
    y notifica al **frente de la cola** (por antigüedad) hasta el número de
    ejemplares disponibles. Marca `reservations.notificada_disponible_en`.
- **Idempotencia por marcadores** (migración `..._notification_markers.sql`): dos
  columnas timestamptz nuevas (`loans.vencimiento_notificado_en`,
  `reservations.notificada_disponible_en`). `renew_loan` se re-declaró para
  **reiniciar** el marcador de vencimiento al renovar (nuevo plazo → puede avisar
  otra vez). La multa no necesita marcador (la fila `fines` es su propio guard).
- **Vista `/notificaciones`** (Server Component): dispara los tres barridos antes
  de listar (idempotentes), y muestra los 4 estados (carga `loading.tsx`, error,
  vacío `EmptyState`, con datos). `NotificationList` (client) destaca las
  no-leídas, permite **marcar una** o **todas** como leídas (Server Actions que
  revalidan la ruta) con icono/tono por tipo (metáfora de color).
- **Campana con contador**: el layout `(app)` resuelve `getUnreadCount()` en
  servidor y lo pasa por `AppShell` → `Topbar`; la campana es ahora un `Link` a
  `/notificaciones` con un badge (9+ si excede). Nav "Notificaciones" activado.

### Verificaciones (todas en verde)

| Check                          | Resultado                                             |
| ------------------------------ | ----------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                           |
| `npm run lint`                 | Sin errores ni warnings                               |
| `npm run build`                | OK (`/notificaciones` en las rutas)                   |
| `npm run test -- --run`        | **96/96** (10 nuevos + 86 previos)                    |
| `npm audit --audit-level=high` | **exit 0**                                            |
| RLS de notifications (remoto)  | **verificado con rollback** (no muta el seed) — abajo |

**Verificación end-to-end (remoto, con `rollback`):** el sistema crea un aviso
para María e impersonando por `request.jwt.claims`:

- **María ve el suyo** (`maria_ve=1`, RLS select own) y **puede marcarlo leído**
  (`sin_leer_tras_marcar=0`, RLS update own).
- **Juan NO ve el de María** (`juan_ve=0`, aislamiento entre usuarios).
- Columnas nuevas presentes y `renew_loan` reinicia el marcador (comprobado por
  `pg_get_functiondef`). Seed intacto tras el rollback.

## Interfaz de `lib/services/notifications.ts`

- Puro/testeable: `fineGeneratedMessage`, `dueSoonMessage`,
  `reservationAvailableMessage`, `unreadCount(items)`, `isDueSoon(loan, now?, threshold?)`,
  `DUE_SOON_THRESHOLD_DAYS`.
- Lectura (sesión, RLS): `listOwnNotifications(): Notification[] | null`,
  `getUnreadCount(): number`, `markNotificationRead(id)`, `markAllNotificationsRead()`.
- Generación (admin): `notifyFineGenerated(admin, userId, titulo, monto)` (lo usa
  fines.ts, reusando su cliente admin), `syncOwnDueSoonNotifications(now?)`,
  `syncAvailableReservations(now?)`.

## Archivos nuevos / tocados

```
supabase/migrations/20260710160000_notification_markers.sql · +2 columnas + renew_loan reset (APLICADO al remoto)
lib/services/notifications.ts        · servicio de notificaciones (generación, lectura, marcar leída)
lib/services/notifications.test.ts   · tests puros (mensajes, unreadCount, isDueSoon)
lib/validations/notifications.ts     · parseNotificationId (UUID)
app/(app)/notificaciones/page.tsx    · vista (4 estados) + disparo de barridos
app/(app)/notificaciones/loading.tsx · skeleton
app/(app)/notificaciones/actions.ts  · markReadAction / markAllReadAction
components/biblioteca/NotificationList.tsx · lista client (destacar no-leídas, marcar leída/todas)
lib/services/fines.ts                · (editado) engancha multa_generada al crear la multa; +book_id en el select
lib/supabase/database.types.ts       · (editado) +columnas notificada_disponible_en / vencimiento_notificado_en
lib/services/loans.test.ts           · (editado) fixture con el campo nuevo
components/layout/Topbar.tsx          · (editado) campana = Link + badge de no-leídas
components/layout/AppShell.tsx        · (editado) prop unreadCount → Topbar
app/(app)/layout.tsx                  · (editado) resuelve getUnreadCount en servidor
components/layout/nav.ts              · (editado) "Notificaciones" enabled
```

`notifications.ts` = ~250 líneas.

## Decisiones no triviales

1. **Generación con cliente admin (service role):** igual que las multas de F4.1,
   la RLS solo deja INSERT al bibliotecario; el "sistema" genera con service role
   (server-only). Las lecturas y el marcar-leída del estudiante van con su sesión
   (RLS). `notifyFineGenerated` recibe el cliente admin del llamante (fines.ts)
   para no abrir uno nuevo.
2. **Idempotencia por marcador en la fila origen** (no en `notifications`, que no
   referencia loan/reservation). `vencimiento_notificado_en` se reinicia al
   renovar; `notificada_disponible_en` no (una reserva se avisa una vez).
3. **`reserva_disponible` como barrido global (admin) por antigüedad de cola.**
   Requiere ver reservas de todos los usuarios (RLS no lo permite al estudiante),
   así que corre con admin y respeta el orden `fecha_reserva` sirviendo hasta
   `cantidad_disponible` cupos por libro.
4. **El cliente solo importa TIPOS del service** (no runtime): `NotificationList`
   calcula el conteo inline en vez de importar `unreadCount`, para no arrastrar
   `lib/supabase/server` (next/headers) al bundle del navegador. Mismo patrón que
   `LoanRowActions` con `loans.ts`.
5. **Barridos en el render** (como `syncOwnOverdueFines` de F4.1): idempotentes,
   suficientes para el piloto. Deuda: mover a job programado (abajo).

## Handoff a Fase 5 (Administración, Módulo E)

Los services que consume el admin ya están disponibles y son la única puerta a
cada tabla: `books.ts`, `loans.ts`, `reservations.ts`, `fines.ts`,
`notifications.ts`, `users.ts`, `settings.ts`. Para F5.3 (devoluciones+multas):
`fines.markFinePaid(fineId)` ya está listo (RLS `fines_update_librarian`), y al
registrar una devolución/multa el bibliotecario puede reusar los barridos de D.

## TODOs / deudas que hereda Fase 5/6

- [ ] **Generación en render (deuda de F4.1 + F4.2):** los `sync*` corren en el
      GET de la vista. Idempotentes y válidos para el piloto, pero en producción
      deberían ir a un **job programado** (cron/Edge Function con service role)
      que barra a todos los usuarios, no solo al que abre la vista.
- [ ] **Realtime opcional:** la campana se actualiza al navegar/refrescar (SSR).
      Se puede añadir Supabase Realtime sobre `notifications` para push en vivo.
- [ ] **`reserva_disponible` global en cada render:** cualquier usuario que abra
      `/notificaciones` dispara el barrido global (admin). Fino para decenas de
      filas; con el job programado deja de ser necesario.
- [ ] **e2e de notificaciones** (vencer→avisar / devolver→reserva disponible):
      sin e2e aún por mutar estado compartido del remoto; verificado end-to-end
      con `rollback` (RLS) y con tests puros de la lógica.
- [ ] Deudas previas vigentes: notificaciones por email/push (fuera del MVP; solo
      in-app), next lint deprecado, vuln low `@supabase/auth-js`, playwright
      install en CI, Leaked Password Protection en Supabase Auth.

## Cómo lo prueba el siguiente dev

1. En `/mis-prestamos` o `/notificaciones`, un préstamo cuya
   `fecha_devolucion_estimada` esté dentro de 3 días → aparece un aviso
   `vencimiento_proximo`; uno ya vencido genera la multa y su aviso
   `multa_generada`. El badge de la campana refleja las no-leídas.
2. Reserva un libro sin stock; cuando otro usuario lo devuelva (recupera stock),
   al abrir `/notificaciones` el primero de la cola recibe `reserva_disponible`.
3. "Marcar como leída" / "Marcar todas" bajan el contador (revalida la ruta).
4. `npm run test -- --run` → 96/96 (mensajes, `unreadCount`, `isDueSoon`).
