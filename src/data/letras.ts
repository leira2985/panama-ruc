/**
 * Catálogo de letras especiales para RUCs de Persona Natural según DGI.
 *
 * Cada letra tiene un código y un código de validación que se usan en el
 * cálculo del DV según el algoritmo oficial.
 *
 * Referencia: "Cálculo del DV del RUC" - DGI (2018-05)
 */

export interface LetraNatural {
  readonly letra: string;
  readonly codigo: string;
  readonly codigoValidacion: string;
  readonly nombre: string;
  readonly descripcion: string;
}

export const LETRAS_NATURAL = {
  SIN_LETRA: {
    letra: "",
    codigo: "00",
    codigoValidacion: "00",
    nombre: "Sin Letra",
    descripcion: "Panameño nacido en territorio panameño",
  },
  EXTRANJERO: {
    letra: "E",
    codigo: "5",
    codigoValidacion: "66",
    nombre: "Extranjero",
    descripcion: "Residente extranjero",
  },
  PANAMENO_EXTRANJERO: {
    letra: "PE",
    codigo: "75",
    codigoValidacion: "82",
    nombre: "Panameño Extranjero",
    descripcion: "Panameño nacido en el extranjero",
  },
  NATURALIZADO: {
    letra: "N",
    codigo: "4",
    codigoValidacion: "92",
    nombre: "Naturalizado",
    descripcion: "Extranjero naturalizado como panameño",
  },
  ANTES_VIGENCIA: {
    letra: "AV",
    codigo: "15",
    codigoValidacion: "9595",
    nombre: "Antes de la Vigencia",
    descripcion: "Persona nacida antes de la vigencia de la cédula",
  },
  PANAMENO_INDIGENA: {
    letra: "PI",
    codigo: "79",
    codigoValidacion: "9595",
    nombre: "Panameño Indígena",
    descripcion: "Panameño de etnia indígena",
  },
} as const satisfies Record<string, LetraNatural>;

export type LetraNaturalKey = keyof typeof LETRAS_NATURAL;

// Lookup table por letra (case-insensitive en el acceso)
const LETRAS_BY_CODE: ReadonlyMap<string, LetraNatural> = new Map(
  Object.values(LETRAS_NATURAL).map((l) => [l.letra, l]),
);

/**
 * Letras que indican un RUC sin provincia (extranjero, naturalizado, etc.)
 */
export const LETRAS_SIN_PROVINCIA: ReadonlySet<string> = new Set(["E", "PE", "N"]);

/**
 * Letras que vienen DESPUÉS del código de provincia (AV, PI)
 */
export const LETRAS_CON_PROVINCIA: ReadonlySet<string> = new Set(["AV", "PI"]);

/**
 * Obtiene una letra por su código.
 * @param letra Código de letra (case-insensitive)
 * @returns La letra, o null si no existe
 */
export function getLetraNatural(letra: string): LetraNatural | null {
  return LETRAS_BY_CODE.get(letra.toUpperCase()) ?? null;
}
