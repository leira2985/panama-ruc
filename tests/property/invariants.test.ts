import { describe, expect, it } from "vitest";
import { calculateDV } from "../../src/api/calculate-dv.js";
import { generate } from "../../src/api/generate.js";
import { parse } from "../../src/api/parse.js";
import { validate } from "../../src/api/validate.js";
import { normalize } from "../../src/core/normalizer.js";

describe("Property-based: invariantes", () => {
  it("Todo RUC generado pasa su propia validación", () => {
    // validate() prueba ambas interpretaciones para RUC corto ambiguo, así que
    // un RUC generado (natural o jurídica) con su DV embebido valida sin hint.
    const rucs = generate({ count: 100, seed: 12345 }) as string[];
    for (const ruc of rucs) {
      expect(validate(ruc).valid).toBe(true);
    }
  });

  it("normalize es idempotente: normalize(normalize(x)) === normalize(x)", () => {
    const samples = ["8-783-1657", "  8 783 1657  ", "8.783.1657", "8/783/1657", "pe-1-2-3"];
    for (const s of samples) {
      const once = normalize(s);
      const twice = normalize(once);
      expect(twice).toBe(once);
    }
  });

  it("calculateDV es determinístico", () => {
    const ruc = "8-783-1657";
    const a = calculateDV(ruc);
    const b = calculateDV(ruc);
    const c = calculateDV(ruc);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("parse(x).fullId === `${normalizedRuc} DV${dv}`", () => {
    const samples = ["8-783-1657", "2588017-1-831938", "8-30213562"];
    for (const ruc of samples) {
      const data = parse(ruc);
      expect(data.fullId).toBe(`${data.normalizedRuc} DV${data.dv}`);
    }
  });

  it("RUCs generados con la misma seed son iguales", () => {
    const a = generate({ seed: 999, count: 50 }) as string[];
    const b = generate({ seed: 999, count: 50 }) as string[];
    expect(a).toEqual(b);
  });

  it("Distintas seeds producen RUCs distintos", () => {
    const a = generate({ seed: 1, count: 50 }) as string[];
    const b = generate({ seed: 2, count: 50 }) as string[];
    expect(a).not.toEqual(b);
  });
});
