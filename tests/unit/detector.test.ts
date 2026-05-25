import { describe, expect, it } from "vitest";
import { detectType, detectTypeDetailed } from "../../src/core/detector.js";

describe("detectType", () => {
  it("detecta natural sin letra", () => {
    expect(detectType("8-783-1657")).toBe("natural");
    expect(detectType("13-1-1")).toBe("natural");
  });

  it("detecta natural con letra inicial E", () => {
    expect(detectType("E-1-2")).toBe("natural");
  });

  it("detecta natural con letra inicial N", () => {
    expect(detectType("N-1-2")).toBe("natural");
  });

  it("detecta natural con letra inicial PE", () => {
    expect(detectType("PE-1-2")).toBe("natural");
  });

  it("detecta natural con letra interna AV", () => {
    expect(detectType("8AV-1-2")).toBe("natural");
  });

  it("detecta natural con letra interna PI", () => {
    expect(detectType("4PI-1-2")).toBe("natural");
  });

  it("detecta jurídica", () => {
    expect(detectType("2588017-1-831938")).toBe("juridica");
    expect(detectType("1234567-1-1")).toBe("juridica");
  });

  it("detecta jurídica antigua (legacy) con rollo corto", () => {
    expect(detectType("12388-184-921")).toBe("juridica");
    expect(detectType("1102-85-117211")).toBe("juridica");
  });

  it("NO clasifica como NT las jurídicas que empiezan con 155/156", () => {
    expect(detectType("155720753-2-2022")).toBe("juridica");
    expect(detectType("15565624-2-2017")).toBe("juridica");
  });

  it("detecta formato NT (subtipo ambiguo, marcado como natural-nt)", () => {
    const r = detectTypeDetailed("8-NT-1-24");
    expect(r.type).toBe("natural-nt");
    expect(r.confidence).toBe("low");
  });

  it("retorna null para strings inválidos", () => {
    expect(detectType("")).toBeNull();
    expect(detectType("BASURA")).toBeNull();
    expect(detectType("solo-dos")).toBeNull();
  });
});

describe("detectTypeDetailed", () => {
  it("retorna razón legible (RUC corto ≤14 es ambiguo: confidence low)", () => {
    const result = detectTypeDetailed("8-783-1657");
    expect(result.type).toBe("natural");
    expect(result.confidence).toBe("low");
    expect(result.reason).toContain("ambiguo");
  });

  it("RUC corto con primer grupo >14 es jurídica-legacy sin ambigüedad", () => {
    const result = detectTypeDetailed("82-30-15216");
    expect(result.type).toBe("juridica");
    expect(result.confidence).toBe("high");
  });

  it("indica baja confianza en casos ambiguos", () => {
    const result = detectTypeDetailed("XYZ-1-2");
    expect(result.type).toBeNull();
    expect(result.confidence).toBe("low");
  });
});
