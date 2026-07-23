"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Profile } from "@/lib/services/users";
import { CARRERAS } from "@/lib/validations/auth";
import {
  adminCreateUserSchema,
  adminEditUserSchema,
  ROLES,
  type AdminCreateUserInput,
  type AdminEditUserInput,
} from "@/lib/validations/admin-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { FormSection } from "@/components/forms/FormSection";
import { useToast } from "@/components/feedback/Toast";
import { adminCreateUserAction, adminUpdateUserAction } from "./actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const ROL_LABEL: Record<(typeof ROLES)[number], string> = {
  estudiante: "Estudiante",
  bibliotecario: "Bibliotecario",
};

function CarreraSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
      {...props}
    >
      <option value="">Sin especificar</option>
      {CARRERAS.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function RolSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
      {...props}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROL_LABEL[r]}
        </option>
      ))}
    </select>
  );
}

/** Alta de usuario (con credenciales de acceso y rol). */
export function UserCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserInput>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: { rol: "estudiante" },
  });

  const onSubmit = async (values: AdminCreateUserInput) => {
    setFormError(null);
    const result = await adminCreateUserAction(values);
    if (result.ok) {
      toast("Usuario creado.", "success");
      router.push("/usuarios");
      router.refresh();
      return;
    }
    setFormError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="divide-y rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FormSection title="Datos personales">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                aria-invalid={Boolean(errors.nombre)}
                {...register("nombre")}
              />
              <FieldError message={errors.nombre?.message} />
            </div>
            <div>
              <Label htmlFor="codigo">Código universitario</Label>
              <Input
                id="codigo"
                aria-invalid={Boolean(errors.codigo)}
                {...register("codigo")}
              />
              <FieldError message={errors.codigo?.message} />
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
              <Label htmlFor="carrera">Carrera</Label>
              <CarreraSelect id="carrera" {...register("carrera")} />
              <FieldError message={errors.carrera?.message} />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                aria-invalid={Boolean(errors.telefono)}
                {...register("telefono")}
              />
              <FieldError message={errors.telefono?.message} />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Acceso"
          hint="Con estas credenciales la persona podrá iniciar sesión."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rol">Rol</Label>
              <RolSelect id="rol" {...register("rol")} />
              <FieldError message={errors.rol?.message} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña inicial</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>
          </div>
        </FormSection>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/usuarios")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}

/** Edición de un usuario: contacto + rol + activación (correo/código fijos). */
export function UserEditForm({ user }: { user: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [formError, setFormError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminEditUserInput>({
    resolver: zodResolver(adminEditUserSchema),
    defaultValues: {
      nombre: user.nombre,
      carrera: user.carrera ?? "",
      telefono: user.telefono ?? "",
      rol: user.rol,
      activo: user.activo,
    },
  });

  const onSubmit = async (values: AdminEditUserInput) => {
    setFormError(null);
    const result = await adminUpdateUserAction(user.id, values);
    if (result.ok) {
      toast("Usuario actualizado.", "success");
      router.push("/usuarios");
      router.refresh();
      return;
    }
    setFormError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="divide-y rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FormSection
          title="Identidad"
          hint="El código y el correo no se editan."
        >
          <dl className="grid gap-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                Código universitario
              </dt>
              <dd className="mt-0.5 font-medium">
                {user.codigo_universitario}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase text-muted-foreground">
                Correo
              </dt>
              <dd className="mt-0.5 truncate font-medium">{user.correo}</dd>
            </div>
          </dl>
        </FormSection>

        <FormSection title="Datos personales">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              <CarreraSelect
                id="carrera"
                defaultValue={user.carrera ?? ""}
                {...register("carrera")}
              />
              <FieldError message={errors.carrera?.message} />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                aria-invalid={Boolean(errors.telefono)}
                {...register("telefono")}
              />
              <FieldError message={errors.telefono?.message} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Acceso y estado">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="rol">Rol</Label>
              <RolSelect
                id="rol"
                defaultValue={user.rol}
                {...register("rol")}
              />
              <FieldError message={errors.rol?.message} />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2.5 rounded-lg border bg-secondary/40 px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register("activo")}
            />
            Cuenta activa (puede iniciar sesión)
          </label>
        </FormSection>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/usuarios")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
