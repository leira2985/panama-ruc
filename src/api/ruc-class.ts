/**
 * API OOP: clase Ruc.
 *
 * Para quien prefiere trabajar con objetos en lugar de funciones puras.
 * Internamente usa las mismas funciones que la API funcional.
 */

import type { LetraNatural } from "../data/letras.js";
import type { Provincia } from "../data/provincias.js";
import type { RucData, RucType } from "../types/ruc.js";
import { parse, safeParse } from "./parse.js";

/**
 * Representación orientada a objetos de un RUC.
 *
 * @example
 * const ruc = Ruc.from("8-783-1657");
 * console.log(ruc.dv);          // "23"
 * console.log(ruc.type);        // "natural"
 * console.log(ruc.toString());  // "8-783-1657-23"
 * console.log(ruc.isValid("23")); // true
 */
export class Ruc {
  private readonly data: RucData;

  private constructor(data: RucData) {
    this.data = data;
  }

  /**
   * Crea un Ruc desde un string. Lanza error si es inválido.
   */
  static from(input: string): Ruc {
    return new Ruc(parse(input));
  }

  /**
   * Crea un Ruc sin lanzar errores. Retorna null si es inválido.
   */
  static tryFrom(input: string): Ruc | null {
    const result = safeParse(input);
    return result.ok ? new Ruc(result.value) : null;
  }

  /**
   * Tipo del RUC.
   */
  get type(): RucType {
    return this.data.type;
  }

  /**
   * RUC original ingresado.
   */
  get raw(): string {
    return this.data.ruc;
  }

  /**
   * RUC en formato normalizado con guiones.
   */
  get normalized(): string {
    return this.data.normalizedRuc;
  }

  /**
   * Dígito Verificador (2 dígitos).
   */
  get dv(): string {
    return this.data.dv;
  }

  /**
   * RUC completo con DV: "RUC-DV"
   */
  get fullId(): string {
    return this.data.fullId;
  }

  /**
   * Provincia (solo para naturales sin letra E/N/PE).
   */
  get provincia(): Provincia | null {
    if (this.data.type === "natural") return this.data.provincia;
    return null;
  }

  /**
   * Letra especial si aplica (E, N, PE, AV, PI).
   */
  get letra(): LetraNatural | null {
    if (this.data.type === "natural") return this.data.letra;
    return null;
  }

  /**
   * Si es un RUC jurídico legacy (antiguo).
   */
  get isLegacy(): boolean {
    if (this.data.type === "juridica") return this.data.isLegacy;
    return false;
  }

  /**
   * Verifica si el DV provisto coincide.
   */
  isValid(expectedDv?: string): boolean {
    if (expectedDv === undefined) return true;
    return this.data.dv === expectedDv.padStart(2, "0");
  }

  /**
   * Retorna el RUC con DV como string.
   */
  toString(): string {
    return this.fullId;
  }

  /**
   * Serialización a JSON.
   */
  toJSON(): RucData {
    return this.data;
  }
}
