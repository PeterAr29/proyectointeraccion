import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Banner de mensaje a nivel de formulario (error o éxito), en lenguaje humano.
 * `role="alert"` para que el lector de pantalla lo anuncie. No expone detalles
 * técnicos (A09).
 */
export interface FormAlertProps {
  variant?: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

export function FormAlert({
  variant = "error",
  children,
  className,
}: FormAlertProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-green-200 bg-green-50 text-green-800",
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
