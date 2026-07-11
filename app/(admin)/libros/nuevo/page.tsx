import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BookForm } from "../BookForm";

export const metadata: Metadata = { title: "Nuevo libro" };

/** Alta de un libro nuevo (Módulo E, F5.2). */
export default function NuevoLibroPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/libros"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Libros
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Nuevo libro</h1>
      <BookForm />
    </div>
  );
}
