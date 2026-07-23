import type * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Sección de un formulario largo: un título breve, una pista opcional y el
 * contenido. Pensada para vivir dentro de un contenedor con `divide-y`, que le
 * pone un separador arriba a cada sección salvo la primera. Presentacional.
 */
export function FormSection({
  title,
  hint,
  className,
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4 py-6 first:pt-0 last:pb-0", className)}>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
