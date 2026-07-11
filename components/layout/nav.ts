import {
  Bell,
  BookMarked,
  BookOpen,
  Clock,
  Heart,
  Home,
  LayoutGrid,
  LibraryBig,
  ReceiptText,
  Settings,
  Undo2,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/supabase/database.types";

/**
 * Definición de la navegación del shell por rol.
 * `enabled: false` marca ítems cuya pantalla aún no existe (fases B–E): se
 * muestran para dar contexto de la IA, pero no navegan (evita 404). Se irán
 * activando conforme cada módulo entregue su ruta.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Inicio", href: "/inicio", icon: Home, enabled: true },
  { label: "Catálogo", href: "/catalogo", icon: BookOpen, enabled: true },
  {
    label: "Mis préstamos",
    href: "/mis-prestamos",
    icon: BookMarked,
    enabled: true,
  },
  { label: "Historial", href: "/historial", icon: Clock, enabled: true },
  { label: "Favoritos", href: "/favoritos", icon: Heart, enabled: true },
  {
    label: "Notificaciones",
    href: "/notificaciones",
    icon: Bell,
    enabled: true,
  },
  { label: "Perfil", href: "/perfil", icon: User, enabled: true },
];

const LIBRARIAN_NAV: NavItem[] = [
  { label: "Inicio", href: "/inicio", icon: Home, enabled: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, enabled: true },
  { label: "Libros", href: "/libros", icon: LibraryBig, enabled: true },
  { label: "Usuarios", href: "/usuarios", icon: Users, enabled: true },
  { label: "Préstamos", href: "/prestamos", icon: BookMarked, enabled: true },
  { label: "Devoluciones", href: "/devoluciones", icon: Undo2, enabled: true },
  { label: "Multas", href: "/multas", icon: ReceiptText, enabled: true },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
    enabled: false,
  },
  { label: "Perfil", href: "/perfil", icon: User, enabled: true },
];

export function getNavItems(rol: UserRole): NavItem[] {
  return rol === "bibliotecario" ? LIBRARIAN_NAV : STUDENT_NAV;
}
