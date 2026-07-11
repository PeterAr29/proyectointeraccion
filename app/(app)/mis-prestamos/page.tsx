import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoanTable } from "@/components/biblioteca/LoanTable";
import { buttonVariants } from "@/components/ui/button";
import { listOwnLoansWithBooks } from "@/lib/services/loans";
import { getCirculationSettings } from "@/lib/services/settings";
import {
  getPendingFineLoanIds,
  syncOwnOverdueFines,
} from "@/lib/services/fines";

export const metadata: Metadata = { title: "Mis préstamos" };

/**
 * "Mis préstamos": préstamos activos y vencidos del usuario, con renovar y
 * devolver. Server Component que consume solo `lib/services/*` (RLS garantiza
 * que ve únicamente los suyos). Cuatro estados: carga (`loading.tsx`), error,
 * vacío y con datos.
 */
export default async function MisPrestamosPage() {
  const settings = await getCirculationSettings();
  // Antes de listar, asegura las multas de los préstamos vencidos del usuario
  // (idempotente) para que el checker de renovación (§7.2.5) refleje la realidad.
  await syncOwnOverdueFines(settings.multaDiaria);

  const [items, pendingFineLoanIds] = await Promise.all([
    listOwnLoansWithBooks(),
    getPendingFineLoanIds(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mis préstamos</h1>
        <p className="mt-1 text-muted-foreground">
          Los libros que tienes prestados. Renuévalos o devuélvelos desde aquí.
        </p>
      </header>

      {items === null ? (
        <ErrorState message="No pudimos cargar tus préstamos. Inténtalo de nuevo en unos segundos." />
      ) : items.length === 0 ? (
        <EmptyLoans />
      ) : (
        <LoanTable
          items={items}
          maxRenovaciones={settings.maxRenovaciones}
          pendingFineLoanIds={pendingFineLoanIds}
        />
      )}
    </div>
  );
}

function EmptyLoans() {
  return (
    <div>
      <EmptyState
        icon={BookMarked}
        title="No tienes préstamos activos"
        message="Cuando prestes un libro del catálogo, aparecerá aquí para que lo renueves o devuelvas."
      />
      <div className="flex justify-center">
        <Link
          href="/catalogo"
          className={buttonVariants({ variant: "primary" })}
        >
          Explorar el catálogo
        </Link>
      </div>
    </div>
  );
}
