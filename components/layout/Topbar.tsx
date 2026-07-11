"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import type { Profile } from "@/lib/services/users";

/**
 * Barra superior del shell. En móvil (<768px) muestra el botón hamburguesa que
 * abre el drawer. La campana enlaza a /notificaciones y muestra el contador de
 * avisos sin leer (Módulo D, F4.2); el conteo lo resuelve el layout en servidor.
 */
export function Topbar({
  profile,
  unreadCount = 0,
  onOpenMenu,
}: {
  profile: Profile;
  unreadCount?: number;
  onOpenMenu: () => void;
}) {
  const hasUnread = unreadCount > 0;
  const badge = unreadCount > 9 ? "9+" : String(unreadCount);
  const iniciales = profile.nombre
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/notificaciones"
          aria-label={
            hasUnread
              ? `Notificaciones (${unreadCount} sin leer)`
              : "Notificaciones"
          }
          className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {hasUnread && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
            >
              {badge}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
          >
            {iniciales}
          </span>
          <span className="hidden text-sm font-medium sm:inline">
            {profile.nombre}
          </span>
        </div>
      </div>
    </header>
  );
}
