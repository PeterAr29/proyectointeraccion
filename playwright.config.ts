import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright inicializado en F1.1. Los specs e2e de flujos críticos
 * (login, buscar+prestar, renovar/devolver) llegan desde F1.4 en adelante.
 *
 * webServer: en local se usa `npm run dev` (rápido y con hot-reload). En CI se
 * corre contra el **build de producción** (`npm run start`, que el workflow
 * construye antes): el modo dev compila las rutas bajo demanda y, en un runner
 * en frío, la primera carga puede no hidratar a tiempo → el formulario cae a un
 * submit nativo GET y el login falla. Producción sirve el JS ya compilado, que es
 * además lo que ejecuta el usuario real.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
