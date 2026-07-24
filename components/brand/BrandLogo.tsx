import { cn } from "@/lib/utils/cn";

/**
 * Logo de marca de BiblioTEC: el búho ilustrado (sabiduría + libro abierto con
 * código binario + circuitos) del archivo de marca, recortado con fondo
 * transparente en `public/logo-owl.png`.
 *
 * El búho es azul/teal, así que sobre fondos OSCUROS se coloca dentro de una
 * "moneda" blanca (ver los chips del sidebar/drawer/acceso); sobre fondos claros
 * va directo. Es un PNG servido desde el mismo origen (permitido por
 * `img-src 'self'` de la CSP). Decorativo por defecto (`alt=""`, para no
 * duplicar el anuncio cuando va junto al texto "BiblioTEC"); si en algún lugar
 * es el único elemento que nombra la marca, pásale `alt`.
 */
export function BrandLogo({
  className,
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset local estático; next/image no aporta aquí y complica la CSP.
    <img
      src="/logo-owl.png"
      alt={alt}
      className={cn("object-contain", className)}
    />
  );
}
