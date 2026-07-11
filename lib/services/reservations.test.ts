import { describe, expect, it } from "vitest";

import { mapCreateReservationError } from "@/lib/services/reservations";

describe("mapCreateReservationError (SQLSTATE de la RPC → motivo de negocio)", () => {
  it("mapea que sí hay stock (prestar en vez de reservar)", () => {
    expect(mapCreateReservationError("BT003")).toBe("has-stock");
  });

  it("mapea reserva duplicada del mismo libro", () => {
    expect(mapCreateReservationError("BT004")).toBe("already-reserved");
  });

  it("mapea libro inexistente y sesión ausente", () => {
    expect(mapCreateReservationError("BT404")).toBe("not-found");
    expect(mapCreateReservationError("BT000")).toBe("no-session");
  });

  it("cualquier otro código cae en error genérico", () => {
    expect(mapCreateReservationError("42501")).toBe("error");
    expect(mapCreateReservationError(undefined)).toBe("error");
  });
});
