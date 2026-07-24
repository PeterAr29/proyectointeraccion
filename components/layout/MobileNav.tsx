"use client";

import * as React from "react";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SidebarNav } from "./Sidebar";
import type { NavItem } from "./nav";

/** Selector de elementos enfocables para la trampa de foco (igual que Modal). */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Drawer de navegación para móvil (<768px). Se despliega desde la izquierda con
 * un fondo oscuro; cierra con la X, con Escape o tocando fuera.
 * Accesible (WCAG 2.4.3): al abrir lleva el foco al drawer y atrapa el Tab
 * dentro; al cerrar devuelve el foco al elemento que lo abrió (el botón de menú).
 */
export function MobileNav({
  open,
  onClose,
  items,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  onLogout: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-primary to-indigo-800 text-primary-foreground shadow-xl outline-none"
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
            <BrandLogo className="h-7 w-7" />
          </span>
          <span className="font-bold">BiblioTEC</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto rounded-md p-1.5 text-primary-foreground/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <SidebarNav items={items} onNavigate={onClose} onLogout={onLogout} />
      </div>
    </div>
  );
}
