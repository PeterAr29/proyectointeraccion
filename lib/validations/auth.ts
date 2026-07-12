import { z } from "zod";

/**
 * Esquemas Zod de acceso y perfil (Módulo A).
 * Se reutilizan en cliente (react-hook-form) Y en servidor (Server Actions):
 * la validación del servidor es la que manda; la del cliente es solo UX.
 * Reglas alineadas con especificaciones §5 (A07): contraseña ≥8 con complejidad.
 */

// Código universitario: alfanumérico, 6–20 (cubre "202100123" y "ADMIN0001").
const codigo = z
  .string()
  .trim()
  .min(1, "Ingresa tu código universitario")
  .regex(/^[A-Za-z0-9]{6,20}$/, "Código universitario inválido");

const correo = z
  .string()
  .trim()
  .min(1, "Ingresa tu correo")
  .email("Correo inválido")
  .max(120);

// Contraseña ≥8 con complejidad (mayúscula, minúscula y dígito).
const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[a-z]/, "Incluye al menos una letra minúscula")
  .regex(/[A-Z]/, "Incluye al menos una letra mayúscula")
  .regex(/[0-9]/, "Incluye al menos un número");

const nombre = z
  .string()
  .trim()
  .min(3, "Ingresa tu nombre completo")
  .max(120, "El nombre es demasiado largo");

const carrera = z.string().trim().min(1, "Selecciona tu carrera").max(80);

// Teléfono opcional: dígitos, espacios y +, 6–20 caracteres.
const telefono = z
  .string()
  .trim()
  .regex(/^[0-9+\s]{6,20}$/, "Teléfono inválido")
  .optional()
  .or(z.literal(""));

export const loginSchema = z.object({
  codigo,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z
  .object({
    nombre,
    codigo,
    carrera,
    correo,
    telefono,
    password,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const recoverSchema = z.object({ codigo });

export const updateProfileSchema = z.object({
  nombre,
  carrera: carrera.optional().or(z.literal("")),
  correo,
  telefono,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RecoverInput = z.infer<typeof recoverSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Carreras disponibles en el registro (programas ofrecidos por la universidad). */
export const CARRERAS = [
  "Ingeniería de Sistemas",
  "Informática",
  "Enfermería",
  "Administración",
  "Contabilidad",
  "Trabajo Social",
  "Agronomía",
  "Ingeniería Agroindustrial",
  "Ingeniería Industrial",
  "Ingeniería Mecánica",
] as const;

export type Carrera = (typeof CARRERAS)[number];
