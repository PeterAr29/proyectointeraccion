import Link from "next/link";
import { BookOpen, GraduationCap, Library } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

/**
 * Layout de las pantallas de acceso (login/registro/recuperar).
 * Presentación tipo biblioteca: dos columnas en escritorio (panel de marca a la
 * izquierda, formulario a la derecha) y una sola columna centrada en móvil.
 * Fondo con degradado sutil y motivos de biblioteca; todo autocontenido (sin
 * imágenes externas, compatible con la CSP).
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main
      className="flex min-h-screen"
      style={{
        background:
          "radial-gradient(900px 480px at 82% -12%, rgba(37,99,235,0.10), transparent 60%), linear-gradient(180deg, #EEF2FF 0%, #F5F7FB 42%, #F8FAFC 100%)",
      }}
    >
      {/* Panel de marca — solo escritorio */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-indigo-800 p-12 text-primary-foreground lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.22), transparent 42%)",
          }}
        />
        {/* Textura sutil de puntos, refuerza el aire "de biblioteca" sin cargar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.4px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <BrandLogo className="h-9 w-9" />
          </span>
          <span className="text-xl font-bold tracking-tight">BiblioTEC</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Tu biblioteca universitaria, en un solo lugar.
          </h2>
          <p className="mt-4 text-base text-primary-foreground/85">
            Explora el catálogo, gestiona tus préstamos y reservas, y recibe
            avisos de vencimiento sin filas ni papeleo.
          </p>

          <ul className="mt-8 space-y-4">
            <Feature
              icon={Library}
              accent="text-teal"
              title="Catálogo completo"
              text="Busca por título, autor o ISBN en segundos."
            />
            <Feature
              icon={BookOpen}
              accent="text-gold"
              title="Préstamos al día"
              text="Renueva o devuelve tus libros desde el celular."
            />
            <Feature
              icon={GraduationCap}
              accent="text-forest"
              title="Pensado para estudiantes"
              text="Una interfaz clara, rápida y fácil de aprender."
            />
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/85">
          © {new Date().getFullYear()} BiblioTEC · Biblioteca universitaria
        </p>
      </aside>

      {/* Columna del formulario */}
      <section className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Marca compacta — visible cuando no está el panel lateral */}
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-border">
              <BrandLogo className="h-11 w-11" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">BiblioTEC</h1>
            <p className="text-sm text-muted-foreground">
              Biblioteca universitaria
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
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
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  accent,
  title,
  text,
}: {
  icon: typeof BookOpen;
  /** Color del icono en el medallón blanco (token de la paleta académica). */
  accent: string;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Icon className={`h-5 w-5 ${accent}`} aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-primary-foreground/85">{text}</p>
      </div>
    </li>
  );
}
