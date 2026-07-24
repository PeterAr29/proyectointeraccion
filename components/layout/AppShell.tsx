"use client";

import * as React from "react";
import Link from "next/link";

import type { Profile } from "@/lib/services/users";
import { BrandLogo } from "@/components/brand/BrandLogo";
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
  unreadCount = 0,
  children,
}: {
  profile: Profile;
  unreadCount?: number;
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
      <a
        href="#contenido-principal"
        className="sr-only left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:absolute"
      >
        Saltar al contenido
      </a>
      <div
        className="flex min-h-screen text-foreground"
        style={{
          background:
            "radial-gradient(1100px 520px at 100% -8%, rgba(79,70,229,0.12), transparent 60%), linear-gradient(180deg, #EEF2FF 0%, #F5F7FB 34%, #F8FAFC 100%)",
        }}
      >
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-primary to-indigo-800 text-primary-foreground md:flex">
          <Link
            href="/inicio"
            className="flex h-16 items-center gap-2 border-b border-white/10 px-4 transition-colors hover:bg-white/5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
              <BrandLogo className="h-7 w-7" />
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
          <Topbar
            profile={profile}
            unreadCount={unreadCount}
            onOpenMenu={() => setMobileOpen(true)}
          />
          <main
            id="contenido-principal"
            tabIndex={-1}
            className="mx-auto w-full max-w-[1600px] flex-1 p-4 outline-none sm:p-6 lg:px-8"
          >
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
