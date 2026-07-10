import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Etiqueta de formulario del sistema de diseño.
 * Accesibilidad AA: cada input debe tener su <Label htmlFor> asociado.
 */
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 block text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";
