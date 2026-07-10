import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// El transform de JSX/TSX lo aplica esbuild integrado en Vite (runtime "automatic");
// no se necesita @vitejs/plugin-react para los tests unitarios.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Playwright vive en tests/e2e y usa su propio runner.
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
