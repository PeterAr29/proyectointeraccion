import type { Metadata } from "next";
import { BellOff } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { NotificationList } from "@/components/biblioteca/NotificationList";
import { getCirculationSettings } from "@/lib/services/settings";
import { syncOwnOverdueFines } from "@/lib/services/fines";
import {
  listOwnNotifications,
  syncAvailableReservations,
  syncOwnDueSoonNotifications,
} from "@/lib/services/notifications";

export const metadata: Metadata = { title: "Notificaciones" };

/**
 * "Notificaciones": avisos in-app del usuario (multa, vencimiento próximo,
 * reserva disponible). Server Component que consume solo `lib/services/*` (RLS
 * garantiza que ve únicamente los suyos). Antes de listar dispara los barridos
 * de generación (idempotentes): multas de vencidos —que a su vez emiten el aviso
 * `multa_generada`—, vencimientos próximos y reservas que recuperaron stock.
 * Cuatro estados: carga (`loading.tsx`), error, vacío y con datos.
 */
export default async function NotificacionesPage() {
  const settings = await getCirculationSettings();
  await Promise.all([
    syncOwnOverdueFines(settings.multaDiaria),
    syncOwnDueSoonNotifications(),
    syncAvailableReservations(),
  ]);

  const items = await listOwnNotifications();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
        <p className="mt-1 text-muted-foreground">
          Avisos sobre tus préstamos, reservas y multas.
        </p>
      </header>

      {items === null ? (
        <ErrorState message="No pudimos cargar tus notificaciones. Inténtalo de nuevo en unos segundos." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No tienes notificaciones"
          message="Aquí te avisaremos cuando una reserva esté disponible, un préstamo esté por vencer o se genere una multa."
        />
      ) : (
        <NotificationList items={items} />
      )}
    </div>
  );
}
