/**
 * Builder de RUCTB para RUCs con letras de extranjería: E, N, PE.
 *
 * E  = Extranjero residente
 * N  = Naturalizado
 * PE = Panameño Extranjero (nacido en el extranjero)
 *
 * Estos RUCs NO llevan código de provincia.
 * Formato: "E-XX-XXXX", "N-XX-XXXX", "PE-XX-XXXX"
 *
 * Fórmulas:
 *   - Si folio < 4 dígitos:
 *     "5" + "00" + letraCodigo(2) + folio(3) + asiento(5 o 6) → padded a 20
 *   - Si folio >= 4 dígitos:
 *     "5" + codigoValidacion(2) + letraCodigo(2) + folio(4) + asiento(5 o 6) → padded a 20
 *
 * Excepción: para E y N, si asiento tiene 6 dígitos, no se trunca a 5.
 */

import { LETRAS_NATURAL, type LetraNatural } from "../../data/letras.js";
import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface ExtranjeroRuctbInput {
  readonly letra: LetraNatural;
  readonly folio: string;
  readonly asiento: string;
}

export interface ExtranjeroRuctbResult {
  readonly ructb: string;
  readonly normalizedFolio: string;
  readonly normalizedAsiento: string;
}

const MAX_FOLIO_LENGTH = 4;
const MAX_ASIENTO_LENGTH = 9;
const RUCTB_LENGTH = 20;

const ALLOWS_6_DIGIT_ASIENTO: ReadonlySet<LetraNatural> = new Set([
  LETRAS_NATURAL.EXTRANJERO,
  LETRAS_NATURAL.NATURALIZADO,
]);

export function buildExtranjeroRuctb(input: ExtranjeroRuctbInput): ExtranjeroRuctbResult {
  const { letra, folio, asiento } = input;

  // Validar que sea letra de extranjería
  if (
    letra !== LETRAS_NATURAL.EXTRANJERO &&
    letra !== LETRAS_NATURAL.NATURALIZADO &&
    letra !== LETRAS_NATURAL.PANAMENO_EXTRANJERO
  ) {
    throw new RucError(RUC_ERROR_CODES.UNKNOWN_LETTER, {
      received: letra.letra,
      expected: "E, N o PE",
      field: "letra",
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

  const allowsLongAsiento = ALLOWS_6_DIGIT_ASIENTO.has(letra);

  // Construir RUCTB
  let raw: string;

  if (folio.length < 4) {
    // Folio corto
    const letraCode = letra.codigo.padEnd(2, "0");
    const folioPadded = folio.padStart(3, "0");

    if (allowsLongAsiento && asiento.length === 6) {
      raw = `500${letraCode}${folioPadded}${asiento}`;
    } else {
      const asientoPadded = asiento.slice(0, 5).padStart(5, "0");
      raw = `500${letraCode}${folioPadded}${asientoPadded}`;
    }
  } else {
    // Folio largo
    const folioPadded = folio.padStart(4, "0");

    if (allowsLongAsiento && asiento.length === 6) {
      const letraCode = letra.codigo.padEnd(2, "0");
      raw = `5${letra.codigoValidacion}${letraCode}${folioPadded}${asiento}`;
    } else {
      const asientoPadded = asiento.slice(0, 5).padStart(5, "0");
      raw = `5${letra.codigoValidacion}${letra.codigo}${folioPadded}${asientoPadded}`;
    }
  }

  const ructb = raw.padStart(RUCTB_LENGTH, "0");

  return {
    ructb,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}
