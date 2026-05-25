import { describe, expect, it } from "vitest";
import { calculateDV } from "../../src/api/calculate-dv.js";
import { extractFromText } from "../../src/api/extract.js";
import { generate } from "../../src/api/generate.js";
import { parseMany } from "../../src/api/parse-many.js";
import { parse, safeParse } from "../../src/api/parse.js";
import { Ruc } from "../../src/api/ruc-class.js";
import { isValid, validate } from "../../src/api/validate.js";
import { RUC_ERROR_CODES } from "../../src/errors/codes.js";
import knownRucs from "../fixtures/known-rucs.json" with { type: "json" };

describe("calculateDV", () => {
  describe("RUCs naturales conocidos (requieren typeHint: corto ≤14 es ambiguo)", () => {
    for (const fixture of knownRucs.naturales_sin_letra) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc, { typeHint: "natural" })).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs naturales con letra inicial (E, PE, N) conocidos", () => {
    for (const fixture of knownRucs.naturales_con_letra_inicial) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc)).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs naturales con letra interna (AV, PI) conocidos", () => {
    for (const fixture of knownRucs.naturales_con_letra_interna) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc)).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs jurídicos conocidos", () => {
    for (const fixture of knownRucs.juridicas) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc)).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs jurídicos antiguos (legacy) conocidos", () => {
    for (const fixture of knownRucs.juridicas_legacy) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc)).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs natural-nt conocidos (requieren typeHint)", () => {
    for (const fixture of knownRucs.naturales_nt) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc, { typeHint: "natural-nt" })).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs juridica-nt conocidos (requieren typeHint)", () => {
    for (const fixture of knownRucs.juridicas_nt) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc, { typeHint: "juridica-nt" })).toBe(fixture.dv);
      });
    }
  });

  describe("RUCs de Finca conocidos (validados contra DGI oficial)", () => {
    for (const fixture of knownRucs.fincas) {
      it(`calcula DV de ${fixture.ruc} → ${fixture.dv}`, () => {
        expect(calculateDV(fixture.ruc)).toBe(fixture.dv);
      });
    }
  });

  it("falla fuerte (AMBIGUOUS_NT_TYPE) en NT sin typeHint", () => {
    const result = safeParse("8-NT-1-13656");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(RUC_ERROR_CODES.AMBIGUOUS_NT_TYPE);
    }
  });

  it("mismo NT da DV distinto según el subtipo (no es coincidencia)", () => {
    expect(calculateDV("8-NT-1-13656", { typeHint: "natural-nt" })).not.toBe(
      calculateDV("8-NT-1-13656", { typeHint: "juridica-nt" }),
    );
  });

  it("acepta formatos sucios (con typeHint para RUC corto ambiguo)", () => {
    const h = { typeHint: "natural" } as const;
    expect(calculateDV("8 779 231", h)).toBe("76");
    expect(calculateDV("8.779.231", h)).toBe("76");
    expect(calculateDV("  8-779-231  ", h)).toBe("76");
  });

  it("falla fuerte (AMBIGUOUS_NATURAL_JURIDICA) en RUC corto ≤14 sin typeHint", () => {
    // 8-779-231 puede ser natural (DV 76) o jurídica-legacy (DV 70): no se adivina.
    const result = safeParse("8-779-231");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(RUC_ERROR_CODES.AMBIGUOUS_NATURAL_JURIDICA);
    }
  });

  it("RUC corto con primer grupo > 14 se resuelve solo como jurídica-legacy", () => {
    // 82-30-15216 (NESTLE): 82 no es provincia → jurídica-legacy sin ambigüedad.
    expect(calculateDV("82-30-15216")).toBe("04");
  });

  it("mismo RUC corto da DV distinto según natural o jurídica (no coincidencia)", () => {
    expect(calculateDV("8-779-231", { typeHint: "natural" })).not.toBe(
      calculateDV("8-779-231", { typeHint: "juridica" }),
    );
  });
});

describe("validate", () => {
  it("acepta RUC con DV embebido (jurídica, no ambiguo)", () => {
    const result = validate("2588017-1-831938-20");
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.dv).toBe("20");
      expect(result.type).toBe("juridica");
    }
  });

  it("acepta RUC y DV separados", () => {
    const result = validate("2588017-1-831938", "20");
    expect(result.valid).toBe(true);
  });

  it("detecta DV incorrecto", () => {
    const result = validate("2588017-1-831938", "99");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe(RUC_ERROR_CODES.DV_MISMATCH);
      expect(result.expected).toBe("20");
      expect(result.received).toBe("99");
    }
  });

  it("retorna error si no se provee DV", () => {
    const result = validate("2588017-1-831938");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe(RUC_ERROR_CODES.DV_MISSING);
    }
  });

  it("retorna error con input vacío", () => {
    const result = validate("");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.code).toBe(RUC_ERROR_CODES.EMPTY_INPUT);
    }
  });
});

describe("isValid", () => {
  it("retorna booleano", () => {
    expect(isValid("2588017-1-831938", "20")).toBe(true);
    expect(isValid("2588017-1-831938", "99")).toBe(false);
  });
});

describe("parse", () => {
  it("parsea RUC natural completo (con typeHint)", () => {
    const result = parse("8-779-231", { typeHint: "natural" });
    expect(result.type).toBe("natural");
    expect(result.dv).toBe("76");
    expect(result.fullId).toBe("8-779-231-76");
    if (result.type === "natural") {
      expect(result.provincia?.codigo).toBe("08");
      expect(result.folio).toBe("779");
      expect(result.asiento).toBe("231");
    }
  });

  it("parsea RUC jurídico completo", () => {
    const result = parse("2588017-1-831938");
    expect(result.type).toBe("juridica");
    expect(result.dv).toBe("20");
    if (result.type === "juridica") {
      expect(result.rolloTomo).toBe("2588017");
    }
  });

  it("lanza RucError en formato inválido", () => {
    expect(() => parse("BASURA")).toThrow();
    expect(() => parse("")).toThrow();
  });
});

describe("safeParse", () => {
  it("retorna ok:true en éxito", () => {
    const result = safeParse("8-779-231", { typeHint: "natural" });
    expect(result.ok).toBe(true);
  });

  it("retorna ok:false en error sin throw", () => {
    const result = safeParse("BASURA");
    expect(result.ok).toBe(false);
  });
});

describe("parseMany", () => {
  it("procesa múltiples RUCs", () => {
    // RUCs no ambiguos: jurídica (rollo largo) + jurídica-legacy (1er grupo >14).
    const result = parseMany(["82-30-15216", "2588017-1-831938", "BASURA"]);
    expect(result.total).toBe(3);
    expect(result.validCount).toBe(2);
    expect(result.invalidCount).toBe(1);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it("respeta continueOnError=false", () => {
    const result = parseMany(["BASURA", "82-30-15216"], {
      continueOnError: false,
    });
    expect(result.invalidCount).toBe(2);
  });
});

describe("extractFromText", () => {
  it("extrae un RUC con DV de texto", () => {
    const found = extractFromText("Cliente RUC 2588017-1-831938-20 paga $500");
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found[0]?.normalizedRuc).toBe("2588017-1-831938");
  });

  it("retorna array vacío si no hay RUCs", () => {
    expect(extractFromText("hola mundo")).toEqual([]);
  });

  it("maneja input vacío", () => {
    expect(extractFromText("")).toEqual([]);
  });
});

describe("generate", () => {
  it("genera un RUC válido natural por defecto", () => {
    const ruc = generate({ seed: 42 });
    expect(typeof ruc).toBe("string");
    expect(ruc).toMatch(/^\d+-\d+-\d+-\d{2}$/);
  });

  it("genera RUC jurídico", () => {
    const ruc = generate({ type: "juridica", seed: 42 });
    expect(typeof ruc).toBe("string");
  });

  it("genera múltiples", () => {
    const rucs = generate({ count: 5, seed: 42 });
    expect(Array.isArray(rucs)).toBe(true);
    if (Array.isArray(rucs)) {
      expect(rucs.length).toBe(5);
    }
  });

  it("los RUCs generados son válidos", () => {
    const rucs = generate({ count: 10, seed: 42 });
    if (Array.isArray(rucs)) {
      for (const ruc of rucs) {
        const result = validate(ruc);
        expect(result.valid).toBe(true);
      }
    }
  });

  it("es reproducible con seed", () => {
    const a = generate({ seed: 42 });
    const b = generate({ seed: 42 });
    expect(a).toBe(b);
  });
});

describe("Ruc class", () => {
  it("crea desde string válido (natural con typeHint)", () => {
    const ruc = Ruc.from("8-779-231", { typeHint: "natural" });
    expect(ruc.dv).toBe("76");
    expect(ruc.type).toBe("natural");
    expect(ruc.toString()).toBe("8-779-231-76");
  });

  it("tryFrom retorna null en error", () => {
    expect(Ruc.tryFrom("BASURA")).toBeNull();
  });

  it("tryFrom retorna null en RUC corto ambiguo sin typeHint", () => {
    expect(Ruc.tryFrom("8-779-231")).toBeNull();
  });

  it("isValid compara DVs", () => {
    const ruc = Ruc.from("8-779-231", { typeHint: "natural" });
    expect(ruc.isValid("76")).toBe(true);
    expect(ruc.isValid("99")).toBe(false);
  });

  it("expone provincia para naturales", () => {
    const ruc = Ruc.from("8-779-231", { typeHint: "natural" });
    expect(ruc.provincia?.codigo).toBe("08");
  });

  it("expone isLegacy para jurídicas", () => {
    const ruc = Ruc.from("2588017-1-831938");
    expect(typeof ruc.isLegacy).toBe("boolean");
  });

  it("serializa a JSON", () => {
    const ruc = Ruc.from("8-779-231", { typeHint: "natural" });
    const json = ruc.toJSON();
    expect(json.dv).toBe("76");
  });
});
