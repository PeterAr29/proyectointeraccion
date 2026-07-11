import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Layout de las pantallas de acceso (login/registro/recuperar).
 * Tarjeta centrada y responsive con la marca BiblioTEC arriba.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">BiblioTEC</h1>
          <p className="text-sm text-muted-foreground">
            Biblioteca universitaria
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link
            href="/privacidad"
            className="hover:text-foreground hover:underline"
          >
            Política de privacidad
          </Link>
        </p>
      </div>
    </main>
  );
}
