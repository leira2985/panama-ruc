/**
 * Builder de RUCTB para RUC Natural sin letra especial.
 *
 * Fórmula: "5" + provincia(2) + "00" + folio(3) + asiento(5) → padded a 20
 */

import { resolveProvincia } from "../../data/provincias.js";
import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface NaturalRuctbInput {
  readonly provinciaCode: string;
  readonly folio: string;
  readonly asiento: string;
}

export interface NaturalRuctbResult {
  readonly ructb: string;
  readonly normalizedProvincia: string;
  readonly normalizedFolio: string;
  readonly normalizedAsiento: string;
}

const MAX_FOLIO_LENGTH = 4;
const MAX_ASIENTO_LENGTH = 9;
const RUCTB_LENGTH = 20;

export function buildNaturalRuctb(input: NaturalRuctbInput): NaturalRuctbResult {
  const { provinciaCode, folio, asiento } = input;

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

  // Construir RUCTB
  const provPadded = provincia.codigo.padStart(2, "0");
  const folioPadded = folio.padStart(3, "0");
  const asientoTruncated = asiento.slice(0, 5).padStart(5, "0");

  const raw = `5${provPadded}00${folioPadded}${asientoTruncated}`;
  const ructb = raw.padStart(RUCTB_LENGTH, "0");

  return {
    ructb,
    normalizedProvincia: provincia.codigo,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}
