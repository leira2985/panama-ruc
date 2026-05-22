/**
 * API: extractFromText
 *
 * Extrae uno o más RUCs de un bloque de texto sucio.
 * Útil para procesar OCR, scraping, copy-paste, mensajes de WhatsApp, etc.
 */

import { computeFullDv } from "../core/algorithm.js";
import type { ExtractOptions } from "../types/options.js";
import type { ExtractedRuc } from "../types/result.js";
import { safeParse } from "./parse.js";

// Regex que matchea patrones comunes de RUC en texto.
// Captura: cédula natural, jurídica, con letras E/N/PE/AV/PI
const RUC_PATTERNS: readonly RegExp[] = [
  // Persona Jurídica: 7+ dígitos - 1-4 dígitos - 1-6 dígitos (+opcional DV)
  /\b(\d{7,9}[-\s./]\d{1,4}[-\s./]\d{1,6})(?:[-\s./](\d{1,2}))?\b/g,
  // Natural con letras al inicio (E, N, PE)
  /\b((?:PE|E|N)[-\s./]\d{1,4}[-\s./]\d{1,9})(?:[-\s./](\d{1,2}))?\b/gi,
  // Natural con letras internas (8PI, 4AV)
  /\b(\d{1,2}(?:PI|AV)[-\s./]\d{1,4}[-\s./]\d{1,8})(?:[-\s./](\d{1,2}))?\b/gi,
  // Natural simple: 1-2 dígitos - 1-4 dígitos - 1-9 dígitos
  /\b(\d{1,2}[-\s./]\d{1,4}[-\s./]\d{1,9})(?:[-\s./](\d{1,2}))?\b/g,
];

/**
 * Extrae RUCs de un texto.
 *
 * @param text El texto a analizar
 * @param options Opciones de extracción
 * @returns Array de RUCs encontrados (vacío si no hay)
 *
 * @example
 * extractFromText("Cliente RUC 8-783-1657 DV 23 paga $500")
 * // → [{ ruc: "8-783-1657", dv: "23", position: 12, ..., dvValid: true }]
 */
export function extractFromText(
  text: string,
  options: ExtractOptions = {},
): readonly ExtractedRuc[] {
  if (typeof text !== "string" || !text) return [];

  const multiple = options.multiple !== false;
  const validateDv = options.validateDv !== false;
  const found: ExtractedRuc[] = [];
  const seenPositions = new Set<number>();

  for (const pattern of RUC_PATTERNS) {
    pattern.lastIndex = 0; // Reset state
    let match: RegExpExecArray | null;
    // biome-ignore lint/suspicious/noAssignInExpressions: idiomatic regex loop
    while ((match = pattern.exec(text)) !== null) {
      const rucString = match[1];
      if (!rucString) continue;

      const position = match.index;

      // Evitar duplicados en la misma posición (entre patrones)
      if (seenPositions.has(position)) continue;

      const parsed = safeParse(rucString);
      if (!parsed.ok) continue;

      const rucData = parsed.value;
      const extractedDv = match[2] ?? null;

      let dvValid: boolean | null = null;
      if (validateDv && extractedDv) {
        dvValid = rucData.dv === extractedDv.padStart(2, "0");
      }

      seenPositions.add(position);

      found.push({
        ruc: rucString,
        normalizedRuc: rucData.normalizedRuc,
        dv: extractedDv,
        position,
        length: match[0].length,
        type: rucData.type,
        dvValid,
      });

      if (!multiple) {
        // Marcador para silenciar uso de computeFullDv en este path
        void computeFullDv;
        return found;
      }
    }
  }

  // Ordenar por posición en el texto
  found.sort((a, b) => a.position - b.position);

  return found;
}
