import { test, expect } from "@playwright/test";

/**
 * E2E del flujo de acceso (F1.4). Usa el usuario semilla María (F1.2).
 * Requiere el proyecto Supabase remoto aplicado y `.env.local` con las claves.
 */

const CODIGO = "202100123";
const PASSWORD = "Biblioteca123";

test("una ruta protegida sin sesión redirige al login", async ({ page }) => {
  await page.goto("/inicio");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();
});

test("login con credenciales inválidas muestra error humano", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Código universitario").fill(CODIGO);
  await page.getByLabel("Contraseña", { exact: true }).fill("claveIncorrecta9");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByText(/incorrectos/i)).toBeVisible();
});

test("login exitoso entra al shell y muestra el inicio", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Código universitario").fill(CODIGO);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/inicio/);
  await expect(page.getByRole("heading", { name: /Hola/ })).toBeVisible();

  // El perfil es accesible y muestra el código universitario.
  await page.goto("/perfil");
  await expect(page.getByText(CODIGO)).toBeVisible();

  // Cerrar sesión invalida el acceso a rutas protegidas.
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login/);
});
