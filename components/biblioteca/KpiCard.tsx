import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Tarjeta de KPI del dashboard de administración (Módulo E, F5.1).
 * Presentacional (Server Component): muestra un indicador con su icono, etiqueta
 * y valor. Si el valor es `null` (la consulta falló) muestra un guion en lugar
 * de romper la vista — así un KPI caído no tumba el resto del panel.
 */
export type KpiTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "forest"
  | "burgundy"
  | "teal";

/**
 * Acento del icono: fondo suave + color del token (contraste AA). Usa la paleta
 * académica del sistema (globals.css) en lugar de colores sueltos de Tailwind,
 * para que los KPIs sean coherentes con la marca y las áreas del catálogo.
 */
const TONE_CLASSES: Record<KpiTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  gold: "bg-gold-soft text-gold",
  forest: "bg-forest-soft text-forest",
  burgundy: "bg-burgundy-soft text-burgundy",
  teal: "bg-teal-soft text-teal",
};

/** Color de la barra de acento lateral, por tono. */
const BAR_CLASSES: Record<KpiTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  gold: "bg-gold",
  forest: "bg-forest",
  burgundy: "bg-burgundy",
  teal: "bg-teal",
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
    <div className="relative flex items-center gap-4 overflow-hidden rounded-lg border bg-card p-5 pl-6">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1.5", BAR_CLASSES[tone])}
      />
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
