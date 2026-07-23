"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "./nav";

/**
 * Lista de navegación del shell (sidebar). Presentacional: la usa tanto el
 * sidebar de escritorio como el drawer móvil.
 * Ítem activo: fondo primary-soft (#EFF6FF) + borde azul a la izquierda.
 * Ítems deshabilitados (pantallas de fases futuras) se ven atenuados y no navegan.
 */
export function SidebarNav({
  items,
  onNavigate,
  onLogout,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-1 flex-col gap-1 p-3"
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        if (!item.enabled) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              title="Disponible próximamente"
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/40"
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {item.label}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-white bg-white/15 text-white shadow-sm"
                : "border-transparent text-primary-foreground/85 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onLogout}
        className="mt-2 flex items-center gap-3 rounded-md border-l-[3px] border-transparent px-3 py-2.5 text-sm font-medium text-red-100 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        Cerrar sesión
      </button>
    </nav>
  );
}
