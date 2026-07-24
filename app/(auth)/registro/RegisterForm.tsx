"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CARRERAS,
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { FieldError } from "@/components/forms/FieldError";
import { registerAction } from "../actions";

export function RegisterForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    const result = await registerAction(values);
    if (result && !result.ok) {
      setFormError(result.error ?? "No se pudo completar el registro.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div>
        <h2 className="text-lg font-bold">Crear cuenta</h2>
        <p className="text-sm text-muted-foreground">
          Regístrate con tus datos universitarios.
        </p>
      </div>

      {formError && <FormAlert>{formError}</FormAlert>}

      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          autoComplete="name"
          placeholder="Ej: María García López"
          aria-invalid={Boolean(errors.nombre)}
          aria-describedby={errors.nombre ? "nombre-error" : undefined}
          {...register("nombre")}
        />
        <FieldError id="nombre-error" message={errors.nombre?.message} />
      </div>

      <div>
        <Label htmlFor="codigo">Código universitario</Label>
        <Input
          id="codigo"
          placeholder="Ej: 202100123"
          aria-invalid={Boolean(errors.codigo)}
          aria-describedby={errors.codigo ? "codigo-error" : undefined}
          {...register("codigo")}
        />
        <FieldError id="codigo-error" message={errors.codigo?.message} />
      </div>

      <div>
        <Label htmlFor="carrera">Carrera</Label>
        <select
          id="carrera"
          aria-invalid={Boolean(errors.carrera)}
          aria-describedby={errors.carrera ? "carrera-error" : undefined}
          defaultValue=""
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground aria-[invalid=true]:border-destructive"
          {...register("carrera")}
        >
          <option value="" disabled>
            Selecciona tu carrera
          </option>
          {CARRERAS.map((carrera) => (
            <option key={carrera} value={carrera}>
              {carrera}
            </option>
          ))}
        </select>
        <FieldError id="carrera-error" message={errors.carrera?.message} />
      </div>

      <div>
        <Label htmlFor="correo">Correo institucional</Label>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@univ.edu.pe"
          aria-invalid={Boolean(errors.correo)}
          aria-describedby={errors.correo ? "correo-error" : undefined}
          {...register("correo")}
        />
        <FieldError id="correo-error" message={errors.correo?.message} />
      </div>

      <div>
        <Label htmlFor="telefono">Teléfono (opcional)</Label>
        <Input
          id="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="987 654 321"
          aria-invalid={Boolean(errors.telefono)}
          aria-describedby={errors.telefono ? "telefono-error" : undefined}
          {...register("telefono")}
        />
        <FieldError id="telefono-error" message={errors.telefono?.message} />
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
          {...register("confirmPassword")}
        />
        <FieldError
          id="confirmPassword-error"
          message={errors.confirmPassword?.message}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
