"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, PackageX, PackageCheck } from "lucide-react";

import type { Book } from "@/lib/services/books";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { setBookActiveAction } from "./actions";

/**
 * Listado de libros para administración (F5.2). Client: gestiona la baja/alta
 * lógica con confirmación (Dialog). "Editar" navega a la página del libro. La
 * lógica vive en las Server Actions (revalidan rol); aquí solo se orquesta.
 */
export function BooksAdminList({ books }: { books: Book[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = React.useState<Book | null>(null);
  const [pending, startTransition] = React.useTransition();

  const confirmToggle = () => {
    if (!target) return;
    const book = target;
    const nextActive = !book.activo;
    setTarget(null);
    startTransition(async () => {
      const result = await setBookActiveAction(book.id, nextActive);
      if (result.ok) {
        toast(
          nextActive
            ? `«${book.titulo}» reactivado en el catálogo.`
            : `«${book.titulo}» retirado del catálogo.`,
          "success",
        );
        router.refresh();
      } else {
        toast(result.error ?? "No se pudo actualizar el libro.", "error");
      }
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Libro</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">Ejemplares</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{book.titulo}</p>
                  <p className="text-xs text-muted-foreground">{book.autor}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {book.categoria ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {book.cantidad_disponible} de {book.cantidad_total}
                </td>
                <td className="px-4 py-3">
                  {book.activo ? (
                    <StatusBadge
                      status="disponible"
                      label="Activo"
                      tone="success"
                    />
                  ) : (
                    <StatusBadge
                      status="cancelada"
                      label="Retirado"
                      tone="neutral"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/libros/${book.id}`}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-semibold hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Editar
                    </Link>
                    <Button
                      variant={book.activo ? "danger" : "secondary"}
                      size="sm"
                      disabled={pending}
                      onClick={() => setTarget(book)}
                    >
                      {book.activo ? (
                        <>
                          <PackageX aria-hidden="true" />
                          Retirar
                        </>
                      ) : (
                        <>
                          <PackageCheck aria-hidden="true" />
                          Reactivar
                        </>
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        variant="confirm"
        title={target?.activo ? "Retirar del catálogo" : "Reactivar libro"}
        message={
          target?.activo
            ? `«${target?.titulo}» dejará de aparecer en el catálogo del estudiante. Sus préstamos e historial se conservan. ¿Continuar?`
            : `«${target?.titulo}» volverá a estar visible en el catálogo. ¿Continuar?`
        }
        confirmLabel={target?.activo ? "Retirar" : "Reactivar"}
        onConfirm={confirmToggle}
      />
    </>
  );
}
