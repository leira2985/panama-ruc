/**
 * Builders del RUCTB (RUC table) según el tipo de RUC.
 *
 * El RUCTB es un string de exactamente 20 caracteres que se usa como
 * input para el cálculo del DV. La forma de construirlo varía según
 * el tipo de RUC y la presencia de letras especiales.
 *
 * Esta organización por archivos permite tener cada caso aislado,
 * facilmente testeable y mantenible.
 *
 * Referencia: "Cálculo del DV del RUC" - DGI
 */

export { buildNaturalRuctb } from "./natural.js";
export { buildNaturalLetrasRuctb } from "./natural-letras.js";
export { buildExtranjeroRuctb } from "./extranjero.js";
export { buildJuridicaRuctb } from "./juridica.js";
