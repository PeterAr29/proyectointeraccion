"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  createStudentAccount,
  isCodigoTaken,
  isCorreoTaken,
  resolveAccountByCodigo,
} from "@/lib/services/users";
import {
  loginSchema,
  recoverSchema,
  registerSchema,
} from "@/lib/validations/auth";
import { maskCodigo } from "@/lib/utils/mask";
import {
  checkRateLimit,
  clearAttempts,
  registerFailure,
} from "@/lib/utils/rate-limit";

/**
 * Server Actions de acceso (Módulo A). La validación con Zod se repite aquí:
 * el servidor es la fuente de verdad, la del cliente es solo UX.
 * Los logs enmascaran PII (§5 RNF-SEC-LOG-1) y nunca incluyen contraseñas/tokens.
 */

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const INVALID_CREDENTIALS = "Código o contraseña incorrectos.";

export async function loginAction(input: {
  codigo: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const { codigo, password } = parsed.data;
  const rateKey = `login:${codigo}`;

  const limit = checkRateLimit(rateKey);
  if (limit.blocked) {
    return {
      ok: false,
      error: `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(limit.retryAfter / 60)} minutos.`,
    };
  }

  const account = await resolveAccountByCodigo(codigo);
  if (!account) {
    registerFailure(rateKey);
    console.warn(
      `[auth] login fallido (código no existe) ${maskCodigo(codigo)}`,
    );
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: account.correo,
    password,
  });

  if (error) {
    const result = registerFailure(rateKey);
    console.warn(`[auth] login fallido (credenciales) ${maskCodigo(codigo)}`);
    if (result.blocked) {
      return {
        ok: false,
        error:
          "Cuenta bloqueada temporalmente por seguridad. Intenta en 15 minutos.",
      };
    }
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  if (!account.activo) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Tu cuenta está desactivada. Contacta a la biblioteca.",
    };
  }

  clearAttempts(rateKey);
  console.info(`[auth] login OK ${maskCodigo(codigo)}`);
  redirect("/inicio");
}

export async function registerAction(input: {
  nombre: string;
  codigo: string;
  carrera: string;
  correo: string;
  telefono?: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos del formulario." };
  }
  const data = parsed.data;

  if (await isCodigoTaken(data.codigo)) {
    return { ok: false, error: "Ese código universitario ya está registrado." };
  }
  if (await isCorreoTaken(data.correo)) {
    return { ok: false, error: "Ese correo ya está registrado." };
  }

  const created = await createStudentAccount(
    {
      nombre: data.nombre,
      codigo: data.codigo,
      carrera: data.carrera,
      correo: data.correo,
      telefono: data.telefono || null,
    },
    data.password,
  );
  if (!created.ok) return { ok: false, error: created.message };

  // Auto-inicio de sesión tras el registro para entrar directo al shell.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.correo,
    password: data.password,
  });
  if (error) {
    // La cuenta existe; que inicie sesión manualmente.
    redirect("/login");
  }

  console.info(`[auth] registro OK ${maskCodigo(data.codigo)}`);
  redirect("/inicio");
}

export async function recoverAction(input: {
  codigo: string;
}): Promise<ActionResult> {
  const parsed = recoverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Código inválido." };

  const { codigo } = parsed.data;
  const rateKey = `recover:${codigo}`;
  const limit = checkRateLimit(rateKey);
  if (limit.blocked) {
    return {
      ok: false,
      error: "Demasiadas solicitudes. Intenta más tarde.",
    };
  }
  registerFailure(rateKey);

  const account = await resolveAccountByCodigo(codigo);
  if (account) {
    const origin = (await headers()).get("origin") ?? "";
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(account.correo, {
      redirectTo: origin ? `${origin}/login` : undefined,
    });
    console.info(`[auth] recuperación solicitada ${maskCodigo(codigo)}`);
  }

  // Respuesta genérica siempre (no revelar si el código existe).
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
