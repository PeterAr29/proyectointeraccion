"use client";

import * as React from "react";
import { BookOpen, X } from "lucide-react";
import { SidebarNav } from "./Sidebar";
import type { NavItem } from "./nav";

/**
 * Drawer de navegación para móvil (<768px). Se despliega desde la izquierda con
 * un fondo oscuro; cierra con la X, con Escape o tocando fuera.
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
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute inset-y-0 left-0 flex w-64 flex-col bg-card shadow-xl"
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-bold">BiblioTEC</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <SidebarNav items={items} onNavigate={onClose} onLogout={onLogout} />
      </div>
    </div>
  );
}
