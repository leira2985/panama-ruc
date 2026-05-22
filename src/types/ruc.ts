/**
 * Tipos públicos para representar RUCs.
 */

import type { LetraNatural } from "../data/letras.js";
import type { Provincia } from "../data/provincias.js";

/**
 * Tipos de RUC soportados según DGI Panamá.
 */
export type RucType = "natural" | "natural-nt" | "juridica" | "juridica-nt";

/**
 * Resultado del parseo de un RUC Natural (cédula).
 */
export interface NaturalRucData {
  readonly type: "natural";
  /** RUC original ingresado */
  readonly ruc: string;
  /** RUC normalizado (formato canónico con guiones) */
  readonly normalizedRuc: string;
  /** Dígito Verificador calculado (2 dígitos) */
  readonly dv: string;
  /** Identificador completo: RUC-DV */
  readonly fullId: string;
  /** Provincia (puede ser null para extranjeros, naturalizados, PE) */
  readonly provincia: Provincia | null;
  /** Letra especial si aplica (E, N, PE, AV, PI) */
  readonly letra: LetraNatural | null;
  /** Tomo/Folio de la cédula */
  readonly folio: string;
  /** Asiento/Ficha */
  readonly asiento: string;
}

/**
 * Resultado del parseo de un RUC Natural NT (extranjero residente).
 * Formato: provincia-NT-folio-asiento.
 */
export interface NaturalNtRucData {
  readonly type: "natural-nt";
  readonly ruc: string;
  readonly normalizedRuc: string;
  readonly dv: string;
  readonly fullId: string;
  readonly provincia: Provincia | null;
  readonly folio: string;
  readonly asiento: string;
}

/**
 * Resultado del parseo de un RUC Jurídica.
 */
export interface JuridicaRucData {
  readonly type: "juridica";
  readonly ruc: string;
  readonly normalizedRuc: string;
  readonly dv: string;
  readonly fullId: string;
  /** Rollo/Tomo */
  readonly rolloTomo: string;
  /** Folio/Imagen */
  readonly folio: string;
  /** Asiento/Ficha */
  readonly asiento: string;
  /** Si es un RUC antiguo (legacy) */
  readonly isLegacy: boolean;
}

/**
 * Resultado del parseo de un RUC Jurídica NT (sin fines de lucro, fideicomisos, etc.)
 * Formato: provincia-NT-folio-asiento (mismo formato textual que natural-nt).
 */
export interface JuridicaNtRucData {
  readonly type: "juridica-nt";
  readonly ruc: string;
  readonly normalizedRuc: string;
  readonly dv: string;
  readonly fullId: string;
  readonly provincia: Provincia | null;
  readonly folio: string;
  readonly asiento: string;
}

/**
 * Union de todos los tipos de datos posibles de RUC.
 */
export type RucData = NaturalRucData | NaturalNtRucData | JuridicaRucData | JuridicaNtRucData;
