"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import type { Profile } from "@/lib/services/users";
import { ToastProvider } from "@/components/feedback/Toast";
import { logoutAction } from "@/app/(auth)/actions";
import { getNavItems } from "./nav";
import { SidebarNav } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

/**
 * Shell de la aplicación: sidebar de 240px (escritorio), topbar con campana y
 * drawer móvil. Envuelve el árbol en ToastProvider para que cualquier pantalla
 * pueda emitir toasts. Recibe el perfil ya resuelto en el servidor (layout).
 */
export function AppShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const items = getNavItems(profile.rol);

  const handleLogout = React.useCallback(() => {
    setMobileOpen(false);
    void logoutAction();
  }, []);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
          <Link
            href="/inicio"
            className="flex h-16 items-center gap-2 border-b px-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-bold">BiblioTEC</span>
          </Link>
          <SidebarNav items={items} onLogout={handleLogout} />
        </aside>

        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          items={items}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar profile={profile} onOpenMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
