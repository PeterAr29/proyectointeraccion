import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Bell,
  CalendarCheck,
  CalendarClock,
  Compass,
  Heart,
  LibraryBig,
  ReceiptText,
  Users,
} from "lucide-react";

import { getCurrentProfile } from "@/lib/services/users";
import {
  effectiveLoanStatus,
  listOwnLoansWithBooks,
} from "@/lib/services/loans";
import { listFavorites, listRecommendedBooks } from "@/lib/services/books";
import { getUnreadCount } from "@/lib/services/notifications";
import { getDashboardData } from "@/lib/services/dashboard";
import { areaForCarrera } from "@/lib/domain/areas";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RecentLoansTable } from "@/components/biblioteca/RecentLoansTable";
import {
  DueSoon,
  Hero,
  RecommendedStrip,
  StatCard,
} from "@/components/inicio/InicioUI";

export const metadata: Metadata = { title: "Inicio" };

/**
 * Pantalla de inicio del shell: tablero personalizado con cabecera de
 * bienvenida y un resumen con datos reales por rol. Server Component que compone
 * `lib/services/*` (RLS acota los datos). La presentación vive en
 * `components/inicio/InicioUI`.
 */
export default async function InicioPage() {
  const profile = await getCurrentProfile();
  const esBibliotecario = profile?.rol === "bibliotecario";
  const nombreCorto = profile?.nombre.split(" ")[0] ?? "";

  return (
    <div className="space-y-6">
      <Hero nombre={nombreCorto} esBibliotecario={esBibliotecario} />
      {esBibliotecario ? (
        <LibrarianBoard />
      ) : (
        <StudentBoard carrera={profile?.carrera ?? null} />
      )}
    </div>
  );
}

async function StudentBoard({ carrera }: { carrera: string | null }) {
  const area = areaForCarrera(carrera);
  const [loans, favorites, unread, recommended] = await Promise.all([
    listOwnLoansWithBooks(),
    listFavorites(),
    getUnreadCount(),
    listRecommendedBooks(area, 6),
  ]);

  const abiertos = loans ?? [];
  const enPlazo = abiertos.filter(
    ({ loan }) => effectiveLoanStatus(loan) === "activo",
  );
  const vencidos = abiertos.filter(
    ({ loan }) => effectiveLoanStatus(loan) === "vencido",
  );
  // Préstamo con la fecha de devolución más próxima (incluye vencidos).
  const proximo = [...abiertos].sort(
    (a, b) =>
      new Date(a.loan.fecha_devolucion_estimada).getTime() -
      new Date(b.loan.fecha_devolucion_estimada).getTime(),
  )[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          href="/mis-prestamos"
          icon={BookMarked}
          tone="sky"
          value={enPlazo.length}
          label="Préstamos activos"
        />
        <StatCard
          href="/mis-prestamos"
          icon={CalendarClock}
          tone="amber"
          value={vencidos.length}
          label="Por devolver (vencidos)"
        />
        <StatCard
          href="/favoritos"
          icon={Heart}
          tone="rose"
          value={favorites?.length ?? 0}
          label="Favoritos"
        />
        <StatCard
          href="/notificaciones"
          icon={Bell}
          tone="violet"
          value={unread}
          label="Avisos sin leer"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {recommended.length > 0 ? (
            <RecommendedStrip books={recommended} carrera={carrera} />
          ) : (
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <Compass
                className="mx-auto mb-3 h-8 w-8 text-primary"
                aria-hidden="true"
              />
              <p className="font-semibold">Descubre tu próxima lectura</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Explora el catálogo por áreas académicas.
              </p>
              <Link
                href="/catalogo"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Ir al catálogo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tus préstamos
          </h2>
          {proximo ? (
            <DueSoon item={proximo} />
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 p-6 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground ring-1 ring-inset ring-border">
                <CalendarCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold">Nada por devolver</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No tienes préstamos activos ahora mismo.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

async function LibrarianBoard() {
  const { kpis, recentLoans } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          href="/libros"
          icon={LibraryBig}
          tone="sky"
          value={kpis.totalBooks}
          label="Libros"
        />
        <StatCard
          href="/usuarios"
          icon={Users}
          tone="violet"
          value={kpis.totalUsers}
          label="Usuarios"
        />
        <StatCard
          href="/prestamos"
          icon={BookMarked}
          tone="emerald"
          value={kpis.activeLoans}
          label="Préstamos activos"
        />
        <StatCard
          href="/multas"
          icon={ReceiptText}
          tone="amber"
          value={kpis.pendingFines}
          label="Multas pendientes"
        />
      </div>

      <section aria-label="Préstamos recientes" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Préstamos recientes
          </h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver panel completo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {recentLoans === null ? (
          <ErrorState message="No pudimos cargar los préstamos recientes. Inténtalo de nuevo en unos segundos." />
        ) : recentLoans.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="Aún no hay préstamos"
            message="Cuando los estudiantes empiecen a prestar libros, los más recientes aparecerán aquí."
          />
        ) : (
          <RecentLoansTable rows={recentLoans} />
        )}
      </section>
    </div>
  );
}
