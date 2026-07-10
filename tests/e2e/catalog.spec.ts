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

test("abrir un libro muestra su detalle", async ({ page }) => {
  await login(page);
  await page.goto("/catalogo?q=Sistemas Operativos Modernos");

  await page
    .getByRole("link", { name: /Sistemas Operativos Modernos/ })
    .click();

  await expect(
    page.getByRole("heading", { name: "Sistemas Operativos Modernos" }),
  ).toBeVisible();
  await expect(page.getByText(/ejemplar(es)? disponible/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Volver al catálogo" }),
  ).toBeVisible();
});

test("un id inexistente muestra 'Libro no encontrado'", async ({ page }) => {
  await login(page);
  await page.goto("/catalogo/00000000-0000-0000-0000-000000000000");

  await expect(page.getByText("Libro no encontrado")).toBeVisible();
});

test("marcar y quitar un favorito lo refleja en /favoritos", async ({
  page,
}) => {
  await login(page);
  await page.goto("/catalogo?q=Redes de Computadoras");
  await page.getByRole("link", { name: /Redes de Computadoras/ }).click();

  // Marcar como favorito desde el detalle. Esperar la confirmación (toast) para
  // asegurar que el Server Action persistió antes de navegar (evita la carrera).
  await page.getByRole("button", { name: "Añadir a favoritos" }).click();
  await expect(page.getByText("Añadido a favoritos.")).toBeVisible();

  // Aparece en /favoritos.
  await page.goto("/favoritos");
  await expect(
    page.getByRole("heading", { name: "Redes de Computadoras" }),
  ).toBeVisible();

  // Quitarlo lo saca de la lista (restaura el estado original de María). Se
  // acota a la tarjeta de Redes: María tiene otros favoritos con el mismo botón.
  await page
    .getByRole("listitem")
    .filter({ hasText: "Redes de Computadoras" })
    .getByRole("button", { name: "Quitar de favoritos" })
    .click();
  await expect(page.getByText("Quitado de favoritos.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Redes de Computadoras" }),
  ).toHaveCount(0);
});
