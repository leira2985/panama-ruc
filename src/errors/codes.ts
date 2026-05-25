/**
 * Códigos de error usados en toda la librería.
 * Pensados para ser identificables programáticamente
 * (no parsear mensajes de error en string).
 */

export const RUC_ERROR_CODES = {
  // Errores de input
  EMPTY_INPUT: "EMPTY_INPUT",
  INVALID_FORMAT: "INVALID_FORMAT",
  TYPE_UNDETECTABLE: "TYPE_UNDETECTABLE",
  AMBIGUOUS_NT_TYPE: "AMBIGUOUS_NT_TYPE",
  AMBIGUOUS_NATURAL_JURIDICA: "AMBIGUOUS_NATURAL_JURIDICA",

  // Errores de provincia
  UNKNOWN_PROVINCE: "UNKNOWN_PROVINCE",
  INVALID_PROVINCE_CODE: "INVALID_PROVINCE_CODE",

  // Errores de letra
  UNKNOWN_LETTER: "UNKNOWN_LETTER",
  INVALID_LETTER_FORMAT: "INVALID_LETTER_FORMAT",

  // Errores de campos numéricos
  FOLIO_NOT_NUMERIC: "FOLIO_NOT_NUMERIC",
  FOLIO_TOO_LONG: "FOLIO_TOO_LONG",
  FOLIO_EMPTY: "FOLIO_EMPTY",

  ASIENTO_NOT_NUMERIC: "ASIENTO_NOT_NUMERIC",
  ASIENTO_TOO_LONG: "ASIENTO_TOO_LONG",
  ASIENTO_EMPTY: "ASIENTO_EMPTY",

  ROLLO_NOT_NUMERIC: "ROLLO_NOT_NUMERIC",
  ROLLO_TOO_LONG: "ROLLO_TOO_LONG",

  // Errores de validación
  DV_MISMATCH: "DV_MISMATCH",
  DV_INVALID_LENGTH: "DV_INVALID_LENGTH",
  DV_NOT_NUMERIC: "DV_NOT_NUMERIC",
  DV_MISSING: "DV_MISSING",

  // Errores de configuración
  INVALID_CONFIGURATION: "INVALID_CONFIGURATION",
} as const;

export type RucErrorCode = (typeof RUC_ERROR_CODES)[keyof typeof RUC_ERROR_CODES];

/**
 * Mensajes por defecto en español (puede ser overrided).
 */
export const DEFAULT_MESSAGES: Readonly<Record<RucErrorCode, string>> = {
  EMPTY_INPUT: "El RUC no puede estar vacío",
  INVALID_FORMAT: "Formato de RUC inválido",
  TYPE_UNDETECTABLE: "No se pudo determinar el tipo de RUC",
  AMBIGUOUS_NT_TYPE:
    "El formato NT no permite distinguir entre natural-nt y juridica-nt. Especifique el tipo explícitamente con la opción { type }",
  AMBIGUOUS_NATURAL_JURIDICA:
    "El formato corto (provincia/tomo de 1-2 dígitos ≤ 14) no permite distinguir entre persona natural y jurídica antigua: producen DV distinto. Especifique el tipo con la opción typeHint ('natural' o 'juridica')",

  UNKNOWN_PROVINCE: "Código de provincia no reconocido",
  INVALID_PROVINCE_CODE: "Código de provincia con formato inválido",

  UNKNOWN_LETTER: "Letra de RUC no reconocida",
  INVALID_LETTER_FORMAT: "Formato de letra inválido",

  FOLIO_NOT_NUMERIC: "El folio debe contener solo dígitos",
  FOLIO_TOO_LONG: "El folio excede el largo máximo permitido",
  FOLIO_EMPTY: "El folio no puede estar vacío",

  ASIENTO_NOT_NUMERIC: "El asiento debe contener solo dígitos",
  ASIENTO_TOO_LONG: "El asiento excede el largo máximo permitido",
  ASIENTO_EMPTY: "El asiento no puede estar vacío",

  ROLLO_NOT_NUMERIC: "El rollo/tomo debe contener solo dígitos",
  ROLLO_TOO_LONG: "El rollo/tomo excede el largo máximo permitido",

  DV_MISMATCH: "El dígito verificador no coincide",
  DV_INVALID_LENGTH: "El DV debe tener exactamente 2 dígitos",
  DV_NOT_NUMERIC: "El DV debe contener solo dígitos",
  DV_MISSING: "Falta el dígito verificador",

  INVALID_CONFIGURATION: "Configuración inválida",
};
