import { describe, expect, it } from "vitest";
import { calculateDV } from "../../src/api/calculate-dv.js";
import { generate } from "../../src/api/generate.js";
import { parseMany } from "../../src/api/parse-many.js";

describe("Performance", () => {
  it("calculateDV es < 5µs por llamada (warmup + 10000 iteraciones)", () => {
    // Warmup
    for (let i = 0; i < 1000; i++) calculateDV("8-783-1657");

    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      calculateDV("8-783-1657");
    }
    const elapsed = performance.now() - start;
    const perCallUs = (elapsed / 10000) * 1000;

    console.log(`  ⏱  calculateDV: ${perCallUs.toFixed(2)}µs por llamada`);
    expect(perCallUs).toBeLessThan(5);
  });

  it("parseMany de 10000 RUCs en < 200ms", () => {
    // Generar 10000 RUCs únicos
    const rucs = generate({ count: 10000, seed: 42 }) as string[];

    const start = performance.now();
    const result = parseMany(rucs, { useCache: false });
    const elapsed = performance.now() - start;

    console.log(
      `  ⏱  parseMany 10k: ${elapsed.toFixed(2)}ms (${((elapsed / 10000) * 1000).toFixed(2)}µs/RUC)`,
    );
    expect(result.validCount).toBeGreaterThan(9900); // Casi todos válidos
    expect(elapsed).toBeLessThan(200);
  });

  it("parseMany con cache es mucho más rápido en duplicados", () => {
    const ruc = "8-783-1657";
    const inputs = new Array(10000).fill(ruc);

    const start = performance.now();
    const result = parseMany(inputs, { useCache: true });
    const elapsed = performance.now() - start;

    console.log(`  ⏱  parseMany 10k duplicados (con cache): ${elapsed.toFixed(2)}ms`);
    expect(result.validCount).toBe(10000);
    expect(elapsed).toBeLessThan(50);
  });
});
