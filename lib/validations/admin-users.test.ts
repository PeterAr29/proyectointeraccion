import { describe, expect, it } from "vitest";

import {
  adminCreateUserSchema,
  adminEditUserSchema,
} from "@/lib/validations/admin-users";

const createBase = {
  nombre: "Ana Torres",
  codigo: "202100999",
  carrera: "",
  correo: "ana.nueva@univ.edu.pe",
  telefono: "",
  rol: "estudiante",
  password: "Biblioteca123",
};

describe("adminCreateUserSchema", () => {
  it("acepta un alta válida", () => {
    expect(adminCreateUserSchema.safeParse(createBase).success).toBe(true);
  });

  it("rechaza correo inválido", () => {
    expect(
      adminCreateUserSchema.safeParse({ ...createBase, correo: "no-es-correo" })
        .success,
    ).toBe(false);
  });

  it("rechaza contraseña sin complejidad", () => {
    expect(
      adminCreateUserSchema.safeParse({
        ...createBase,
        password: "todominusculas",
      }).success,
    ).toBe(false);
  });

  it("rechaza un rol fuera del enum", () => {
    expect(
      adminCreateUserSchema.safeParse({ ...createBase, rol: "superadmin" })
        .success,
    ).toBe(false);
  });
});

describe("adminEditUserSchema", () => {
  it("acepta edición con activo booleano y rol válido", () => {
    const parsed = adminEditUserSchema.safeParse({
      nombre: "Ana Torres",
      carrera: "Medicina",
      telefono: "987654321",
      rol: "bibliotecario",
      activo: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza nombre demasiado corto", () => {
    expect(
      adminEditUserSchema.safeParse({
        nombre: "A",
        carrera: "",
        telefono: "",
        rol: "estudiante",
        activo: false,
      }).success,
    ).toBe(false);
  });
});
