"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, IdCard, Lock } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { FieldError } from "@/components/forms/FieldError";
import { loginAction } from "../actions";

export function LoginForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    const result = await loginAction(values);
    // Si tiene éxito, la Server Action redirige; solo llegamos aquí en error.
    if (result && !result.ok)
      setFormError(result.error ?? "No se pudo iniciar sesión.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenido de nuevo a tu biblioteca.
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
            autoComplete="username"
            placeholder="Ej: 202100123"
            className="pl-9"
            aria-invalid={Boolean(errors.codigo)}
            aria-describedby={errors.codigo ? "codigo-error" : "codigo-help"}
            {...register("codigo")}
          />
        </div>
        {errors.codigo ? (
          <FieldError id="codigo-error" message={errors.codigo.message} />
        ) : (
          <p id="codigo-help" className="mt-1 text-xs text-muted-foreground">
            El mismo acceso para estudiantes y personal de biblioteca.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-9 pr-10"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      <div className="text-right">
        <Link
          href="/recuperar"
          className="text-sm font-medium text-primary hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-primary hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
