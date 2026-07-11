import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  canRenew,
  computeDueDate,
  effectiveLoanStatus,
  filterLoanHistory,
  mapCreateLoanError,
  mapRenewError,
  mapReturnError,
  mergeLoansWithBooks,
  paginateList,
  type Loan,
  type LoanBook,
  type LoanWithBook,
} from "@/lib/services/loans";

/** Crea un `Loan` mínimo para las pruebas puras. */
function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: "l1",
    book_id: "b1",
    user_id: "u1",
    fecha_prestamo: "2026-07-01T00:00:00Z",
    fecha_devolucion_estimada: "2026-07-15T00:00:00Z",
    fecha_devolucion_real: null,
    estado: "activo",
    renovaciones: 0,
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeDueDate", () => {
  it("suma los días de préstamo a la fecha base", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 14);
    expect(due).toEqual(new Date(2026, 6, 24));
  });

  it("cruza correctamente el fin de mes", () => {
    const due = computeDueDate(new Date(2026, 6, 25), 14);
    expect(due).toEqual(new Date(2026, 7, 8)); // 25/07 + 14 = 08/08
  });

  it("con 0 días la fecha no cambia", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 0);
    expect(due).toEqual(new Date(2026, 6, 10));
  });

  it("trunca días fraccionarios", () => {
    const due = computeDueDate(new Date(2026, 6, 10), 14.9);
    expect(due).toEqual(new Date(2026, 6, 24));
  });
});

describe("mapCreateLoanError (SQLSTATE de la RPC → motivo de negocio)", () => {
  it("mapea sin stock (ofrecer reservar)", () => {
    expect(mapCreateLoanError("BT001")).toBe("no-stock");
  });

  it("mapea préstamo duplicado del mismo libro (no permitir doble préstamo)", () => {
    expect(mapCreateLoanError("BT002")).toBe("already-loaned");
  });

  it("mapea libro inexistente y sesión ausente", () => {
    expect(mapCreateLoanError("BT404")).toBe("not-found");
    expect(mapCreateLoanError("BT000")).toBe("no-session");
  });

  it("cualquier otro código cae en error genérico", () => {
    expect(mapCreateLoanError("23505")).toBe("error");
    expect(mapCreateLoanError(undefined)).toBe("error");
  });
});

describe("effectiveLoanStatus (estado efectivo derivado)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 9, 0)); // 10/07/2026
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("es 'devuelto' si tiene fecha de devolución real", () => {
    const loan = makeLoan({ fecha_devolucion_real: "2026-07-05T00:00:00Z" });
    expect(effectiveLoanStatus(loan)).toBe("devuelto");
  });

  it("es 'vencido' si sigue activo y la fecha estimada ya pasó", () => {
    // Fecha date-only: se interpreta en hora local (sin corrimiento por UTC).
    const loan = makeLoan({ fecha_devolucion_estimada: "2026-07-09" });
    expect(effectiveLoanStatus(loan)).toBe("vencido");
  });

  it("es 'activo' si la fecha estimada es hoy o futura", () => {
    expect(
      effectiveLoanStatus(
        makeLoan({ fecha_devolucion_estimada: "2026-07-10" }),
      ),
    ).toBe("activo");
    expect(
      effectiveLoanStatus(
        makeLoan({ fecha_devolucion_estimada: "2026-07-20" }),
      ),
    ).toBe("activo");
  });
});

describe("canRenew (regla §7.2.5)", () => {
  it("permite renovar dentro del límite y sin multa", () => {
    expect(canRenew(makeLoan({ renovaciones: 1 }), 2, false)).toEqual({
      allowed: true,
      reason: null,
    });
  });

  it("bloquea al alcanzar el máximo de renovaciones", () => {
    expect(canRenew(makeLoan({ renovaciones: 2 }), 2, false)).toEqual({
      allowed: false,
      reason: "limit-reached",
    });
  });

  it("bloquea si hay multa pendiente (aunque esté dentro del límite)", () => {
    expect(canRenew(makeLoan({ renovaciones: 0 }), 2, true)).toEqual({
      allowed: false,
      reason: "pending-fine",
    });
  });

  it("bloquea si el préstamo ya fue devuelto", () => {
    const loan = makeLoan({ fecha_devolucion_real: "2026-07-05T00:00:00Z" });
    expect(canRenew(loan, 2, false)).toEqual({
      allowed: false,
      reason: "returned",
    });
  });
});

describe("mergeLoansWithBooks", () => {
  const books: LoanBook[] = [
    { id: "b1", titulo: "Bases de Datos", autor: "García Molina" },
    { id: "b2", titulo: "Algoritmos", autor: "Cormen" },
  ];

  it("empareja cada préstamo con su libro por id", () => {
    const loans = [makeLoan({ id: "l1", book_id: "b2" })];
    expect(mergeLoansWithBooks(loans, books)).toEqual([
      { loan: loans[0], book: books[1] },
    ]);
  });

  it("deja book en null si el libro no está (borrado)", () => {
    const loans = [makeLoan({ id: "l1", book_id: "zzz" })];
    const merged = mergeLoansWithBooks(loans, books);
    expect(merged[0]?.book).toBeNull();
  });
});

describe("mapRenewError / mapReturnError", () => {
  it("mapea los SQLSTATE de renovación", () => {
    expect(mapRenewError("BT100")).toBe("not-renewable");
    expect(mapRenewError("BT101")).toBe("limit-reached");
    expect(mapRenewError("BT102")).toBe("pending-fine");
    expect(mapRenewError("BT000")).toBe("no-session");
    expect(mapRenewError("999")).toBe("error");
  });

  it("mapea los SQLSTATE de devolución", () => {
    expect(mapReturnError("BT200")).toBe("not-returnable");
    expect(mapReturnError("BT000")).toBe("no-session");
    expect(mapReturnError(undefined)).toBe("error");
  });
});

describe("filterLoanHistory", () => {
  const book: LoanBook = { id: "b1", titulo: "Libro", autor: "Autor" };
  const wrap = (loan: Loan): LoanWithBook => ({ loan, book });

  const items: LoanWithBook[] = [
    wrap(
      makeLoan({
        id: "a",
        fecha_prestamo: "2026-06-01",
        estado: "devuelto",
        fecha_devolucion_real: "2026-06-10",
      }),
    ),
    wrap(
      makeLoan({
        id: "b",
        fecha_prestamo: "2026-07-01",
        fecha_devolucion_estimada: "2099-01-01",
      }),
    ), // activo
    wrap(
      makeLoan({
        id: "c",
        fecha_prestamo: "2026-07-05",
        fecha_devolucion_estimada: "2000-01-01",
      }),
    ), // vencido
  ];

  it("sin filtros devuelve todo", () => {
    const out = filterLoanHistory(items, {
      estado: "todos",
      desde: "",
      hasta: "",
    });
    expect(out.map((i) => i.loan.id)).toEqual(["a", "b", "c"]);
  });

  it("filtra por estado efectivo (devuelto/activo/vencido)", () => {
    const dev = filterLoanHistory(items, {
      estado: "devuelto",
      desde: "",
      hasta: "",
    });
    expect(dev.map((i) => i.loan.id)).toEqual(["a"]);

    const venc = filterLoanHistory(items, {
      estado: "vencido",
      desde: "",
      hasta: "",
    });
    expect(venc.map((i) => i.loan.id)).toEqual(["c"]);
  });

  it("filtra por rango de fechas de préstamo (inclusivo)", () => {
    const out = filterLoanHistory(items, {
      estado: "todos",
      desde: "2026-07-01",
      hasta: "2026-07-01",
    });
    expect(out.map((i) => i.loan.id)).toEqual(["b"]);
  });

  it("ignora fechas de filtro inválidas", () => {
    const out = filterLoanHistory(items, {
      estado: "todos",
      desde: "no-fecha",
      hasta: "",
    });
    expect(out).toHaveLength(3);
  });
});

describe("paginateList", () => {
  const items = Array.from({ length: 23 }, (_, i) => i);

  it("devuelve la ventana de la primera página y el total", () => {
    const p = paginateList(items, 1, 10);
    expect(p.items).toHaveLength(10);
    expect(p).toMatchObject({ page: 1, total: 23, totalPages: 3 });
    expect(p.items[0]).toBe(0);
  });

  it("acota la página pedida al total real", () => {
    const p = paginateList(items, 99, 10);
    expect(p.page).toBe(3);
    expect(p.items).toEqual([20, 21, 22]);
  });

  it("con lista vacía hay una sola página vacía", () => {
    expect(paginateList([], 1, 10)).toEqual({
      items: [],
      page: 1,
      total: 0,
      totalPages: 1,
    });
  });
});
