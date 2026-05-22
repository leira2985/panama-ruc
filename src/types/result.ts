/**
 * Tipos de resultados para operaciones que pueden fallar.
 */

import type { RucErrorCode } from "../errors/codes.js";
import type { RucData, RucType } from "./ruc.js";

/**
 * Resultado de validación exitosa.
 */
export interface ValidateSuccess {
  readonly valid: true;
  readonly dv: string;
  readonly type: RucType;
}

/**
 * Resultado de validación fallida.
 */
export interface ValidateFailure {
  readonly valid: false;
  readonly code: RucErrorCode;
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
  readonly field?: string;
}

/**
 * Resultado de validación (exitosa o fallida).
 */
export type ValidateResult = ValidateSuccess | ValidateFailure;

/**
 * Resultado de parseo exitoso de un solo RUC.
 */
export interface ParseSuccess<T extends RucData = RucData> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Resultado de parseo fallido.
 */
export interface ParseFailure {
  readonly ok: false;
  readonly code: RucErrorCode;
  readonly message: string;
  readonly input: string;
  readonly field?: string;
}

/**
 * Resultado de parse seguro (sin throw).
 */
export type ParseResult<T extends RucData = RucData> = ParseSuccess<T> | ParseFailure;

/**
 * Resultado de parseo en lote.
 */
export interface BatchResult {
  readonly total: number;
  readonly validCount: number;
  readonly invalidCount: number;
  readonly results: readonly ParseResult[];
  /** Tiempo total de procesamiento en milisegundos */
  readonly elapsedMs: number;
}

/**
 * Resultado de extracción de texto.
 */
export interface ExtractedRuc {
  readonly ruc: string;
  readonly normalizedRuc: string;
  readonly dv: string | null;
  /** Posición en el texto original donde se encontró */
  readonly position: number;
  /** Largo del match en el texto */
  readonly length: number;
  /** Tipo detectado */
  readonly type: RucType;
  /** Si el DV ya venía incluido en el texto y coincide */
  readonly dvValid: boolean | null;
}
