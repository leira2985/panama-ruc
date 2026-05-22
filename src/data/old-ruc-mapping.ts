/**
 * Tabla de cross-reference para RUCs Jurídicos antiguos (legacy).
 *
 * Los RUCs jurídicos creados antes de cierta fecha tienen un sistema de
 * numeración diferente y requieren mapear sus 2 dígitos centrales según
 * esta tabla antes de calcular el DV.
 *
 * Un RUC se considera "antiguo" cuando:
 * - Posición 3 (índice 3) es "0"
 * - Posición 4 (índice 4) es "0"
 * - Posición 5 (índice 5) es menor a "5"
 *
 * En ese caso, los caracteres en posiciones 5-6 se sustituyen por el valor
 * mapeado en esta tabla.
 *
 * Referencia: "Cálculo del DV del RUC" - DGI
 */

export const OLD_RUC_CROSS_REF: Readonly<Record<string, string>> = Object.freeze({
  "00": "00",
  "10": "01",
  "11": "02",
  "12": "03",
  "13": "04",
  "14": "05",
  "15": "06",
  "16": "07",
  "17": "08",
  "18": "09",
  "19": "01",
  "20": "02",
  "21": "03",
  "22": "04",
  "23": "07",
  "24": "08",
  "25": "09",
  "26": "02",
  "27": "03",
  "28": "04",
  "29": "05",
  "30": "06",
  "31": "07",
  "32": "08",
  "33": "09",
  "34": "01",
  "35": "02",
  "36": "03",
  "37": "04",
  "38": "05",
  "39": "06",
  "40": "07",
  "41": "08",
  "42": "09",
  "43": "01",
  "44": "02",
  "45": "03",
  "46": "04",
  "47": "05",
  "48": "06",
  "49": "07",
});

/**
 * Verifica si un RUCTB jurídico corresponde a un RUC antiguo.
 * @param ructb El RUC table (20 caracteres ya construido)
 */
export function isOldJuridicaRuc(ructb: string): boolean {
  return ructb[3] === "0" && ructb[4] === "0" && (ructb[5] ?? "9") < "5";
}

/**
 * Aplica el mapeo legacy a un RUCTB jurídico antiguo.
 */
export function applyOldRucMapping(ructb: string): string {
  const key = ructb.slice(5, 7);
  const mapped = OLD_RUC_CROSS_REF[key] ?? key;
  return ructb.slice(0, 5) + mapped + ructb.slice(7);
}
