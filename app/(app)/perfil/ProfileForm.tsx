"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Profile } from "@/lib/services/users";
import {
  CARRERAS,
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { useToast } from "@/components/feedback/Toast";
import { updateProfileAction } from "./actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

/** Formulario de edición de los datos de contacto del propio perfil. */
export function ProfileForm({ profile }: { profile: Profile }) {
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);

  // Carreras disponibles + la actual del perfil si no estuviera en la lista.
  const carreras = React.useMemo(() => {
    const base = [...CARRERAS] as string[];
    if (profile.carrera && !base.includes(profile.carrera)) {
      base.unshift(profile.carrera);
    }
    return base;
  }, [profile.carrera]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nombre: profile.nombre,
      carrera: profile.carrera ?? "",
      correo: profile.correo,
      telefono: profile.telefono ?? "",
    },
  });

  const onSubmit = async (values: UpdateProfileInput) => {
    setFormError(null);
    const result = await updateProfileAction(values);
    if (result.ok) toast("Perfil actualizado.", "success");
    else setFormError(result.error ?? "No se pudo actualizar tu perfil.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {formError && <FormAlert>{formError}</FormAlert>}

      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          aria-invalid={Boolean(errors.nombre)}
          {...register("nombre")}
        />
        <FieldError message={errors.nombre?.message} />
      </div>

      <div>
        <Label htmlFor="carrera">Carrera</Label>
        <select
          id="carrera"
          defaultValue={profile.carrera ?? ""}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
          {...register("carrera")}
        >
          <option value="">Sin especificar</option>
          {carreras.map((carrera) => (
            <option key={carrera} value={carrera}>
              {carrera}
            </option>
          ))}
        </select>
        <FieldError message={errors.carrera?.message} />
      </div>

      <div>
        <Label htmlFor="correo">Correo institucional</Label>
        <Input
          id="correo"
          type="email"
          aria-invalid={Boolean(errors.correo)}
          {...register("correo")}
        />
        <FieldError message={errors.correo?.message} />
      </div>

      <div>
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          type="tel"
          placeholder="987 654 321"
          aria-invalid={Boolean(errors.telefono)}
          {...register("telefono")}
        />
        <FieldError message={errors.telefono?.message} />
      </div>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
