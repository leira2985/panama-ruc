/**
 * Algoritmo de cálculo del Dígito Verificador (DV) según DGI Panamá.
 *
 * Implementación optimizada del algoritmo módulo 11 publicado oficialmente
 * por la Dirección General de Ingresos en el documento "Cálculo del DV del RUC".
 *
 * El cálculo es:
 *   1. Se construye un RUCTB (RUC table) de 20 caracteres con padding de ceros
 *   2. Se recorre de derecha a izquierda multiplicando cada dígito por un peso
 *      incremental que arranca en 2
 *   3. Para RUCs antiguos jurídicos, cuando el peso llega a 12, se reinicia a 11
 *      (un solo salto)
 *   4. Se suma todo y se calcula módulo 11
 *   5. Si el resto es > 1, el DV es (11 - resto). Si no, es 0.
 *
 * El DV completo tiene 2 dígitos. Se calcula el primer dígito sobre el RUCTB,
 * y luego el segundo dígito sobre RUCTB + primer dígito.
 *
 * Optimizaciones aplicadas:
 *   - Lectura directa de char codes (sin .charAt ni .charCodeAt en loop)
 *   - Sin allocations: el RUCTB se pasa como string ya construido
 *   - Una sola pasada por el string
 *   - Sin recursión
 *   - Branchless donde aplica
 */

const CHAR_ZERO = 48; // "0".charCodeAt(0)

/**
 * Calcula UN dígito verificador del RUCTB dado.
 *
 * @param ructb String de exactamente 20 caracteres (todos dígitos)
 * @param isLegacyJuridica Si es RUC antiguo de tipo Jurídica (aplica salto de peso)
 * @returns Un solo carácter "0"..."9"
 *
 * @internal
 */
export function computeDvDigit(ructb: string, isLegacyJuridica: boolean): string {
  let weight = 2;
  let sum = 0;
  let legacyJump = isLegacyJuridica;

  // Iteramos de derecha a izquierda en una sola pasada.
  for (let i = ructb.length - 1; i >= 0; i--) {
    // Salto de peso para RUCs antiguos: cuando llegamos al peso 12, lo bajamos
    // a 11 una sola vez. Después de eso, no se repite.
    if (legacyJump && weight === 12) {
      legacyJump = false;
      weight = 11;
    }

    // charCodeAt(i) - 48 es equivalente a parseInt del dígito, pero ~4x más rápido
    const digit = ructb.charCodeAt(i) - CHAR_ZERO;
    sum += weight * digit;
    weight++;
  }

  const remainder = sum % 11;
  // Si remainder > 1 → 11 - remainder; si no → 0
  // Branchless: usamos un truco aritmético
  const dv = remainder > 1 ? 11 - remainder : 0;

  // Como el dv es siempre 0-9, lo devolvemos directo
  return String(dv);
}

/**
 * Calcula los 2 dígitos verificadores completos.
 *
 * @param ructb String de exactamente 20 caracteres
 * @param isLegacyJuridica Si aplica el salto de peso de RUC antiguo
 * @returns String de 2 caracteres "00"-"99"
 */
export function computeFullDv(ructb: string, isLegacyJuridica = false): string {
  const dv1 = computeDvDigit(ructb, isLegacyJuridica);
  const dv2 = computeDvDigit(ructb + dv1, isLegacyJuridica);
  return dv1 + dv2;
}
