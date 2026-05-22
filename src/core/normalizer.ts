/**
 * Normalizador de inputs de RUC.
 *
 * Acepta distintos formatos comunes que llegan en CSVs, formularios y
 * texto sucio, y los convierte al formato canónico con guiones.
 *
 * Formatos aceptados:
 *   - "8-783-1657" (canónico)
 *   - "8 783 1657" (espacios)
 *   - "8.783.1657" (puntos)
 *   - "8/783/1657" (slashes)
 *   - "  8-783-1657  " (con espacios extra)
 *   - "8-783-1657-23" (con DV incluido)
 *   - "PE-1-2-3" (con letra)
 */

/**
 * Regex que matchea cualquier separador común.
 * Se compila una sola vez al cargar el módulo.
 */
const SEPARATOR_RE = /[\s./\\|]+/g;

/**
 * Regex para quitar espacios duplicados o internos en partes.
 */
const TRIM_RE = /^\s+|\s+$/g;

/**
 * Normaliza un RUC al formato canónico con guiones.
 *
 * @param input El input crudo del usuario
 * @returns El RUC normalizado en mayúsculas con guiones, sin espacios
 *
 * @example
 * normalize("  8 783 1657  ") // "8-783-1657"
 * normalize("8.783.1657")     // "8-783-1657"
 * normalize("pe-1-2-3")       // "PE-1-2-3"
 */
export function normalize(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Trim externo
  let cleaned = input.replace(TRIM_RE, "");

  // 2. Upper case (para letras E, N, PE, AV, PI)
  cleaned = cleaned.toUpperCase();

  // 3. Reemplazar cualquier separador no-guion por guion
  cleaned = cleaned.replace(SEPARATOR_RE, "-");

  // 4. Colapsar guiones duplicados
  cleaned = cleaned.replace(/-+/g, "-");

  // 5. Quitar guiones al inicio/final
  cleaned = cleaned.replace(/^-|-$/g, "");

  return cleaned;
}

/**
 * Separa un RUC del DV si viene incluido.
 *
 * @returns Tupla [rucSinDv, dvSiExiste]
 *
 * @example
 * splitRucAndDv("8-783-1657-23") // ["8-783-1657", "23"]
 * splitRucAndDv("8-783-1657")    // ["8-783-1657", null]
 */
export function splitRucAndDv(normalizedRuc: string): [string, string | null] {
  const parts = normalizedRuc.split("-");

  // Los RUC NT (provincia-NT-folio-asiento) tienen exactamente 4 partes SIN DV,
  // colisionando con la heurística de "4 partes = ruc+dv". Un NT con DV tendría 5
  // partes. Por eso, si la 2da parte es "NT", el DV solo se separa con 5 partes.
  const isNt = parts.length >= 2 && parts[1] === "NT";
  const dvAtParts = isNt ? 5 : 4;

  // Si el último segmento son 1-2 dígitos exclusivamente, asumimos que es DV.
  if (parts.length === dvAtParts) {
    const lastPart = parts[parts.length - 1] ?? "";
    if (/^\d{1,2}$/.test(lastPart)) {
      const dvPart = lastPart.padStart(2, "0");
      const rucWithoutDv = parts.slice(0, -1).join("-");
      return [rucWithoutDv, dvPart];
    }
  }

  return [normalizedRuc, null];
}

/**
 * Verifica si una cadena contiene solo dígitos.
 * Más rápido que regex para strings cortos.
 */
export function isAllDigits(s: string): boolean {
  if (s.length === 0) return false;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 48 || code > 57) return false;
  }
  return true;
}
