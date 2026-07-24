import * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Logo de marca de BiblioTEC: un búho (símbolo de sabiduría) posado sobre un
 * libro abierto. Búho minimalista geométrico al estilo de los iconos lucide
 * (trazo de 2px, remates redondeados, `currentColor`), para que combine con el
 * resto de la iconografía y se vea nítido a tamaño pequeño (favicon, sidebar).
 *
 * SVG 100% autocontenido: no carga imágenes externas (compatible con la CSP).
 * Al usar `currentColor`, hereda el color del texto: blanco sobre el sidebar
 * azul, azul sobre fondo claro. Decorativo por defecto (`aria-hidden`); si es
 * el único elemento que nombra la marca, pásale un `title`.
 */
export interface OwlLogoProps extends React.SVGProps<SVGSVGElement> {
  /** Nombre accesible. Si se omite, el icono es decorativo (aria-hidden). */
  title?: string;
}

export function OwlLogo({ className, title, ...props }: OwlLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-6 w-6", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {/* Orejas / plumeros */}
      <path d="M8.2 4.9 6.6 2.9" />
      <path d="M15.8 4.9 17.4 2.9" />
      {/* Cara y cuerpo del búho */}
      <path d="M12 3.6c-3.5 0-6 2.5-6 6 0 3.5 2.5 6 6 6s6-2.5 6-6c0-3.5-2.5-6-6-6Z" />
      {/* Ojos grandes (rasgo característico) */}
      <circle cx="9.6" cy="9.2" r="1.5" />
      <circle cx="14.4" cy="9.2" r="1.5" />
      {/* Pico */}
      <path d="M11 11.6 12 13l1-1.4" />
      {/* Libro abierto sobre el que está posado */}
      <path d="M12 18.6c-1.9-1.3-4.4-1.3-6.9-.9V15.3c2.5-.4 5-.4 6.9.9" />
      <path d="M12 18.6c1.9-1.3 4.4-1.3 6.9-.9V15.3c-2.5-.4-5-.4-6.9.9" />
      <path d="M12 18.6V21" />
    </svg>
  );
}
