import type { Metadata } from "next";
import { BookMarked, BookOpen, ReceiptText, Users } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { KpiCard } from "@/components/biblioteca/KpiCard";
import { RecentLoansTable } from "@/components/biblioteca/RecentLoansTable";
import { getDashboardData } from "@/lib/services/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Dashboard del bibliotecario (Módulo E, F5.1). Server Component que consume solo
 * `lib/services/*` (nunca las tablas directamente). El acceso está restringido al
 * rol bibliotecario por el layout `(admin)` + la RLS. Cuatro estados: carga
 * (`loading.tsx`), error (por sección), vacío (sin préstamos) y con datos.
 */
export default async function DashboardPage() {
  const { kpis, recentLoans } = await getDashboardData();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="mt-1 text-muted-foreground">
          Resumen del estado de la biblioteca: catálogo, usuarios y circulación.
        </p>
      </header>

      <section
        aria-label="Indicadores"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          icon={BookOpen}
          label="Libros en el catálogo"
          value={kpis.totalBooks}
          tone="primary"
        />
        <KpiCard
          icon={Users}
          label="Usuarios registrados"
          value={kpis.totalUsers}
          tone="success"
        />
        <KpiCard
          icon={BookMarked}
          label="Préstamos activos"
          value={kpis.activeLoans}
          tone="warning"
        />
        <KpiCard
          icon={ReceiptText}
          label="Multas pendientes"
          value={kpis.pendingFines}
          tone="danger"
        />
      </section>

      <section aria-label="Préstamos recientes" className="mt-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Préstamos recientes
        </h2>
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
