/**
 * Mensaje de error de un campo de formulario, accesible.
 *
 * `role="alert"` hace que el lector de pantalla lo anuncie en cuanto aparece; el
 * `id` se enlaza desde el campo con `aria-describedby`, de modo que también se
 * lea al enfocar el campo (WCAG 3.3.1 Error Identification, 1.3.1 Info and
 * Relationships, 4.1.3 Status Messages). Devuelve `null` si no hay mensaje.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}
