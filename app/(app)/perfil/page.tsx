import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/services/users";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Perfil" };

/**
 * Perfil del usuario: acceso a sus datos (Ley 29733) y edición de contacto.
 * El código universitario y el rol son informativos (no editables por el usuario).
 */
export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const iniciales =
    profile.nombre
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-muted-foreground">
          Consulta y actualiza tus datos de contacto.
        </p>
      </div>

      {/* Cabecera con avatar de iniciales */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border bg-gradient-to-br from-primary/5 to-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-xl font-bold text-primary-foreground shadow-sm"
        >
          {iniciales}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">
            {profile.correo}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge
              status={profile.rol}
              label={
                profile.rol === "bibliotecario" ? "Bibliotecario" : "Estudiante"
              }
              tone={profile.rol === "bibliotecario" ? "info" : "neutral"}
            />
            <span className="text-xs text-muted-foreground">
              Código: {profile.codigo_universitario}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Datos de contacto</h2>
        <ProfileForm profile={profile} />
      </section>
    </div>
  );
}
