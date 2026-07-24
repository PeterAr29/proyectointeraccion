"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdCard } from "lucide-react";

import { recoverSchema, type RecoverInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { FieldError } from "@/components/forms/FieldError";
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
        <div className="relative">
          <IdCard
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="codigo"
            placeholder="Ej: 202100123"
            className="pl-9"
            aria-invalid={Boolean(errors.codigo)}
            aria-describedby={errors.codigo ? "codigo-error" : undefined}
            {...register("codigo")}
          />
        </div>
        <FieldError id="codigo-error" message={errors.codigo?.message} />
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
