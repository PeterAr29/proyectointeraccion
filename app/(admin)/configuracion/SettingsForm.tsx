"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { CirculationSettings } from "@/lib/services/settings";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { useToast } from "@/components/feedback/Toast";
import { updateSettingsAction } from "./actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

/**
 * Formulario de configuración de circulación (Módulo E, F5.4). Edita los tres
 * parámetros globales; valida con Zod en cliente y servidor. Aviso explícito de
 * que los cambios afectan a los préstamos NUEVOS (no retroactivos).
 */
export function SettingsForm({ settings }: { settings: CirculationSettings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      diasPrestamo: settings.diasPrestamo,
      multaDiaria: settings.multaDiaria,
      maxRenovaciones: settings.maxRenovaciones,
    },
  });

  const onSubmit = async (values: SettingsInput) => {
    setFormError(null);
    const result = await updateSettingsAction(values);
    if (result.ok) {
      toast("Configuración guardada.", "success");
      router.refresh();
      return;
    }
    setFormError(result.error ?? "No se pudo guardar la configuración.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {formError && <FormAlert>{formError}</FormAlert>}

      <div>
        <Label htmlFor="diasPrestamo">Días de préstamo</Label>
        <Input
          id="diasPrestamo"
          type="number"
          inputMode="numeric"
          min={1}
          max={2}
          aria-invalid={Boolean(errors.diasPrestamo)}
          {...register("diasPrestamo")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Plazo de devolución de un préstamo nuevo (máximo 2 días).
        </p>
        <FieldError message={errors.diasPrestamo?.message} />
      </div>

      <div>
        <Label htmlFor="multaDiaria">Multa diaria (S/)</Label>
        <Input
          id="multaDiaria"
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          aria-invalid={Boolean(errors.multaDiaria)}
          {...register("multaDiaria")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Monto por cada día de retraso.
        </p>
        <FieldError message={errors.multaDiaria?.message} />
      </div>

      <div>
        <Label htmlFor="maxRenovaciones">Máximo de ampliaciones</Label>
        <Input
          id="maxRenovaciones"
          type="number"
          inputMode="numeric"
          min={0}
          max={1}
          aria-invalid={Boolean(errors.maxRenovaciones)}
          {...register("maxRenovaciones")}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Cuántas veces se puede ampliar un préstamo (cada ampliación suma 1
          día; máximo 1).
        </p>
        <FieldError message={errors.maxRenovaciones?.message} />
      </div>

      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Los cambios se aplican a los préstamos <strong>nuevos</strong>. Los
        préstamos ya emitidos conservan su plazo y sus condiciones.
      </p>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}
