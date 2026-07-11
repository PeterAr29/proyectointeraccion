import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { getUserById } from "@/lib/services/users-admin";
import { UserEditForm } from "../UserForm";

export const metadata: Metadata = { title: "Editar usuario" };

/** Edición de un usuario (Módulo E, F5.2). Id no-UUID o inexistente → ErrorState. */
export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsed = z.string().uuid().safeParse(id);
  const user = parsed.success ? await getUserById(parsed.data) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/usuarios"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Usuarios
      </Link>

      {user === null ? (
        <ErrorState
          title="Usuario no encontrado"
          message="El usuario que intentas editar no existe."
        />
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold tracking-tight">
            Editar usuario
          </h1>
          <UserEditForm user={user} />
        </>
      )}
    </div>
  );
}
