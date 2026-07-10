"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { recoverSchema, type RecoverInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { recoverAction } from "../actions";

export function RecoverForm() {
  const [sent, setSent] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverInput>({ resolver: zodResolver(recoverSchema) });

  const onSubmit = async (values: RecoverInput) => {
    setFormError(null);
    const result = await recoverAction(values);
    if (result.ok) setSent(true);
    else setFormError(result.error ?? "No se pudo procesar la solicitud.");
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Revisa tu correo</h2>
        <FormAlert variant="success">
          Si el código está registrado, enviamos instrucciones para restablecer
          tu contraseña al correo asociado.
        </FormAlert>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setSent(false)}
        >
          Enviar de nuevo
        </Button>
        <p className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div>
        <h2 className="text-lg font-bold">Recuperar contraseña</h2>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace al correo asociado a tu código.
        </p>
      </div>

      {formError && <FormAlert>{formError}</FormAlert>}

      <div>
        <Label htmlFor="codigo">Código universitario</Label>
        <Input
          id="codigo"
          placeholder="Ej: 202100123"
          aria-invalid={Boolean(errors.codigo)}
          {...register("codigo")}
        />
        {errors.codigo && (
          <p className="mt-1 text-xs text-destructive">
            {errors.codigo.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando…" : "Enviar instrucciones"}
      </Button>

      <p className="text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
