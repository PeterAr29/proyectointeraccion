# Handoff — F5.3 Préstamos, devoluciones y multas (Módulo E)

**Fecha:** 2026-07-11 · **Dev:** integrador · **Estado:** ✅ Completada · **Módulo:** E (Administración) · **Siguiente:** F5.4 (Reportes y configuración, última de la Fase 5)

## Qué quedó hecho

El bibliotecario ve la circulación de **todos** los usuarios y opera sobre ella:
registra devoluciones (con cálculo de multa integrado) y marca multas como
pagadas. Tres rutas bajo el layout `(admin)`, cada una con sus 4 estados.

### `/prestamos` — vista global (solo lectura)

Todos los préstamos de la biblioteca (RLS de bibliotecario), con **filtro por
estado efectivo** (todos/activos/vencidos/devueltos) vía query param. Tabla
presentacional (Server Component) con Usuario/Libro/Estado/Prestado/Devolución.

### `/devoluciones` — registrar devolución (multa integrada)

Lista los préstamos **pendientes de devolver** de todos los usuarios, con la
**multa estimada a hoy** por fila. Al registrar (con confirmación que advierte el
monto si hay retraso), el servidor orquesta:

1. `syncFineForLoan` (Módulo D) — si está vencido, **congela** los días de
   retraso y crea la multa `pendiente` (+ aviso) **antes** de devolver.
2. `returnLoan` (RPC `return_loan`) — marca la devolución y **repone stock**.
   El orden importa: `syncFineForLoan` ignora préstamos ya devueltos, así que la
   multa se calcula antes. El toast informa el monto generado.

### `/multas` — gestión de multas

Todas las multas (filtro todas/pendientes/pagadas), con Usuario/Libro/Retraso/
Monto/Estado. El bibliotecario **marca pagada** (confirmación). Escritura por
`fines.markFinePaid` (RLS `fines_update_librarian`).

### Verificaciones (todas en verde)

| Check                          | Resultado                                     |
| ------------------------------ | --------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                   |
| `npm run lint`                 | Sin errores ni warnings                       |
| `npm run build`                | OK (`/prestamos`, `/devoluciones`, `/multas`) |
| `npm run test -- --run`        | **125/125** (8 nuevos + 117 previos)          |
| `npm audit --audit-level=high` | **exit 0**                                    |
| Devolución+multa+RLS (remoto)  | **verificado con rollback** — abajo           |

**End-to-end (remoto, con `rollback`, seed intacto):**

- El **bibliotecario devuelve el préstamo vencido de María** (`return_loan`):
  queda `devuelto`, con `fecha_devolucion_real`, y el **stock se repone** (2→3,
  ≤ total). La RPC acepta owner o bibliotecario (diseñada así en F3.2).
- El **bibliotecario marca una multa como pagada** (`pendiente`→`pagada`).
- Un **estudiante NO puede** marcar multas pagadas (0 filas afectadas — RLS
  `fines_update_librarian`).

## Interfaz nueva (fronteras)

- `lib/services/loans-admin.ts` (módulo C): `listAllLoansWithBooks`,
  `getLoansWithBooksByIds`, `registerReturn` (orquesta multa→devolución),
  puros `buildAdminLoanRows`, `buildReturnRows`, `estimateReturnFine`.
- `lib/services/fines-admin.ts` (módulo D): `listAllFines`, puro
  `buildAdminFineRows`.
- Reutiliza sin cambios: `loans.returnLoan`/`fines.syncFineForLoan`/
  `fines.markFinePaid`/`settings.getCirculationSettings`/`users.getProfilesByIds`.

## Archivos nuevos / tocados

```
lib/services/loans-admin.ts (+test) · lib/services/fines-admin.ts (+test)
app/(admin)/prestamos/{page,loading,AdminLoansTable}.tsx
app/(admin)/devoluciones/{page,loading,actions,ReturnsList}.tsx
app/(admin)/multas/{page,loading,actions,FinesAdminList}.tsx
components/layout/nav.ts (Préstamos enabled + Devoluciones + Multas)
```

**Sin migración nueva:** F5.3 reusa el esquema y las RPC existentes.

## Decisiones no triviales

1. **Devolución integra la multa en el servidor** (`registerReturn`): calcula la
   multa **antes** de devolver (si no, `syncFineForLoan` la ignoraría por estar ya
   devuelto). La multa queda con los días congelados a la fecha de devolución.
2. **Reutiliza la RPC `return_loan`** (acepta bibliotecario), sin duplicar la
   lógica atómica de reponer stock.
3. **Tres rutas separadas** (préstamos read-only / devoluciones acción /
   multas) en vez de una sola, alineadas con la guía y con nav propio.
4. **Estimación de multa pura** (`estimateReturnFine`/`buildReturnRows`) calculada
   en el servidor y pasada a la UI, para no arrastrar código server al cliente.
5. **Cálculo de multa reutiliza** `computeDaysOverdue`/`computeFineAmount` (F4.1),
   sin reimplementar la regla §7.2.4.

## TODOs / deudas que hereda F5.4

- [ ] **F5.4 (última de la Fase 5)**: reportes (préstamos por periodo, más
      prestados, multas — export CSV) + `/configuracion` (editar `dias_prestamo`,
      `multa_diaria`, `max_renovaciones` con `settings.ts`, solo bibliotecario;
      RLS `settings_update_librarian` ya lista). Cambios no retroactivos.
- [ ] `/prestamos` y `/multas` no paginan (decenas de filas en el piloto). Añadir
      búsqueda/paginación admin si el volumen crece.
- [ ] **Sin e2e de admin** todavía (verificado con RLS + rollback y tests puros).
      Añadir en F6: registrar devolución con multa, marcar pagada.
- [ ] Deudas previas vigentes (F5.2/F5.1/F4): correo de usuario no editable,
      limpieza de portadas huérfanas, generación de notificaciones/multas en
      render (→ job programado), `next lint` deprecado, vuln low
      `@supabase/auth-js`, Playwright install en CI, Leaked Password Protection.
