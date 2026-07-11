-- ==========================================================================
-- BiblioTEC · F4.1 · Multas: una multa por préstamo (Módulo D)
-- Fuente: docs/especificaciones.md §7.2 (regla 4: multa = dias_retraso × multa_diaria).
--
-- Un préstamo se devuelve una sola vez, así que a lo sumo acumula UNA multa
-- (que va creciendo mientras siga vencido). Esta restricción única evita multas
-- duplicadas del mismo préstamo bajo concurrencia y habilita el patrón
-- "buscar-o-crear" de `lib/services/fines.ts` (que genera la multa con el
-- cliente admin/service role, porque el estudiante no puede escribir en `fines`).
-- ==========================================================================

create unique index fines_loan_id_key on public.fines (loan_id);
