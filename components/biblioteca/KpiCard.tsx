import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Tarjeta de KPI del dashboard de administración (Módulo E, F5.1).
 * Presentacional (Server Component): muestra un indicador con su icono, etiqueta
 * y valor. Si el valor es `null` (la consulta falló) muestra un guion en lugar
 * de romper la vista — así un KPI caído no tumba el resto del panel.
 */
export type KpiTone = "primary" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<KpiTone, string> = {
  primary: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number | null;
  /** Color del icono/acento. Por defecto, primario. */
  tone?: KpiTone;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-5">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight">
          {value === null ? (
            <span className="text-muted-foreground" title="No se pudo cargar">
              —
            </span>
          ) : (
            value.toLocaleString("es-PE")
          )}
        </p>
      </div>
    </div>
  );
}
