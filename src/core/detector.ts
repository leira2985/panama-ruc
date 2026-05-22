/**
 * Detector automático de tipo de RUC.
 *
 * Analiza un RUC normalizado y determina su tipo según las reglas de DGI.
 *
 * Reglas de detección:
 *   - Natural NT: contiene "NT" en alguna parte
 *   - Jurídica NT: empieza con un código de entidad NT (155, 156, etc.)
 *   - Natural con letra inicial (E, PE, N): empieza con esa letra
 *   - Natural con letra al medio (AV, PI): primera parte termina en AV/PI
 *   - Jurídica: primera parte tiene 7+ dígitos
 *   - Natural: primera parte tiene 1-2 dígitos (provincia)
 */

import { LETRAS_NATURAL } from "../data/letras.js";
import type { RucType } from "../types/ruc.js";
import { isAllDigits } from "./normalizer.js";

/**
 * Resultado de la detección con información adicional.
 */
export interface DetectionResult {
  readonly type: RucType | null;
  readonly confidence: "high" | "medium" | "low";
  readonly reason: string;
}

/**
 * Detecta el tipo de RUC con información de confianza.
 *
 * @param normalizedRuc RUC ya normalizado (con guiones)
 */
export function detectTypeDetailed(normalizedRuc: string): DetectionResult {
  if (!normalizedRuc) {
    return { type: null, confidence: "high", reason: "Input vacío" };
  }

  const parts = normalizedRuc.split("-");
  if (parts.length < 2) {
    return { type: null, confidence: "high", reason: "Formato sin separadores válido" };
  }

  const firstPart = parts[0] ?? "";

  // Detección 1: RUC NT - tiene "NT" como segunda parte (formato provincia-NT-folio-asiento).
  // El formato textual NO distingue natural-nt de juridica-nt: ambos comparten
  // esta estructura pero producen DV distinto. La detección por texto es por tanto
  // ambigua a propósito; el desambiguado se decide en parse() (tipo explícito o
  // error AMBIGUOUS_NT_TYPE). Aquí marcamos el tipo natural-nt como representante
  // del formato y señalamos la ambigüedad vía confidence.
  if (parts.length === 4 && parts[1] === "NT") {
    return {
      type: "natural-nt",
      confidence: "low",
      reason: "Formato NT (provincia-NT-folio-asiento); subtipo ambiguo sin tipo explícito",
    };
  }

  // Detección 3: Natural con letra inicial completa (E, PE, N)
  if (
    firstPart === LETRAS_NATURAL.EXTRANJERO.letra ||
    firstPart === LETRAS_NATURAL.NATURALIZADO.letra ||
    firstPart === LETRAS_NATURAL.PANAMENO_EXTRANJERO.letra
  ) {
    return {
      type: "natural",
      confidence: "high",
      reason: `Letra inicial ${firstPart}`,
    };
  }

  // Detección 4: Natural con letra interna (AV, PI) - "8PI", "4AV", etc.
  if (firstPart.length >= 3) {
    const last2 = firstPart.slice(-2);
    if (
      last2 === LETRAS_NATURAL.ANTES_VIGENCIA.letra ||
      last2 === LETRAS_NATURAL.PANAMENO_INDIGENA.letra
    ) {
      const prefix = firstPart.slice(0, -2);
      if (isAllDigits(prefix) && prefix.length <= 2) {
        return {
          type: "natural",
          confidence: "high",
          reason: `Provincia + letra ${last2}`,
        };
      }
    }
  }

  // Detección 5: Natural simple - provincia (1-2 dígitos) + 2 partes más
  if (isAllDigits(firstPart) && firstPart.length <= 2 && parts.length === 3) {
    return {
      type: "natural",
      confidence: "high",
      reason: "Formato provincia-folio-asiento",
    };
  }

  // Detección 6: Jurídica - primera parte numérica con 3+ dígitos.
  // Incluye las jurídicas antiguas (legacy), cuyo rollo/tomo puede tener tan
  // solo 4-5 dígitos; el flag legacy se resuelve después sobre el RUCTB, no aquí.
  if (isAllDigits(firstPart) && firstPart.length >= 3 && parts.length === 3) {
    return {
      type: "juridica",
      confidence: "high",
      reason: "Formato rollo-folio-asiento (rollo de 3+ dígitos)",
    };
  }

  return {
    type: null,
    confidence: "low",
    reason: "No coincide con ningún patrón conocido",
  };
}

/**
 * Detecta el tipo de RUC. Versión simple.
 *
 * @param normalizedRuc RUC ya normalizado (con guiones)
 * @returns El tipo detectado o null si no se puede determinar
 */
export function detectType(normalizedRuc: string): RucType | null {
  return detectTypeDetailed(normalizedRuc).type;
}
