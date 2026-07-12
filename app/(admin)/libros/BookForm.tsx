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
import { useToast } from "@/components/feedback/Toast";
import {
  createBookAction,
  updateBookAction,
  uploadCoverAction,
} from "./actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      {formError && <FormAlert>{formError}</FormAlert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            aria-invalid={Boolean(errors.titulo)}
            {...register("titulo")}
          />
          <FieldError message={errors.titulo?.message} />
        </div>
        <div>
          <Label htmlFor="autor">Autor</Label>
          <Input
            id="autor"
            aria-invalid={Boolean(errors.autor)}
            {...register("autor")}
          />
          <FieldError message={errors.autor?.message} />
        </div>
        <div>
          <Label htmlFor="editorial">Editorial</Label>
          <Input id="editorial" {...register("editorial")} />
          <FieldError message={errors.editorial?.message} />
        </div>
        <div>
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            type="number"
            inputMode="numeric"
            aria-invalid={Boolean(errors.anio)}
            {...register("anio")}
          />
          <FieldError message={errors.anio?.message} />
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            aria-invalid={Boolean(errors.isbn)}
            {...register("isbn")}
          />
          <FieldError message={errors.isbn?.message} />
        </div>
        <div>
          <Label htmlFor="categoria">Área</Label>
          <select
            id="categoria"
            aria-invalid={Boolean(errors.categoria)}
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
          <FieldError message={errors.categoria?.message} />
        </div>
        <div>
          <Label htmlFor="ubicacion">Ubicación</Label>
          <Input
            id="ubicacion"
            placeholder="Ej: Estantería B-3"
            {...register("ubicacion")}
          />
          <FieldError message={errors.ubicacion?.message} />
        </div>
        <div>
          <Label htmlFor="cantidad_total">Ejemplares totales</Label>
          <Input
            id="cantidad_total"
            type="number"
            inputMode="numeric"
            min={0}
            aria-invalid={Boolean(errors.cantidad_total)}
            {...register("cantidad_total")}
          />
          <FieldError message={errors.cantidad_total?.message} />
        </div>
        <div>
          <Label htmlFor="cantidad_disponible">Ejemplares disponibles</Label>
          <Input
            id="cantidad_disponible"
            type="number"
            inputMode="numeric"
            min={0}
            aria-invalid={Boolean(errors.cantidad_disponible)}
            {...register("cantidad_disponible")}
          />
          <FieldError message={errors.cantidad_disponible?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <textarea
          id="descripcion"
          rows={4}
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
          {...register("descripcion")}
        />
        <FieldError message={errors.descripcion?.message} />
      </div>

      <div>
        <Label htmlFor="portada">Portada</Label>
        <div className="flex items-start gap-4">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- portada de Storage/preview local; next/image se evalúa en F6.
            <img
              src={previewUrl}
              alt="Vista previa de la portada"
              className="h-28 w-20 shrink-0 rounded border object-cover"
            />
          ) : (
            <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
              Sin portada
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              id="portada"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG o WebP, máx. 2 MB.
            </p>
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
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : isEdit
              ? "Guardar cambios"
              : "Crear libro"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/libros")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
