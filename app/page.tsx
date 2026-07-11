import { redirect } from "next/navigation";

/**
 * Raíz del sitio. En el piloto no hay landing pública separada: se envía al
 * inicio de la app y el middleware decide el destino real según la sesión
 * (a `/login` si no hay sesión, a `/inicio` si la hay). Así, al abrir `/` sin
 * sesión, el usuario ve directamente el login.
 */
export default function RootPage() {
  redirect("/inicio");
}
