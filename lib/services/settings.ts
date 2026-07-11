import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Servicio de configuración global (Módulo E, fila única `settings`).
 * De momento solo expone la LECTURA de los parámetros de circulación, que
 * consumen los módulos C (préstamos/renovaciones) y D (multas). La edición
 * (solo bibliotecario) llega en F5.4. Cualquier autenticado puede leer settings
 * (RLS `settings_select_authenticated`). Ante error o fila ausente se devuelven
 * los valores por defecto del §7.2 para no romper los flujos que dependen de ella.
 */

export type Settings = Database["public"]["Tables"]["settings"]["Row"];

export interface CirculationSettings {
  diasPrestamo: number;
  multaDiaria: number;
  maxRenovaciones: number;
}

/** Valores por defecto del dominio (docs/especificaciones.md §7.2). */
export const DEFAULT_CIRCULATION_SETTINGS: CirculationSettings = {
  diasPrestamo: 14,
  multaDiaria: 1.0,
  maxRenovaciones: 2,
};

export async function getCirculationSettings(): Promise<CirculationSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("dias_prestamo, multa_diaria, max_renovaciones")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_CIRCULATION_SETTINGS;
  return {
    diasPrestamo: data.dias_prestamo,
    multaDiaria: data.multa_diaria,
    maxRenovaciones: data.max_renovaciones,
  };
}

/**
 * Actualiza la configuración de circulación (fila única id=1). Solo el
 * bibliotecario (RLS `settings_update_librarian`); la Server Action revalida el
 * rol. Los cambios afectan a los préstamos NUEVOS, no a los ya emitidos: la RPC
 * `create_loan` lee `dias_prestamo` en el momento de prestar. Escritura con
 * `update` sobre el singleton (creado en el seed).
 */
export async function updateCirculationSettings(
  input: CirculationSettings,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      dias_prestamo: input.diasPrestamo,
      multa_diaria: input.multaDiaria,
      max_renovaciones: input.maxRenovaciones,
    })
    .eq("id", 1);
  return { ok: !error };
}
