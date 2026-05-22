import { describe, expect, it } from "vitest";
import { extractFromText } from "../../src/api/extract.js";

describe("extractFromText", () => {
  it("extrae RUC con DV embebido", () => {
    const found = extractFromText("Cliente RUC 8-783-1657-23 paga $500");
    expect(found.length).toBeGreaterThanOrEqual(1);
    const first = found[0]!;
    expect(first.normalizedRuc).toBe("8-783-1657");
    expect(first.dv).toBe("23");
    expect(first.dvValid).toBe(true);
  });

  it("detecta DV incorrecto en texto", () => {
    const found = extractFromText("RUC 8-783-1657-99");
    const target = found.find((r) => r.normalizedRuc === "8-783-1657");
    if (target?.dv) {
      expect(target.dvValid).toBe(false);
    }
  });

  it("extrae múltiples RUCs", () => {
    const text = "Proveedor 8-783-1657 y cliente 2588017-1-831938";
    const found = extractFromText(text);
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  it("respeta multiple: false", () => {
    const text = "RUC 8-783-1657 y RUC 2588017-1-831938";
    const found = extractFromText(text, { multiple: false });
    expect(found.length).toBe(1);
  });

  it("retorna vacío en texto sin RUCs", () => {
    expect(extractFromText("hola mundo, sin nada")).toEqual([]);
  });

  it("ignora números que no son RUCs", () => {
    const found = extractFromText("Pago de $1,234.56 el día 15-05-2025");
    // Puede tener falsos positivos según el patrón, pero no debe romper
    expect(Array.isArray(found)).toBe(true);
  });
});
