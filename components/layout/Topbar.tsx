"use client";

import { Bell, Menu } from "lucide-react";
import type { Profile } from "@/lib/services/users";

/**
 * Barra superior del shell. En móvil (<768px) muestra el botón hamburguesa que
 * abre el drawer. La campana es el punto de enganche del contador de
 * notificaciones (lo cablea el Módulo D en F4).
 */
export function Topbar({
  profile,
  onOpenMenu,
}: {
  profile: Profile;
  onOpenMenu: () => void;
}) {
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
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

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
