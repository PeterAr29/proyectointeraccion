import { describe, expect, it } from "vitest";

import {
  DUE_SOON_THRESHOLD_DAYS,
  dueSoonMessage,
  fineGeneratedMessage,
  isDueSoon,
  reservationAvailableMessage,
  unreadCount,
  type DueSoonCandidate,
} from "@/lib/services/notifications";

describe("mensajes de notificación", () => {
  it("multa_generada incluye el monto en soles y el título", () => {
    const msg = fineGeneratedMessage("Redes de Computadoras", 3);
    expect(msg).toContain("«Redes de Computadoras»");
    expect(msg).toContain("S/ 3.00");
  });

  it("vencimiento_proximo incluye la fecha en DD/MM/AAAA", () => {
    const msg = dueSoonMessage("Sistemas Operativos", "2026-07-13");
    expect(msg).toContain("«Sistemas Operativos»");
    expect(msg).toContain("13/07/2026");
  });

  it("reserva_disponible nombra el libro reservado", () => {
    const msg = reservationAvailableMessage("Clean Code");
    expect(msg).toContain("«Clean Code»");
    expect(msg.toLowerCase()).toContain("disponible");
  });
});

describe("unreadCount", () => {
  it("cuenta solo las no leídas", () => {
    expect(
      unreadCount([{ leida: false }, { leida: true }, { leida: false }]),
    ).toBe(2);
  });

  it("es 0 si no hay elementos o están todas leídas", () => {
    expect(unreadCount([])).toBe(0);
    expect(unreadCount([{ leida: true }, { leida: true }])).toBe(0);
  });
});

describe("isDueSoon (vencimiento próximo)", () => {
  const now = new Date(2026, 6, 10); // 10/07/2026 (local)
  const base: DueSoonCandidate = {
    fecha_devolucion_real: null,
    fecha_devolucion_estimada: "2026-07-12",
    vencimiento_notificado_en: null,
  };

  it("avisa si vence dentro de la ventana (hoy..hoy+umbral)", () => {
    expect(
      isDueSoon({ ...base, fecha_devolucion_estimada: "2026-07-10" }, now),
    ).toBe(true);
    expect(
      isDueSoon({ ...base, fecha_devolucion_estimada: "2026-07-13" }, now),
    ).toBe(true);
  });

  it("no avisa si vence más allá del umbral", () => {
    expect(
      isDueSoon({ ...base, fecha_devolucion_estimada: "2026-07-14" }, now),
    ).toBe(false);
  });

  it("no avisa si ya venció (retraso lo cubre la multa)", () => {
    expect(
      isDueSoon({ ...base, fecha_devolucion_estimada: "2026-07-09" }, now),
    ).toBe(false);
  });

  it("no avisa si ya se devolvió o ya se avisó", () => {
    expect(
      isDueSoon({ ...base, fecha_devolucion_real: "2026-07-11" }, now),
    ).toBe(false);
    expect(
      isDueSoon({ ...base, vencimiento_notificado_en: "2026-07-10" }, now),
    ).toBe(false);
  });

  it("el umbral por defecto son 3 días", () => {
    expect(DUE_SOON_THRESHOLD_DAYS).toBe(3);
  });
});
