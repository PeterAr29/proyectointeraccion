import { z } from "zod";

/**
 * Esquema de la configuración de circulación (Módulo E, F5.4). Reutilizado en
 * cliente (react-hook-form) y servidor (Server Action). Reglas alineadas con los
 * checks del esquema (§7.2 / init_schema): días de préstamo > 0, multa diaria
 * ≥ 0, renovaciones ≥ 0. Los cambios afectan a los préstamos NUEVOS (no
 * retroactivos): la RPC `create_loan` lee `dias_prestamo` al prestar.
 */
export const settingsSchema = z.object({
  diasPrestamo: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1 día")
    .max(365, "Máximo 365 días"),
  multaDiaria: z.coerce
    .number()
    .min(0, "No puede ser negativa")
    .max(1000, "Monto demasiado alto"),
  maxRenovaciones: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativa")
    .max(20, "Máximo 20 renovaciones"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
