import {
  BriefcaseBusiness,
  HeartPulse,
  Sprout,
  Users2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { AreaLabel } from "@/lib/domain/areas";

/**
 * Estilo visual de cada área del catálogo (Módulo B). Presentacional: vive fuera
 * de `lib/domain/areas.ts` para que el dominio no dependa de iconos ni de clases
 * de Tailwind. Cada área toma un color de la PALETA ACADÉMICA del sistema (azul
 * principal + dorado, verde bosque, burdeos y teal), no colores sueltos, para
 * que la categorización sea coherente con la marca. Las clases son literales
 * (no interpoladas) para que el JIT de Tailwind las detecte.
 */
export interface AreaStyle {
  /** Icono representativo del área. */
  icon: LucideIcon;
  /** Chip: fondo suave + texto del acento (contraste AA). */
  chip: string;
  /** Borde al pasar el cursor sobre la tarjeta. */
  ring: string;
  /** Texto del acento sólido (enlaces, CTA de la tarjeta). */
  accent: string;
  /** Barra de acento superior de la tarjeta. */
  bar: string;
}

export const AREA_STYLE: Record<AreaLabel, AreaStyle> = {
  "Ingeniería y Tecnología": {
    icon: Wrench,
    chip: "bg-primary-soft text-primary",
    ring: "hover:border-primary/40",
    accent: "text-primary",
    bar: "bg-primary",
  },
  "Ciencias Agrarias": {
    icon: Sprout,
    chip: "bg-forest-soft text-forest",
    ring: "hover:border-forest/40",
    accent: "text-forest",
    bar: "bg-forest",
  },
  "Ciencias de la Salud": {
    icon: HeartPulse,
    chip: "bg-burgundy-soft text-burgundy",
    ring: "hover:border-burgundy/40",
    accent: "text-burgundy",
    bar: "bg-burgundy",
  },
  "Ciencias Empresariales": {
    icon: BriefcaseBusiness,
    chip: "bg-gold-soft text-gold",
    ring: "hover:border-gold/40",
    accent: "text-gold",
    bar: "bg-gold",
  },
  "Ciencias Sociales": {
    icon: Users2,
    chip: "bg-teal-soft text-teal",
    ring: "hover:border-teal/40",
    accent: "text-teal",
    bar: "bg-teal",
  },
};
