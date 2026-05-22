import { describe, expect, it } from "vitest";
import { computeDvDigit, computeFullDv } from "../../src/core/algorithm.js";

describe("computeDvDigit", () => {
  it("calcula DV de un RUCTB sin legacy", () => {
    // RUCTB construido a mano para 8-783-1657 (Natural sin letra)
    // = "5" + "08" + "00" + "783" + "01657" → "5080000078301657" padded a 20 = "00005080000078301657"
    const ructb = "00005080000078301657";
    const dv1 = computeDvDigit(ructb, false);
    expect(dv1).toMatch(/^\d$/);
  });

  it("retorna 0 si el resto es 0 o 1", () => {
    // Caso de borde: cuando el resto del módulo 11 es 0 o 1, el DV es 0
    // No es fácil construir un caso a mano, pero verificamos que la función no falle
    const ructb = "00000000000000000000";
    const result = computeDvDigit(ructb, false);
    expect(result).toBe("0");
  });

  it("aplica salto de peso para legacy", () => {
    const ructb = "12345678901234567890";
    const noLegacy = computeDvDigit(ructb, false);
    const withLegacy = computeDvDigit(ructb, true);
    // Los resultados deben diferir cuando hay legacy
    // (porque el peso 12 se reemplaza por 11 una vez)
    expect(noLegacy).not.toBe(withLegacy);
  });
});

describe("computeFullDv", () => {
  it("retorna exactamente 2 dígitos", () => {
    const ructb = "00005080000078301657";
    const dv = computeFullDv(ructb);
    expect(dv).toMatch(/^\d{2}$/);
  });

  it("es determinístico (mismo input → mismo output)", () => {
    const ructb = "00005080000078301657";
    const a = computeFullDv(ructb);
    const b = computeFullDv(ructb);
    expect(a).toBe(b);
  });
});
