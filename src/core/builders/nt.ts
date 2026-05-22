/**
 * Builder de RUCTB para RUCs de tipo NT (No Tradicional).
 *
 * Cubre dos subtipos que comparten el formato textual `provincia-NT-folio-asiento`
 * pero difieren en cómo se arma el RUCTB (y por tanto en el DV):
 *
 *   - natural-nt  → extranjero residente. RUCTB lleva el prefijo "5".
 *   - juridica-nt → entidad sin fines de lucro. RUCTB NO lleva el "5".
 *
 * El segmento "43" es el código de catálogo NT publicado por DGI (mismo rol
 * que "00" para natural sin letra). El RUCTB final tiene 20 caracteres.
 */

import { resolveProvincia } from "../../data/provincias.js";
import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface NtRuctbInput {
  readonly provinciaCode: string;
  readonly folio: string;
  readonly asiento: string;
}

export interface NtRuctbResult {
  readonly ructb: string;
  readonly normalizedProvincia: string;
  readonly normalizedFolio: string;
  readonly normalizedAsiento: string;
}

const NT_CODE = "43";
const MAX_FOLIO_LENGTH = 3;
const RUCTB_LENGTH = 20;

function validateCommon(input: NtRuctbInput, maxAsiento: number): string {
  const { provinciaCode, folio, asiento } = input;

  const provincia = resolveProvincia(provinciaCode);
  if (!provincia) {
    throw new RucError(RUC_ERROR_CODES.UNKNOWN_PROVINCE, {
      received: provinciaCode,
      field: "provincia",
    });
  }

  if (!folio) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_EMPTY, { field: "folio" });
  }
  if (!isAllDigits(folio)) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_NOT_NUMERIC, { received: folio, field: "folio" });
  }
  if (folio.length > MAX_FOLIO_LENGTH) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_TOO_LONG, {
      received: folio,
      expected: `máx ${MAX_FOLIO_LENGTH}`,
      field: "folio",
    });
  }

  if (!asiento) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_EMPTY, { field: "asiento" });
  }
  if (!isAllDigits(asiento)) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_NOT_NUMERIC, {
      received: asiento,
      field: "asiento",
    });
  }
  if (asiento.length > maxAsiento) {
    throw new RucError(RUC_ERROR_CODES.ASIENTO_TOO_LONG, {
      received: asiento,
      expected: `máx ${maxAsiento}`,
      field: "asiento",
    });
  }

  return provincia.codigo;
}

/**
 * Construye el RUCTB para un RUC natural-nt (extranjero residente).
 * El asiento admite hasta 6 dígitos; con 6 se ensancha el bloque y se reduce
 * el padding de ceros a la izquierda.
 */
export function buildNaturalNtRuctb(input: NtRuctbInput): NtRuctbResult {
  const provCode = validateCommon(input, 6);
  const { folio, asiento } = input;
  const prov = provCode.padStart(2, "0");
  const folioPadded = folio.padStart(3, "0");

  const raw =
    asiento.length <= 5
      ? `5${prov}${NT_CODE}${folioPadded}${asiento.padStart(5, "0")}`
      : `5${prov}${NT_CODE}${folioPadded}${asiento.padStart(6, "0")}`;

  return {
    ructb: raw.padStart(RUCTB_LENGTH, "0"),
    normalizedProvincia: provCode,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}

/**
 * Construye el RUCTB para un RUC juridica-nt (entidad sin fines de lucro).
 * Mismo formato textual que natural-nt, pero el RUCTB no lleva el prefijo "5",
 * por lo que el DV resultante difiere.
 */
export function buildJuridicaNtRuctb(input: NtRuctbInput): NtRuctbResult {
  const provCode = validateCommon(input, 7);
  const { folio, asiento } = input;
  const prov = provCode.padStart(2, "0");
  const folioPadded = folio.padStart(3, "0");

  const raw =
    asiento.length === 6
      ? `${prov}${NT_CODE}${folioPadded}${asiento.padStart(6, "0")}`
      : `${prov}${NT_CODE}${folioPadded}${asiento.slice(0, 5).padStart(5, "0")}`;

  return {
    ructb: raw.padStart(RUCTB_LENGTH, "0"),
    normalizedProvincia: provCode,
    normalizedFolio: folio,
    normalizedAsiento: asiento,
  };
}
