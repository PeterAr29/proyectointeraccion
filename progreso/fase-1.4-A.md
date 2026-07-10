# Handoff — F1.4 Acceso + shell + perfil (Módulo A)

**Fecha:** 2026-07-10 · **Dev:** integrador · **Estado:** ✅ Completada · **Cierra:** Fase 1 (fundación) · **Siguiente:** F2 (módulo B, reclamable)

## Qué quedó hecho

El acceso completo de BiblioTEC contra Supabase Auth (login por código
universitario, registro, recuperación), el `middleware.ts` que protege las
rutas, el shell responsive (sidebar/topbar/drawer) y el perfil del usuario
(ver/editar). Con esto **la Fase 1 queda cerrada** y los módulos B–E quedan
abiertos para reclamar.

### Verificaciones (todas en verde)

| Check                          | Resultado                                                |
| ------------------------------ | -------------------------------------------------------- |
| `npx tsc --noEmit`             | Sin errores                                              |
| `npm run lint`                 | Sin errores ni warnings                                  |
| `npm run build`                | OK (rutas auth estáticas; `/inicio`,`/perfil` dinámicas) |
| `npm run test -- --run`        | **17/17** (utils F1.3, sin regresión)                    |
| `npm run test:e2e`             | **3/3** login contra Supabase remoto                     |
| `npm audit --audit-level=high` | **exit 0**                                               |

**E2E (`tests/e2e/auth.spec.ts`), verificado en vivo con el usuario semilla María:**

1. Ruta protegida sin sesión → redirige a `/login`.
2. Credenciales inválidas → error humano ("…incorrectos"); el log del server
   registró `[auth] login fallido (credenciales) 2021***23` (**PII enmascarada** ✓).
3. Login OK (`202100123` / `Biblioteca123`) → entra al shell (`/inicio`, "Hola,
   María"), abre `/perfil` (ve su código), y **Cerrar sesión** invalida el acceso.

## Interfaz de `lib/services/users.ts` (frontera para B–E)

> ÚNICA puerta a `profiles`. B–E la reutilizan (p. ej. para saber el rol/sesión).

- `getCurrentProfile(): Promise<Profile | null>` — perfil del usuario con sesión
  (server client + RLS). Devuelve `null` si no hay sesión/perfil. Exporta el tipo
  `Profile` (= fila de `profiles`).
- `updateOwnProfile(input: UpdateProfileInput)` — edita la propia fila (RLS).
  `{ ok: true } | { ok: false, message }`.
- `resolveAccountByCodigo(codigo): Promise<{correo, activo} | null>` — **admin**
  (service role), solo pre-sesión (login/recuperar). No revela existencia.
- `isCodigoTaken(codigo)`, `isCorreoTaken(correo)` — **admin**, para el registro.
- `createStudentAccount(input, password)` — **admin**: crea `auth.users`
  (correo confirmado) + `profiles`; rol **forzado** a `estudiante`. Con
  compensación (borra el usuario de Auth si falla el insert del perfil).

### Cómo obtener sesión/rol en server (para B–E)

```ts
import { getCurrentProfile } from "@/lib/services/users";
const profile = await getCurrentProfile(); // null si no hay sesión
if (profile?.rol === "bibliotecario") {
  /* … */
} // autorización FINA = RLS igual
```

La autorización real la aplica **RLS**; comprobar el rol en server es solo para
UX/branching, nunca la única barrera.

## Decisiones y detalles no triviales

1. **Login por código, Auth por correo.** Supabase autentica por email; el código
   universitario se resuelve a correo con el **cliente admin** (`lib/supabase/admin.ts`,
   service role) antes de `signInWithPassword`. Único punto donde se usa admin en
   el flujo de sesión.
2. **`lib/supabase/admin.ts` es server-only.** No se usó el paquete `server-only`
   (no instalado, evité añadir dependencia); en su lugar: la clave va sin prefijo
   `NEXT_PUBLIC` (Next nunca la inyecta al cliente) + guarda `typeof window`.
3. **Rate limiting / bloqueo (A04-3, A07-2):** `lib/utils/rate-limit.ts`, en
   memoria, 5 intentos → bloqueo 15 min, por código. **Deuda:** es por-instancia
   (se reinicia con el proceso, no se comparte entre lambdas). En producción real
   movería a un store compartido (Upstash/Redis). Suficiente para el piloto.
4. **Anti-enumeración:** login devuelve siempre "Código o contraseña incorrectos"
   (no distingue código inexistente de clave errada); recuperación responde
   genérico "si el código existe…". El estado `desactivado` solo se revela tras
   password correcto.
5. **Registro con auto-login** para entrar directo al shell. Rol siempre
   `estudiante` (la promoción a bibliotecario es administrativa — §2.2).
6. **`middleware.ts` (archivo sensible, lista "no tocar sin avisar" — creado por
   primera vez aquí, como pide F1.4).** Deny-by-default: `PUBLIC_PATHS`
   (`/`, `/login`, `/registro`, `/recuperar`, `/kitchen-sink`); todo lo demás exige
   sesión. Copia las cookies refrescadas a las respuestas de redirección.
7. **Shell:** `AppShell` (client) monta `ToastProvider` para toda la app; sidebar
   240px con ítem activo azul (`primary-soft` + borde), `Topbar` con campana
   (contador lo cablea D en F4), `MobileNav` drawer <768px. Los ítems de nav de
   pantallas aún no construidas (catálogo, préstamos…) se muestran **deshabilitados**
   ("próximamente") para no dar 404 — se activan al entregar cada módulo
   (`components/layout/nav.ts`).
8. **Recuperación de contraseña:** el flujo llama `resetPasswordForEmail`, pero el
   envío real depende de que Auth tenga SMTP configurado (no lo está en el MVP).
   El flujo/validación quedan correctos; el email es deuda de configuración.

## Archivos nuevos

```
middleware.ts                              · protege rutas + refresca sesión (sensible)
lib/supabase/admin.ts                      · cliente service-role (server-only)
lib/services/users.ts                      · única puerta a profiles
lib/validations/auth.ts                    · Zod: login/registro/recuperar/perfil + CARRERAS
lib/utils/mask.ts                          · enmascarado de PII para logs
lib/utils/rate-limit.ts                    · rate limit / bloqueo en memoria
components/ui/input.tsx, label.tsx         · primitivos de formulario
components/feedback/FormAlert.tsx          · banner de error/éxito de formulario
components/layout/nav.ts                   · ítems de navegación por rol
components/layout/{AppShell,Sidebar,Topbar,MobileNav}.tsx · shell responsive
app/(auth)/layout.tsx                      · layout centrado de acceso
app/(auth)/actions.ts                      · Server Actions login/registro/recuperar/logout
app/(auth)/login|registro|recuperar/       · páginas + *Form.tsx (RHF + Zod)
app/(app)/layout.tsx                       · layout protegido (monta el shell)
app/(app)/inicio/page.tsx                  · pantalla de inicio
app/(app)/perfil/{page,ProfileForm,actions}.tsx · perfil ver/editar
tests/e2e/auth.spec.ts                     · e2e de login
```

Se instaló el navegador de Playwright (`npx playwright install chromium`) para
correr el e2e localmente (no es dependencia npm; en CI se instala en el pipeline).

## TODOs / deudas que hereda la siguiente fase

- [ ] **Activar Leaked Password Protection** en Supabase Auth (HaveIBeenPwned) —
      deuda arrastrada de F1.2 (A07). Es config de dashboard.
- [ ] Configurar SMTP en Supabase Auth para que la recuperación envíe correo real.
- [ ] Rate limit en store compartido si se despliega multi-instancia (hoy en memoria).
- [ ] `supabase link` + regenerar `database.types.ts` con el CLI (deuda de F1.2).
- [ ] CI: añadir `npx playwright install --with-deps chromium` antes de `test:e2e`.

## Cómo lo prueba el siguiente dev

1. `npm run dev` → `http://localhost:3000` redirige a `/login` (sin sesión).
2. Entrar con `202100123` / `Biblioteca123` (o `ADMIN0001` / `Biblioteca123`
   para el rol bibliotecario). Se llega al shell; probar sidebar, drawer móvil
   (<768px), editar el perfil (toast de confirmación) y Cerrar sesión.
3. `npm run test:e2e` → 3/3 (requiere el navegador de Playwright instalado).

## Estado de la Fase 1 — hito de integración ✅

Un usuario del seed inicia sesión, ve el shell y su perfil; un no autenticado es
redirigido a login; `/kitchen-sink` muestra el sistema de diseño. **Fundación
lista (M1).** Módulos B–E quedan **abiertos para reclamar**. Tag `v0.1.0`.
