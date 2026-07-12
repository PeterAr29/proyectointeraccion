import { z } from "zod";

/**
 * Esquema de la configuración de circulación (Módulo E, F5.4). Reutilizado en
 * cliente (react-hook-form) y servidor (Server Action). Política de circulación
 * de BiblioTEC: un préstamo dura como máximo 2 días y solo puede ampliarse 1 vez
 * (1 día más). Los cambios afectan a los préstamos NUEVOS (no retroactivos): la
 * RPC `create_loan` lee `dias_prestamo` al prestar.
 */
export const settingsSchema = z.object({
  diasPrestamo: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser al menos 1 día")
    .max(2, "El préstamo dura como máximo 2 días"),
  multaDiaria: z.coerce
    .number()
    .min(0, "No puede ser negativa")
    .max(1000, "Monto demasiado alto"),
  maxRenovaciones: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativa")
    .max(1, "Solo se permite 1 ampliación"),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
