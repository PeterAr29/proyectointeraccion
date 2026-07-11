import { z } from "zod";

/**
 * Esquemas de gestión de usuarios por el bibliotecario (Módulo E, F5.2).
 * Reutilizados en cliente y servidor. El correo y el código son datos de
 * IDENTIDAD: se fijan al crear la cuenta y no se editan aquí (cambiarlos
 * desincronizaría el login por código → correo de Supabase Auth). La edición
 * cubre datos de contacto + rol + activación.
 */

const codigo = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{6,20}$/, "Código universitario inválido");

const correo = z.string().trim().email("Correo inválido").max(120);

const nombre = z
  .string()
  .trim()
  .min(3, "Ingresa el nombre completo")
  .max(120, "El nombre es demasiado largo");

const carrera = z.string().trim().max(80).optional().or(z.literal(""));

const telefono = z
  .string()
  .trim()
  .regex(/^[0-9+\s]{6,20}$/, "Teléfono inválido")
  .optional()
  .or(z.literal(""));

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[a-z]/, "Incluye al menos una letra minúscula")
  .regex(/[A-Z]/, "Incluye al menos una letra mayúscula")
  .regex(/[0-9]/, "Incluye al menos un número");

/** Roles asignables por el bibliotecario. */
export const ROLES = ["estudiante", "bibliotecario"] as const;
const rol = z.enum(ROLES);

/** Alta de usuario: incluye credenciales de acceso y rol. */
export const adminCreateUserSchema = z.object({
  nombre,
  codigo,
  carrera,
  correo,
  telefono,
  rol,
  password,
});

/** Edición: datos de contacto + rol + activación (sin correo/código). */
export const adminEditUserSchema = z.object({
  nombre,
  carrera,
  telefono,
  rol,
  activo: z.boolean(),
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;
