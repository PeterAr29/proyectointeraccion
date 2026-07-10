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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
      <p className="mt-1 text-muted-foreground">
        Consulta y actualiza tus datos de contacto.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-card p-5">
        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            Código universitario
          </dt>
          <dd className="mt-0.5 font-medium">{profile.codigo_universitario}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            Rol
          </dt>
          <dd className="mt-0.5">
            <StatusBadge
              status={profile.rol}
              label={
                profile.rol === "bibliotecario" ? "Bibliotecario" : "Estudiante"
              }
              tone={profile.rol === "bibliotecario" ? "info" : "neutral"}
            />
          </dd>
        </div>
      </dl>

      <section className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-lg font-bold">Datos de contacto</h2>
        <ProfileForm profile={profile} />
      </section>
    </div>
  );
}
