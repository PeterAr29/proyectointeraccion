"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookCheck,
  CalendarClock,
  Check,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/feedback/Toast";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import type { NotificationType } from "@/lib/supabase/database.types";
import type { Notification } from "@/lib/services/notifications";
import {
  markAllReadAction,
  markReadAction,
} from "@/app/(app)/notificaciones/actions";

/**
 * Lista de notificaciones del usuario (F4.2). Client Component: destaca las no
 * leídas, permite marcar una o todas como leídas y refresca la vista (y el
 * contador de la campana) tras cada acción. La lógica vive en la capa de
 * servicios; aquí solo se orquesta. Accesible: cada aviso es un `<li>` con su
 * acción etiquetada y el estado "no leída" anunciado a lectores de pantalla.
 */

/** Icono y tono por tipo de notificación (metáfora de color del sistema). */
const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; label: string; className: string }
> = {
  multa_generada: {
    icon: AlertTriangle,
    label: "Multa",
    className: "bg-red-100 text-red-700",
  },
  vencimiento_proximo: {
    icon: CalendarClock,
    label: "Vencimiento",
    className: "bg-amber-100 text-amber-700",
  },
  reserva_disponible: {
    icon: BookCheck,
    label: "Reserva disponible",
    className: "bg-green-100 text-green-700",
  },
};

export function NotificationList({ items }: { items: Notification[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const sinLeer = items.reduce((n, item) => (item.leida ? n : n + 1), 0);

  const markOne = (id: string) => {
    startTransition(async () => {
      const result = await markReadAction(id);
      if (result.ok) {
        router.refresh();
        return;
      }
      toast("No se pudo marcar la notificación. Inténtalo de nuevo.", "error");
    });
  };

  const markAll = () => {
    startTransition(async () => {
      const result = await markAllReadAction();
      if (result.ok) {
        toast("Marcamos todas tus notificaciones como leídas.", "success");
        router.refresh();
        return;
      }
      toast("No se pudieron marcar como leídas. Inténtalo de nuevo.", "error");
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {sinLeer > 0
            ? `Tienes ${sinLeer} sin leer`
            : "No tienes notificaciones sin leer"}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={markAll}
          disabled={pending || sinLeer === 0}
        >
          <CheckCheck aria-hidden="true" />
          Marcar todas como leídas
        </Button>
      </div>

      <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
        {items.map((notification) => {
          const meta = TYPE_META[notification.tipo];
          const Icon = meta.icon;
          const unread = !notification.leida;
          return (
            <li
              key={notification.id}
              className={cn(
                "flex items-start gap-3 border-l-4 px-4 py-3.5 transition-colors",
                unread
                  ? "border-l-primary bg-primary-soft/40"
                  : "border-l-transparent hover:bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-black/5",
                  meta.className,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {meta.label}
                  </span>
                  {unread && (
                    <span
                      className="inline-flex h-2 w-2 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                  {unread && <span className="sr-only">Sin leer</span>}
                </div>
                <p className="mt-0.5 text-sm text-foreground">
                  {notification.mensaje}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(notification.created_at)}
                </p>
              </div>

              {unread && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markOne(notification.id)}
                  disabled={pending}
                  aria-label="Marcar como leída"
                  title="Marcar como leída"
                >
                  <Check aria-hidden="true" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
