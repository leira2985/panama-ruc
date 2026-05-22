/**
 * @workflow507/panama-ruc
 *
 * Motor ultra rápido de cálculo y validación del Dígito Verificador (DV)
 * del RUC en Panamá.
 *
 * @see https://github.com/leira2985/panama-ruc
 * @author Jeziel Leira <jeziel@workflow507.com>
 * @license MIT
 */

// API funcional principal
export { calculateDV } from "./api/calculate-dv.js";
export { parse, safeParse, clearParseCache } from "./api/parse.js";
export { validate, isValid } from "./api/validate.js";
export {
  parseMany,
  calculateDvMany,
  validateMany,
} from "./api/parse-many.js";
export { extractFromText } from "./api/extract.js";
export { generate } from "./api/generate.js";

// API OOP
export { Ruc } from "./api/ruc-class.js";

// Utilidades
export {
  normalize,
  splitRucAndDv,
  isAllDigits,
} from "./core/normalizer.js";
export { detectType, detectTypeDetailed } from "./core/detector.js";

// Errores
export {
  RucError,
  isRucError,
} from "./errors/RucError.js";
export {
  RUC_ERROR_CODES,
  DEFAULT_MESSAGES,
} from "./errors/codes.js";
export type { RucErrorCode } from "./errors/codes.js";

// Datos públicos
export {
  PROVINCIAS,
  listProvincias,
  getProvinciaByCode,
  resolveProvincia,
  setCustomProvincias,
  resetProvincias,
} from "./data/provincias.js";
export type { Provincia, ProvinciaKey } from "./data/provincias.js";

export {
  LETRAS_NATURAL,
  getLetraNatural,
  LETRAS_SIN_PROVINCIA,
  LETRAS_CON_PROVINCIA,
} from "./data/letras.js";
export type { LetraNatural, LetraNaturalKey } from "./data/letras.js";

// Tipos públicos
export type {
  RucData,
  RucType,
  NaturalRucData,
  NaturalNtRucData,
  JuridicaRucData,
  JuridicaNtRucData,
} from "./types/ruc.js";

export type {
  ValidateResult,
  ValidateSuccess,
  ValidateFailure,
  ParseResult,
  ParseSuccess,
  ParseFailure,
  BatchResult,
  ExtractedRuc,
} from "./types/result.js";

export type {
  ParseOptions,
  ValidateOptions,
  BatchOptions,
  ExtractOptions,
  GenerateOptions,
  GlobalConfig,
} from "./types/options.js";
