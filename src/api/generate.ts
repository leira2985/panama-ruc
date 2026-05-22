/**
 * API: generate
 *
 * Generador de RUCs válidos para testing/mocking.
 * Soporta seed para reproducibilidad.
 */

import { listProvincias } from "../data/provincias.js";
import type { GenerateOptions } from "../types/options.js";
import { calculateDV } from "./calculate-dv.js";

/**
 * Simple PRNG (Mulberry32) para reproducibilidad con seed.
 */
function createPrng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Genera un RUC válido con su DV.
 *
 * @example
 * generate()                              // → "8-1234-5678-XX"
 * generate({ type: "juridica" })          // → "1234567-1-12345-XX"
 * generate({ provincia: "PANAMA" })        // → "8-XXXX-XXXX-XX"
 * generate({ count: 100 })                // → ["...", "...", ...]
 */
export function generate(options: GenerateOptions = {}): string | string[] {
  const type = options.type ?? "natural";
  const count = options.count ?? 1;
  const seed = options.seed ?? Date.now();
  const rng = createPrng(seed);

  const generateOne = (): string => {
    if (type === "natural") {
      return generateNatural(rng, options.provincia);
    }
    return generateJuridica(rng);
  };

  if (count === 1) {
    return generateOne();
  }

  const results: string[] = new Array(count);
  for (let i = 0; i < count; i++) {
    results[i] = generateOne();
  }
  return results;
}

function generateNatural(rng: () => number, provinciaName?: string): string {
  const provincias = listProvincias().filter((p) => p.codigo !== "00");

  let provincia = provincias[randomInt(rng, 0, provincias.length - 1)];
  if (provinciaName) {
    const found = provincias.find(
      (p) =>
        p.nombre.toUpperCase() === provinciaName.toUpperCase() ||
        p.codigo === provinciaName.padStart(2, "0"),
    );
    if (found) provincia = found;
  }

  if (!provincia) {
    provincia = provincias[0]!;
  }

  const folio = randomInt(rng, 1, 9999);
  const asiento = randomInt(rng, 1, 99999);

  const ruc = `${Number.parseInt(provincia.codigo, 10)}-${folio}-${asiento}`;
  const dv = calculateDV(ruc);
  return `${ruc}-${dv}`;
}

function generateJuridica(rng: () => number): string {
  const rolloTomo = randomInt(rng, 1000000, 9999999);
  const folio = randomInt(rng, 1, 9999);
  const asiento = randomInt(rng, 1, 999999);

  const ruc = `${rolloTomo}-${folio}-${asiento}`;
  const dv = calculateDV(ruc);
  return `${ruc}-${dv}`;
}
