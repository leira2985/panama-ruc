/**
 * Builder de RUCTB para RUC Jurídica (sociedades).
 *
 * Formato: "rolloTomo-folio-asiento"
 * Ejemplo: "2588017-1-831938"
 *
 * El RUCTB se forma como:
 *   rolloTomo(10) + folio(4) + asiento(6) = 20 caracteres
 *
 * Para RUCs antiguos (legacy), se aplica un mapeo de las posiciones 5-6 antes
 * de calcular el DV. Ver `old-ruc-mapping.ts`.
 */

import { applyOldRucMapping, isOldJuridicaRuc } from "../../data/old-ruc-mapping.js";
import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface JuridicaRuctbInput {
  readonly rolloTomo: string;
  readonly folio: string;
  readonly asiento: string;
}

export interface JuridicaRuctbResult {
  readonly ructb: string;
  readonly isLegacy: boolean;
  readonly normalizedRolloTomo: string;
  readonly normalizedFolio: string;
  readonly normalizedAsiento: string;
}

const MAX_ROLLO_LENGTH = 9;
const MAX_FOLIO_LENGTH = 4;
const MAX_ASIENTO_LENGTH = 6;

export function buildJuridicaRuctb(input: JuridicaRuctbInput): JuridicaRuctbResult {
  const { rolloTomo, folio, asiento } = input;

  // Validar rollo/tomo
  if (!rolloTomo) {
    throw new RucError(RUC_ERROR_CODES.ROLLO_TOO_LONG, {
      received: "",
      field: "rolloTomo",
    });
  }
  if (!isAllDigits(rolloTomo)) {
    throw new RucError(RUC_ERROR_CODES.ROLLO_NOT_NUMERIC, {
      received: rolloTomo,
      field: "rolloTomo",
    });
  }
  if (rolloTomo.length > MAX_ROLLO_LENGTH) {
    throw new RucError(RUC_ERROR_CODES.ROLLO_TOO_LONG, {
      received: rolloTomo,
      expected: `máx ${MAX_ROLLO_LENGTH}`,
      field: "rolloTomo",
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
  let ructb = rolloTomo.padStart(10, "0") + folio.padStart(4, "0") + asiento.padStart(6, "0");

  // Aplicar mapeo legacy si corresponde
  const isLegacy = isOldJuridicaRuc(ructb);
  if (isLegacy) {
    ructb = applyOldRucMapping(ructb);
  }

  return {
    ructb,
    isLegacy,
    normalizedRolloTomo: rolloTomo,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}
