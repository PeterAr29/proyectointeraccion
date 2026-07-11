import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/services/users";
import { getUnreadCount } from "@/lib/services/notifications";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout del área de administración (Módulo E). Deny-by-default en el borde del
 * grupo: exige sesión Y rol bibliotecario antes de renderizar cualquier pantalla
 * de admin (defensa en profundidad; la autorización REAL la impone la RLS de la
 * BD). Un estudiante que navegue a una ruta de admin por URL es redirigido a su
 * inicio. Reusa el shell (sidebar con la navegación de bibliotecario + topbar).
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.rol !== "bibliotecario") redirect("/inicio");

  const unreadCount = await getUnreadCount();

  return (
    <AppShell profile={profile} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}
