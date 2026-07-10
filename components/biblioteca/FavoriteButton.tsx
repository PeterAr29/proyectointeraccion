"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/feedback/Toast";
import { toggleFavoriteAction } from "@/app/(app)/favoritos/actions";

/**
 * Botón para marcar/desmarcar un libro como favorito (metáfora de corazón).
 * Optimista: refleja el cambio al instante y revierte si el servidor falla.
 * Reutilizable en el detalle (`variant="full"`, con etiqueta) y en la lista de
 * favoritos (`variant="icon"`, superpuesto en la tarjeta).
 */
export interface FavoriteButtonProps {
  bookId: string;
  initialFavorite: boolean;
  variant?: "full" | "icon";
  className?: string;
}

export function FavoriteButton({
  bookId,
  initialFavorite,
  variant = "full",
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [favorite, setFavorite] = React.useState(initialFavorite);
  const [pending, startTransition] = React.useTransition();

  const onToggle = () => {
    const next = !favorite;
    setFavorite(next); // optimista
    startTransition(async () => {
      const result = await toggleFavoriteAction(bookId, next);
      if (result.ok) {
        toast(
          next ? "Añadido a favoritos." : "Quitado de favoritos.",
          "success",
        );
        router.refresh();
      } else {
        setFavorite(!next); // revertir
        toast("No se pudo actualizar tus favoritos.", "error");
      }
    });
  };

  const label = favorite ? "Quitar de favoritos" : "Añadir a favoritos";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-label={label}
        aria-pressed={favorite}
        title={label}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-sm ring-1 ring-border backdrop-blur transition-colors hover:bg-card disabled:opacity-50",
          className,
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            favorite ? "fill-red-600 text-red-600" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={favorite}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          favorite ? "fill-red-600 text-red-600" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
