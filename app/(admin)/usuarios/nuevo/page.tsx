import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { UserCreateForm } from "../UserForm";

export const metadata: Metadata = { title: "Nuevo usuario" };

/** Alta de una cuenta de usuario (Módulo E, F5.2). */
export default function NuevoUsuarioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/usuarios"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Usuarios
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Nuevo usuario</h1>
      <UserCreateForm />
    </div>
  );
}
