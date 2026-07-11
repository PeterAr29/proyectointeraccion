import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/services/users";
import { getUnreadCount } from "@/lib/services/notifications";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout protegido de la app. El middleware ya exige sesión; aquí además se
 * resuelve el perfil (defensa en profundidad) y se monta el shell. Si hay
 * sesión pero no perfil, se cierra el paso (estado inconsistente).
 * Resuelve también el contador de notificaciones sin leer para la campana (D).
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const unreadCount = await getUnreadCount();

  return (
    <AppShell profile={profile} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
