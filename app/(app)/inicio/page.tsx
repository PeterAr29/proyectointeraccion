import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, User } from "lucide-react";

import { getCurrentProfile } from "@/lib/services/users";

export const metadata: Metadata = { title: "Inicio" };

/**
 * Pantalla de inicio del shell. Da la bienvenida y orienta hacia las próximas
 * funcionalidades (catálogo, préstamos), que llegan con los módulos B–C.
 */
export default async function InicioPage() {
  const profile = await getCurrentProfile();
  const nombreCorto = profile?.nombre.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">
        Hola, {nombreCorto} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        Bienvenida/o a BiblioTEC. Desde aquí gestionarás tus préstamos, reservas
        y favoritos de la biblioteca universitaria.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card
          icon={Compass}
          title="Explora el catálogo"
          description="Busca libros por título, autor o ISBN. (Disponible pronto)"
        />
        <Card
          icon={BookOpen}
          title="Tus préstamos"
          description="Renueva o devuelve tus libros a tiempo. (Disponible pronto)"
        />
        <Link
          href="/perfil"
          className="flex flex-col gap-2 rounded-lg border bg-card p-5 transition-colors hover:border-primary"
        >
          <User className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-semibold">Tu perfil</span>
          <span className="text-sm text-muted-foreground">
            Revisa y actualiza tus datos de contacto.
          </span>
        </Link>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-5">
      <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
}
