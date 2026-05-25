/**
 * API: validate
 *
 * Valida que un RUC y su DV coincidan.
 */

import { normalize, splitRucAndDv } from "../core/normalizer.js";
import { RucError } from "../errors/RucError.js";
import { RUC_ERROR_CODES } from "../errors/codes.js";
import type { ParseOptions } from "../types/options.js";
import type { ValidateResult } from "../types/result.js";
import { safeParse } from "./parse.js";

/**
 * Valida un RUC + DV.
 *
 * Acepta dos formatos:
 *   1. validate("8-783-1657-23") → con DV incluido
 *   2. validate("8-783-1657", "23") → DV separado
 *
 * @returns Un objeto con `valid: true` o `valid: false` + detalles del error
 *
 * @example
 * validate("8-783-1657-23")  // → { valid: true, dv: "23", type: "natural" }
 * validate("8-783-1657", "23")  // → { valid: true, dv: "23", type: "natural" }
 * validate("8-783-1657", "99")  // → { valid: false, code: "DV_MISMATCH", ... }
 */
export function validate(
  input: string,
  expectedDv?: string,
  options?: ParseOptions,
): ValidateResult {
  if (typeof input !== "string" || !input) {
    return {
      valid: false,
      code: RUC_ERROR_CODES.EMPTY_INPUT,
      message: "El RUC no puede estar vacío",
    };
  }

  // Determinar si el DV viene en el input o separado
  const normalized = normalize(input);
  const [rucPart, embeddedDv] = splitRucAndDv(normalized);

  // Normalizar DV esperado
  let expectedDvNormalized: string | null = null;
  if (expectedDv !== undefined) {
    if (typeof expectedDv !== "string" || !/^\d{1,2}$/.test(expectedDv)) {
      return {
        valid: false,
        code: RUC_ERROR_CODES.DV_NOT_NUMERIC,
        message: "El DV esperado debe ser de 1-2 dígitos numéricos",
        received: expectedDv,
      };
    }
    expectedDvNormalized = expectedDv.padStart(2, "0");
  } else if (embeddedDv) {
    expectedDvNormalized = embeddedDv;
  } else {
    return {
      valid: false,
      code: RUC_ERROR_CODES.DV_MISSING,
      message: "No se proveyó un DV para validar",
    };
  }

  // Parsear y calcular.
  const result = safeParse(rucPart, options);

  if (!result.ok) {
    const err = result.error;
    const failure: {
      valid: false;
      code: typeof err.code;
      message: string;
      field?: string;
      expected?: string;
      received?: string;
    } = {
      valid: false,
      code: err.code,
      message: err.message,
    };
    if (err.field !== undefined) failure.field = err.field;
    if (err.expected !== undefined) failure.expected = err.expected;
    if (err.received !== undefined) failure.received = err.received;
    return failure;
  }

  // Comparar DV calculado vs esperado
  if (result.value.dv !== expectedDvNormalized) {
    return {
      valid: false,
      code: RUC_ERROR_CODES.DV_MISMATCH,
      message: "El dígito verificador no coincide",
      expected: result.value.dv,
      received: expectedDvNormalized,
    };
  }

  return {
    valid: true,
    dv: result.value.dv,
    type: result.value.type,
  };
}

/**
 * Versión booleana simple. Útil para condicionales.
 */
export function isValid(input: string, expectedDv?: string, options?: ParseOptions): boolean {
  return validate(input, expectedDv, options).valid;
}

// Export auxiliar para silenciar lint sobre RucError no usado
export { RucError };
