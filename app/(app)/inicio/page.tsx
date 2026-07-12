import type { Metadata } from "next";
import {
  BookMarked,
  Bell,
  CalendarClock,
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
import { listFavorites } from "@/lib/services/books";
import { getUnreadCount } from "@/lib/services/notifications";
import { getDashboardData } from "@/lib/services/dashboard";
import {
  DueSoon,
  Hero,
  LIBRARIAN_LINKS,
  QuickAccess,
  StatCard,
  STUDENT_LINKS,
} from "@/components/inicio/InicioUI";

export const metadata: Metadata = { title: "Inicio" };

/**
 * Pantalla de inicio del shell: tablero personalizado con cabecera de
 * bienvenida, un resumen con datos reales (préstamos, favoritos, avisos) y
 * accesos rápidos. Server Component que compone `lib/services/*` (RLS acota los
 * datos). La presentación vive en `components/inicio/InicioUI`.
 */
export default async function InicioPage() {
  const profile = await getCurrentProfile();
  const esBibliotecario = profile?.rol === "bibliotecario";
  const nombreCorto = profile?.nombre.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Hero nombre={nombreCorto} esBibliotecario={esBibliotecario} />
      {esBibliotecario ? <LibrarianBoard /> : <StudentBoard />}
    </div>
  );
}

async function StudentBoard() {
  const [loans, favorites, unread] = await Promise.all([
    listOwnLoansWithBooks(),
    listFavorites(),
    getUnreadCount(),
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
    <>
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

      {proximo && <DueSoon item={proximo} />}

      <QuickAccess links={STUDENT_LINKS} />
    </>
  );
}

async function LibrarianBoard() {
  const { kpis } = await getDashboardData();

  return (
    <>
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

      <QuickAccess links={LIBRARIAN_LINKS} />
    </>
  );
}
