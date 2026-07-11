"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, UserX, UserCheck } from "lucide-react";

import type { Profile } from "@/lib/services/users";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/biblioteca/StatusBadge";
import { Dialog } from "@/components/feedback/Dialog";
import { useToast } from "@/components/feedback/Toast";
import { maskEmail } from "@/lib/utils/mask";
import { setUserActiveAction } from "./actions";

/**
 * Listado de usuarios para administración (F5.2). Gestiona la baja/alta lógica
 * con confirmación. No permite desactivar la PROPIA cuenta (botón oculto para el
 * usuario actual); la Server Action lo revalida igualmente.
 */
export function UsersAdminList({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [target, setTarget] = React.useState<Profile | null>(null);
  const [pending, startTransition] = React.useTransition();

  const confirmToggle = () => {
    if (!target) return;
    const user = target;
    const nextActive = !user.activo;
    setTarget(null);
    startTransition(async () => {
      const result = await setUserActiveAction(user.id, nextActive);
      if (result.ok) {
        toast(
          nextActive
            ? `${user.nombre} reactivado.`
            : `${user.nombre} desactivado.`,
          "success",
        );
        router.refresh();
      } else {
        toast(result.error ?? "No se pudo actualizar el usuario.", "error");
      }
    });
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {maskEmail(user.correo)}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {user.codigo_universitario}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={user.rol === "bibliotecario" ? "info" : "neutral"}
                      label={
                        user.rol === "bibliotecario"
                          ? "Bibliotecario"
                          : "Estudiante"
                      }
                      tone={user.rol === "bibliotecario" ? "info" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {user.activo ? (
                      <StatusBadge
                        status="disponible"
                        label="Activa"
                        tone="success"
                      />
                    ) : (
                      <StatusBadge
                        status="cancelada"
                        label="Inactiva"
                        tone="neutral"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/usuarios/${user.id}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-semibold hover:bg-secondary"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </Link>
                      {!isSelf && (
                        <Button
                          variant={user.activo ? "danger" : "secondary"}
                          size="sm"
                          disabled={pending}
                          onClick={() => setTarget(user)}
                        >
                          {user.activo ? (
                            <>
                              <UserX aria-hidden="true" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck aria-hidden="true" />
                              Activar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        variant="confirm"
        title={target?.activo ? "Desactivar usuario" : "Activar usuario"}
        message={
          target?.activo
            ? `${target?.nombre} no podrá iniciar sesión hasta reactivarlo. Su historial se conserva. ¿Continuar?`
            : `${target?.nombre} podrá volver a iniciar sesión. ¿Continuar?`
        }
        confirmLabel={target?.activo ? "Desactivar" : "Activar"}
        onConfirm={confirmToggle}
      />
    </>
  );
}
