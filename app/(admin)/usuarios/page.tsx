import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, Users } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/services/users";
import { listUsers } from "@/lib/services/users-admin";
import { UsersAdminList } from "./UsersAdminList";

export const metadata: Metadata = { title: "Usuarios" };

/**
 * Gestión de usuarios (Módulo E, F5.2). Lista todos los usuarios y permite
 * crear, editar (contacto + rol) y activar/desactivar. Solo bibliotecario
 * (layout `(admin)` + RLS). Cuatro estados: carga, error, vacío y con datos.
 */
export default async function UsuariosPage() {
  const [profile, users] = await Promise.all([
    getCurrentProfile(),
    listUsers(),
  ]);
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="mt-1 text-muted-foreground">
            Administra las cuentas: crea, edita el rol y activa o desactiva.
          </p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className={buttonVariants({ variant: "primary" })}
        >
          <UserPlus aria-hidden="true" />
          Nuevo usuario
        </Link>
      </header>

      {users === null ? (
        <ErrorState message="No pudimos cargar los usuarios. Inténtalo de nuevo en unos segundos." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay usuarios"
          message="Crea la primera cuenta para empezar."
        />
      ) : (
        <UsersAdminList users={users} currentUserId={profile.id} />
      )}
    </div>
  );
}
