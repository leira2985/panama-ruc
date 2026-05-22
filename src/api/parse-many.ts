/**
 * API: parseMany
 *
 * Procesamiento en lote (batch) de múltiples RUCs.
 * Optimizado para procesar miles de RUCs eficientemente.
 */

import type { BatchOptions } from "../types/options.js";
import type { BatchResult, ParseResult } from "../types/result.js";
import { clearParseCache, safeParse } from "./parse.js";

/**
 * Procesa un lote de RUCs en una sola llamada.
 *
 * Optimizaciones aplicadas:
 *   - Cache LRU automático (configurable)
 *   - No allocations innecesarias
 *   - Una sola pasada
 *
 * @param inputs Array de RUCs a procesar
 * @param options Opciones de batch
 * @returns Resultado con estadísticas y todos los resultados individuales
 *
 * @example
 * const result = parseMany(["8-783-1657", "2588017-1-831938"]);
 * console.log(`${result.validCount}/${result.total} válidos en ${result.elapsedMs}ms`);
 */
export function parseMany(inputs: readonly string[], options: BatchOptions = {}): BatchResult {
  const startTime = performance.now();
  const continueOnError = options.continueOnError !== false;
  const useCache = options.useCache !== false;

  if (!useCache) {
    clearParseCache();
  }

  const results: ParseResult[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i] ?? "";
    const result = safeParse(input);

    if (result.ok) {
      results.push({ ok: true, value: result.value });
      validCount++;
    } else {
      const err = result.error;
      const failure: ParseResult = {
        ok: false,
        code: err.code,
        message: err.message,
        input,
        ...(err.field !== undefined && { field: err.field }),
      };
      results.push(failure);
      invalidCount++;

      if (!continueOnError) {
        // Llenar el resto con marcadores de "no procesado"
        for (let j = i + 1; j < inputs.length; j++) {
          results.push({
            ok: false,
            code: "INVALID_FORMAT",
            message: "No procesado (continueOnError=false)",
            input: inputs[j] ?? "",
          });
          invalidCount++;
        }
        break;
      }
    }
  }

  const elapsedMs = performance.now() - startTime;

  return {
    total: inputs.length,
    validCount,
    invalidCount,
    results,
    elapsedMs,
  };
}

/**
 * Versión que retorna solo los DVs (ultra rápido si solo necesitás eso).
 */
export function calculateDvMany(inputs: readonly string[]): readonly (string | null)[] {
  const result: (string | null)[] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i] ?? "";
    const parsed = safeParse(input);
    result[i] = parsed.ok ? parsed.value.dv : null;
  }
  return result;
}

/**
 * Versión que retorna solo booleanos de validación.
 */
export function validateMany(inputs: readonly { ruc: string; dv: string }[]): readonly boolean[] {
  const result: boolean[] = new Array(inputs.length);
  for (let i = 0; i < inputs.length; i++) {
    const item = inputs[i];
    if (!item) {
      result[i] = false;
      continue;
    }
    const parsed = safeParse(item.ruc);
    result[i] = parsed.ok && parsed.value.dv === item.dv.padStart(2, "0");
  }
  return result;
}
