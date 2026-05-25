/**
 * Builder de RUCTB para RUC de tipo Finca (inmueble).
 *
 * Formato textual: "provincia-finca" (dos partes), ej. "8-30213562".
 *
 * El RUCTB se arma como:
 *   provincia(2) + finca.padEnd(8, "0")  → padStart(20, "0")
 *
 * Nota clave: el número de finca se rellena con ceros **a la derecha** hasta 8
 * dígitos (no a la izquierda como otros campos). Esto se validó contra el
 * consultador oficial de la DGI (ConsultarDV, tipo FINCA) con 13 fincas reales
 * de provincias variadas (20, 30, 40, 60, 70, 80): 13/13 coincidencias.
 *
 * El DV se calcula con el módulo 11 estándar, sin salto de peso legacy.
 */

import { RucError } from "../../errors/RucError.js";
import { RUC_ERROR_CODES } from "../../errors/codes.js";
import { isAllDigits } from "../normalizer.js";

export interface FincaRuctbInput {
  readonly provinciaCode: string;
  readonly finca: string;
}

export interface FincaRuctbResult {
  readonly ructb: string;
  readonly normalizedProvincia: string;
  readonly normalizedFinca: string;
}

const FINCA_WIDTH = 8;
const RUCTB_LENGTH = 20;
const MAX_FINCA_LENGTH = 8;

export function buildFincaRuctb(input: FincaRuctbInput): FincaRuctbResult {
  const { provinciaCode, finca } = input;

  if (!provinciaCode || !isAllDigits(provinciaCode)) {
    throw new RucError(RUC_ERROR_CODES.INVALID_PROVINCE_CODE, {
      received: provinciaCode,
      field: "provincia",
    });
  }

  if (!finca) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_EMPTY, { field: "finca" });
  }
  if (!isAllDigits(finca)) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_NOT_NUMERIC, {
      received: finca,
      field: "finca",
    });
  }
  if (finca.length > MAX_FINCA_LENGTH) {
    throw new RucError(RUC_ERROR_CODES.FOLIO_TOO_LONG, {
      received: finca,
      expected: `máx ${MAX_FINCA_LENGTH}`,
      field: "finca",
    });
  }

  // Relleno a la DERECHA en AMBOS campos (característica propia del tipo finca):
  // el primer grupo "8" se trata como "80", por eso "8-30213562" y "80-30213562"
  // producen el mismo DV en la DGI. Validado contra ConsultarDV oficial.
  const provPadded = provinciaCode.padEnd(2, "0");
  const fincaPadded = finca.padEnd(FINCA_WIDTH, "0");
  const ructb = `${provPadded}${fincaPadded}`.padStart(RUCTB_LENGTH, "0");

  return {
    ructb,
    normalizedProvincia: provPadded,
    normalizedFinca: finca,
  };
}
