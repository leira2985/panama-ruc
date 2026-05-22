/**
 * Builder de RUCTB para RUC Natural con letras AV o PI.
 *
 * AV = Antes de la Vigencia (de la cédula)
 * PI = Panameño Indígena
 *
 * Ambos casos llevan código de provincia DESPUÉS del cual va la letra.
 * Ejemplo: "8PI-783-1657" o "1AV-1234-5678"
 *
 * Fórmula:
 *   - Si folio < 4 dígitos:
 *     "5" + provincia(2) + letraCodigo(2) + folio(3) + asiento(5) → padded a 20
 *   - Si folio >= 4 dígitos:
 *     "5" + codigoValidacion(4) + folio(4) + asiento(5) → padded a 20
 */

import { LETRAS_NATURAL, type LetraNatural } from "../../data/letras.js";
import { resolveProvincia } from "../../data/provincias.js";
import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface NaturalLetrasRuctbInput {
  readonly provinciaCode: string;
  readonly letra: LetraNatural;
  readonly folio: string;
  readonly asiento: string;
}

export interface NaturalLetrasRuctbResult {
  readonly ructb: string;
  readonly normalizedProvincia: string;
  readonly normalizedFolio: string;
  readonly normalizedAsiento: string;
}

const MAX_FOLIO_LENGTH = 4;
const MAX_ASIENTO_LENGTH = 8;
const RUCTB_LENGTH = 20;

export function buildNaturalLetrasRuctb(input: NaturalLetrasRuctbInput): NaturalLetrasRuctbResult {
  const { provinciaCode, letra, folio, asiento } = input;

  // Verificar que sea una letra válida para este tipo
  if (letra !== LETRAS_NATURAL.ANTES_VIGENCIA && letra !== LETRAS_NATURAL.PANAMENO_INDIGENA) {
    throw new RucError(RUC_ERROR_CODES.UNKNOWN_LETTER, {
      received: letra.letra,
      expected: "AV o PI",
      field: "letra",
    });
  }

  // Validar provincia
  const provincia = resolveProvincia(provinciaCode);
  if (!provincia) {
    throw new RucError(RUC_ERROR_CODES.UNKNOWN_PROVINCE, {
      received: provinciaCode,
      field: "provincia",
    });
  }

  // Validar folio
  if (!folio) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_EMPTY, { field: "folio" });
  }
  if (!isAllDigits(folio)) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_NOT_NUMERIC, {
      received: folio,
      field: "folio",
    });
  }
  if (folio.length > MAX_FOLIO_LENGTH) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_TOO_LONG, {
      received: folio,
      expected: `máx ${MAX_FOLIO_LENGTH}`,
      field: "folio",
    });
  }

  // Validar asiento
  if (!asiento) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_EMPTY, { field: "asiento" });
  }
  if (!isAllDigits(asiento)) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_NOT_NUMERIC, {
      received: asiento,
      field: "asiento",
    });
  }
  if (asiento.length > MAX_ASIENTO_LENGTH) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_TOO_LONG, {
      received: asiento,
      expected: `máx ${MAX_ASIENTO_LENGTH}`,
      field: "asiento",
    });
  }

  // Construir RUCTB según largo del folio
  let raw: string;
  if (folio.length < 4) {
    const provPadded = provincia.codigo.padStart(2, "0");
    const letraCode = letra.codigo.padEnd(2, "0");
    const folioPadded = folio.padStart(3, "0");
    const asientoPadded = asiento.slice(0, 5).padStart(5, "0");
    raw = `5${provPadded}${letraCode}${folioPadded}${asientoPadded}`;
  } else {
    const folioPadded = folio.padStart(4, "0");
    const asientoPadded = asiento.slice(0, 5).padStart(5, "0");
    raw = `5${letra.codigoValidacion}${folioPadded}${asientoPadded}`;
  }

  const ructb = raw.padStart(RUCTB_LENGTH, "0");

  return {
    ructb,
    normalizedProvincia: provincia.codigo,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}
