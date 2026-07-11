"use client";

import * as React from "react";

import { Dialog } from "@/components/feedback/Dialog";

/**
 * Registra el service worker de la PWA (F6.2) y vigila el estado de conexión.
 *
 * - Registro: solo en producción y si el navegador soporta SW. En desarrollo se
 *   omite para no interferir con el hot-reload.
 * - Conexión: escucha los eventos `online`/`offline` del navegador y muestra el
 *   diálogo global `offline` (F1.3) cuando se pierde la red. El botón "Reintentar"
 *   recarga si ya hay conexión; si sigue caída, el diálogo permanece.
 */
export function ServiceWorker() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Un fallo al registrar el SW no debe romper la app; se ignora.
      });
    }

    // Estado inicial + suscripción a cambios de conectividad.
    setOffline(!navigator.onLine);
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleRetry = React.useCallback(() => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setOffline(true);
    }
  }, []);

  return (
    <Dialog
      open={offline}
      variant="offline"
      onClose={() => setOffline(false)}
      onConfirm={handleRetry}
    />
  );
}
