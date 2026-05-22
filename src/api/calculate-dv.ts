/**
 * API: calculateDV
 *
 * Calcula el Dígito Verificador de un RUC. Es la función más rápida y simple.
 */

import type { ParseOptions } from "../types/options.js";
import { parse } from "./parse.js";

/**
 * Calcula el Dígito Verificador (DV) de un RUC.
 *
 * @param input El RUC (con o sin DV, en cualquier formato común)
 * @param options Opciones; usar `typeHint` para desambiguar RUCs NT
 * @returns El DV de 2 dígitos como string ("00"-"99")
 * @throws {RucError} Si el RUC no es válido o si es un NT ambiguo sin tipo explícito
 *
 * @example
 * calculateDV("8-783-1657")                              // → "23"
 * calculateDV("8 783 1657")                              // → "23"
 * calculateDV("8-NT-1-24", { typeHint: "natural-nt" })   // → "33"
 */
export function calculateDV(input: string, options?: ParseOptions): string {
  return parse(input, options).dv;
}
