import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Campo de texto base del sistema de diseño.
 * `aria-invalid` pinta el borde de error; el foco visible AA viene de globals.css.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-destructive",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
