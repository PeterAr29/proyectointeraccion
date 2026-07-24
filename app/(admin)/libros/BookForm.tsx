"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Book } from "@/lib/services/books";
import { bookFormSchema, type BookFormInput } from "@/lib/validations/books";
import { AREAS, AREA_LABELS, type AreaLabel } from "@/lib/domain/areas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlert } from "@/components/feedback/FormAlert";
import { FormSection } from "@/components/forms/FormSection";
import { FieldError } from "@/components/forms/FieldError";
import { useToast } from "@/components/feedback/Toast";
import {
  createBookAction,
  updateBookAction,
  uploadCoverAction,
} from "./actions";

/**
 * Formulario de alta/edición de libro (Módulo E, F5.2). La portada se sube al
 * Storage al enviar (si se eligió una nueva); el resto se valida con Zod en
 * cliente y servidor. Al guardar, vuelve al listado.
 */
export function BookForm({ book }: { book?: Book }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(book);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(
    book?.portada_url ?? null,
  );
  const [coverFile, setCoverFile] = React.useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookFormInput>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      titulo: book?.titulo ?? "",
      autor: book?.autor ?? "",
      editorial: book?.editorial ?? "",
      anio: book?.anio ?? undefined,
      isbn: book?.isbn ?? "",
      categoria: (AREA_LABELS as readonly string[]).includes(
        book?.categoria ?? "",
      )
        ? (book?.categoria as AreaLabel)
        : "",
      ubicacion: book?.ubicacion ?? "",
      descripcion: book?.descripcion ?? "",
      cantidad_total: book?.cantidad_total ?? 1,
      cantidad_disponible: book?.cantidad_disponible ?? 1,
    },
  });

  const previewUrl = coverFile ? URL.createObjectURL(coverFile) : coverUrl;

  const onSubmit = async (values: BookFormInput) => {
    setFormError(null);

    // 1) Subir la portada nueva (si la hay) antes de guardar el libro.
    let finalCover = coverUrl;
    if (coverFile) {
      const fd = new FormData();
      fd.append("file", coverFile);
      const up = await uploadCoverAction(fd);
      if (!up.ok) {
        setFormError(up.error);
        return;
      }
      finalCover = up.url;
    }

    // 2) Crear o actualizar el libro.
    const result = isEdit
      ? await updateBookAction(book!.id, values, finalCover)
      : await createBookAction(values, finalCover);

    if (result.ok) {
      toast(isEdit ? "Libro actualizado." : "Libro creado.", "success");
      router.push("/libros");
      router.refresh();
      return;
    }
    setFormError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="divide-y rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FormSection title="Datos del libro">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                aria-invalid={Boolean(errors.titulo)}
                aria-describedby={errors.titulo ? "titulo-error" : undefined}
                {...register("titulo")}
              />
              <FieldError id="titulo-error" message={errors.titulo?.message} />
            </div>
            <div>
              <Label htmlFor="autor">Autor</Label>
              <Input
                id="autor"
                aria-invalid={Boolean(errors.autor)}
                aria-describedby={errors.autor ? "autor-error" : undefined}
                {...register("autor")}
              />
              <FieldError id="autor-error" message={errors.autor?.message} />
            </div>
            <div>
              <Label htmlFor="editorial">Editorial</Label>
              <Input
                id="editorial"
                aria-invalid={Boolean(errors.editorial)}
                aria-describedby={
                  errors.editorial ? "editorial-error" : undefined
                }
                {...register("editorial")}
              />
              <FieldError
                id="editorial-error"
                message={errors.editorial?.message}
              />
            </div>
            <div>
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                inputMode="numeric"
                aria-invalid={Boolean(errors.anio)}
                aria-describedby={errors.anio ? "anio-error" : undefined}
                {...register("anio")}
              />
              <FieldError id="anio-error" message={errors.anio?.message} />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                aria-invalid={Boolean(errors.isbn)}
                aria-describedby={errors.isbn ? "isbn-error" : undefined}
                {...register("isbn")}
              />
              <FieldError id="isbn-error" message={errors.isbn?.message} />
            </div>
            <div>
              <Label htmlFor="categoria">Área</Label>
              <select
                id="categoria"
                aria-invalid={Boolean(errors.categoria)}
                aria-describedby={
                  errors.categoria ? "categoria-error" : undefined
                }
                className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground aria-[invalid=true]:border-destructive"
                {...register("categoria")}
              >
                <option value="">Sin área</option>
                {AREAS.map((area) => (
                  <option key={area.slug} value={area.label}>
                    {area.label}
                  </option>
                ))}
              </select>
              <FieldError
                id="categoria-error"
                message={errors.categoria?.message}
              />
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                placeholder="Ej: Estantería B-3"
                aria-invalid={Boolean(errors.ubicacion)}
                aria-describedby={
                  errors.ubicacion ? "ubicacion-error" : undefined
                }
                {...register("ubicacion")}
              />
              <FieldError
                id="ubicacion-error"
                message={errors.ubicacion?.message}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Inventario"
          hint="Los disponibles no pueden superar a los totales."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cantidad_total">Ejemplares totales</Label>
              <Input
                id="cantidad_total"
                type="number"
                inputMode="numeric"
                min={0}
                aria-invalid={Boolean(errors.cantidad_total)}
                aria-describedby={
                  errors.cantidad_total ? "cantidad_total-error" : undefined
                }
                {...register("cantidad_total")}
              />
              <FieldError
                id="cantidad_total-error"
                message={errors.cantidad_total?.message}
              />
            </div>
            <div>
              <Label htmlFor="cantidad_disponible">
                Ejemplares disponibles
              </Label>
              <Input
                id="cantidad_disponible"
                type="number"
                inputMode="numeric"
                min={0}
                aria-invalid={Boolean(errors.cantidad_disponible)}
                aria-describedby={
                  errors.cantidad_disponible
                    ? "cantidad_disponible-error"
                    : undefined
                }
                {...register("cantidad_disponible")}
              />
              <FieldError
                id="cantidad_disponible-error"
                message={errors.cantidad_disponible?.message}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Descripción">
          <textarea
            id="descripcion"
            rows={4}
            aria-label="Descripción"
            aria-invalid={Boolean(errors.descripcion)}
            aria-describedby={
              errors.descripcion ? "descripcion-error" : undefined
            }
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
            {...register("descripcion")}
          />
          <FieldError
            id="descripcion-error"
            message={errors.descripcion?.message}
          />
        </FormSection>

        <FormSection title="Portada" hint="JPG, PNG o WebP, máx. 2 MB.">
          <div className="flex items-start gap-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- portada de Storage/preview local; next/image se evalúa en F6.
              <img
                src={previewUrl}
                alt="Vista previa de la portada"
                className="aspect-[2/3] w-24 shrink-0 rounded-lg object-cover shadow-sm ring-1 ring-black/5"
              />
            ) : (
              <div className="flex aspect-[2/3] w-24 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted/50 px-2 text-center text-xs text-muted-foreground">
                Sin portada
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                id="portada"
                type="file"
                aria-label="Portada"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-soft/70"
              />
              {(coverFile || coverUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverUrl(null);
                  }}
                  className="w-fit text-xs font-medium text-destructive hover:underline"
                >
                  Quitar portada
                </button>
              )}
            </div>
          </div>
        </FormSection>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/libros")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : isEdit
              ? "Guardar cambios"
              : "Crear libro"}
        </Button>
      </div>
    </form>
  );
}
