import type { Metadata } from "next";

import { getCirculationSettings } from "@/lib/services/settings";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Configuración" };

/**
 * Configuración de circulación (Módulo E, F5.4). El bibliotecario ajusta los
 * parámetros globales que rigen los préstamos nuevos. Solo bibliotecario (layout
 * `(admin)` + RLS). `getCirculationSettings` nunca falla (cae a los valores por
 * defecto), por eso esta vista no necesita estado de error.
 */
export default async function ConfiguracionPage() {
  const settings = await getCirculationSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-muted-foreground">
          Parámetros de circulación de la biblioteca.
        </p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  );
}
