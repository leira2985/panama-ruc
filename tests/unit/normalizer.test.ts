import { describe, expect, it } from "vitest";
import { isAllDigits, normalize, splitRucAndDv } from "../../src/core/normalizer.js";

describe("normalize", () => {
  it("quita espacios al inicio y final", () => {
    expect(normalize("  8-783-1657  ")).toBe("8-783-1657");
  });

  it("convierte espacios internos en guiones", () => {
    expect(normalize("8 783 1657")).toBe("8-783-1657");
  });

  it("convierte puntos en guiones", () => {
    expect(normalize("8.783.1657")).toBe("8-783-1657");
  });

  it("convierte slashes en guiones", () => {
    expect(normalize("8/783/1657")).toBe("8-783-1657");
  });

  it("colapsa separadores múltiples", () => {
    expect(normalize("8 . 783 / 1657")).toBe("8-783-1657");
  });

  it("convierte a mayúsculas", () => {
    expect(normalize("pe-1-2-3")).toBe("PE-1-2-3");
    expect(normalize("8pi-783-1657")).toBe("8PI-783-1657");
  });

  it("colapsa guiones duplicados", () => {
    expect(normalize("8--783--1657")).toBe("8-783-1657");
  });

  it("retorna string vacío si input no es string", () => {
    expect(normalize(null as unknown as string)).toBe("");
    expect(normalize(undefined as unknown as string)).toBe("");
  });

  it("maneja string vacío", () => {
    expect(normalize("")).toBe("");
  });
});

describe("splitRucAndDv", () => {
  it("separa el DV si viene incluido en RUC natural", () => {
    expect(splitRucAndDv("8-783-1657-23")).toEqual(["8-783-1657", "23"]);
  });

  it("retorna null como DV si no viene", () => {
    expect(splitRucAndDv("8-783-1657")).toEqual(["8-783-1657", null]);
  });

  it("padea el DV a 2 dígitos", () => {
    expect(splitRucAndDv("8-783-1657-5")).toEqual(["8-783-1657", "05"]);
  });
});

describe("isAllDigits", () => {
  it("retorna true para strings de dígitos", () => {
    expect(isAllDigits("123")).toBe(true);
    expect(isAllDigits("0")).toBe(true);
  });

  it("retorna false para strings vacíos", () => {
    expect(isAllDigits("")).toBe(false);
  });

  it("retorna false si contiene caracteres no dígitos", () => {
    expect(isAllDigits("12a")).toBe(false);
    expect(isAllDigits("a12")).toBe(false);
    expect(isAllDigits("1.2")).toBe(false);
  });
});
