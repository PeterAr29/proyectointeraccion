import { BookOpen, CalendarClock, Search, Sparkles } from "lucide-react";

const caracteristicas = [
  {
    icon: Search,
    titulo: "Catálogo claro",
    descripcion:
      "Busca por título, autor o ISBN y filtra por categoría, disponibilidad y ubicación.",
  },
  {
    icon: CalendarClock,
    titulo: "Préstamos y reservas",
    descripcion:
      "Solicita, renueva y devuelve con fechas y estados siempre visibles.",
  },
  {
    icon: Sparkles,
    titulo: "Sin sorpresas",
    descripcion:
      "Notificaciones de vencimiento y multas, favoritos e historial a la mano.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-12 px-6 py-16 text-center">
      <header className="flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Biblioteca universitaria
        </span>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          BiblioTEC
        </h1>
        <p className="max-w-xl text-pretty text-lg text-muted-foreground">
          Gestiona el catálogo, tus préstamos y reservas desde una interfaz
          rápida y fácil de aprender.
        </p>
      </header>

      <section
        aria-label="Características principales"
        className="grid w-full gap-4 sm:grid-cols-3"
      >
        {caracteristicas.map(({ icon: Icon, titulo, descripcion }) => (
          <article
            key={titulo}
            className="flex flex-col items-center gap-2 rounded-lg border bg-card p-5 text-card-foreground"
          >
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold">{titulo}</h2>
            <p className="text-sm text-muted-foreground">{descripcion}</p>
          </article>
        ))}
      </section>

      <footer className="text-sm text-muted-foreground">
        Proyecto del curso de Interacción Humano–Computador · En construcción
        (Fase 1)
      </footer>
    </main>
  );
}
