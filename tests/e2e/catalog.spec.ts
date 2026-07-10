import { test, expect } from "@playwright/test";

/**
 * E2E del catálogo (F2.1). Usa el usuario semilla María (F1.2) y los 7 libros
 * del seed. Requiere el proyecto Supabase remoto aplicado y `.env.local`.
 */

const CODIGO = "202100123";
const PASSWORD = "Biblioteca123";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Código universitario").fill(CODIGO);
  await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/inicio/);
}

test("el catálogo lista los libros del seed", async ({ page }) => {
  await login(page);
  await page.goto("/catalogo");

  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sistemas Operativos Modernos" }),
  ).toBeVisible();
  await expect(page.getByText(/libros encontrados/)).toBeVisible();
});

test("la búsqueda por autor filtra los resultados", async ({ page }) => {
  await login(page);
  await page.goto("/catalogo");

  await page.getByLabel("Buscar").fill("Tanenbaum");
  await page.getByRole("button", { name: "Buscar" }).click();

  // Solo quedan los libros de Tanenbaum (Redes y Sistemas Operativos Modernos).
  await expect(
    page.getByRole("heading", { name: "Redes de Computadoras" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Bases de Datos" }),
  ).toHaveCount(0);
});

test("una búsqueda sin coincidencias muestra el estado vacío", async ({
  page,
}) => {
  await login(page);
  await page.goto("/catalogo?q=zzzznoexiste");

  await expect(page.getByText("Sin resultados")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver todo el catálogo" }),
  ).toBeVisible();
});
