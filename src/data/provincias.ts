/**
 * Catálogo de provincias y comarcas de Panamá según codificación de la DGI.
 *
 * Referencia: Ficha Técnica de la Factura Electrónica - DGI
 * Última actualización: Comarca Naso Tjër Di (Ley 656 del 4 de diciembre de 2020)
 */

export interface Provincia {
  readonly codigo: string;
  readonly nombre: string;
  readonly tipo: "provincia" | "comarca";
}

export const PROVINCIAS = {
  EN_BLANCO: { codigo: "", nombre: "En Blanco", tipo: "provincia" },
  NO_ASIGNADA: { codigo: "00", nombre: "No Asignada", tipo: "provincia" },
  BOCAS_DEL_TORO: { codigo: "01", nombre: "Bocas del Toro", tipo: "provincia" },
  COCLE: { codigo: "02", nombre: "Coclé", tipo: "provincia" },
  COLON: { codigo: "03", nombre: "Colón", tipo: "provincia" },
  CHIRIQUI: { codigo: "04", nombre: "Chiriquí", tipo: "provincia" },
  DARIEN: { codigo: "05", nombre: "Darién", tipo: "provincia" },
  HERRERA: { codigo: "06", nombre: "Herrera", tipo: "provincia" },
  LOS_SANTOS: { codigo: "07", nombre: "Los Santos", tipo: "provincia" },
  PANAMA: { codigo: "08", nombre: "Panamá", tipo: "provincia" },
  VERAGUAS: { codigo: "09", nombre: "Veraguas", tipo: "provincia" },
  GUNA_YALA: { codigo: "10", nombre: "Guna Yala, Madugandí y Wargandí", tipo: "comarca" },
  EMBERA_WOUNAAN: { codigo: "11", nombre: "Emberá-Wounaan", tipo: "comarca" },
  NGABE_BUGLE: { codigo: "12", nombre: "Ngäbe-Buglé", tipo: "comarca" },
  PANAMA_OESTE: { codigo: "13", nombre: "Panamá Oeste", tipo: "provincia" },
  NASO_TJER_DI: { codigo: "14", nombre: "Naso Tjër Di", tipo: "comarca" },
} as const satisfies Record<string, Provincia>;

export type ProvinciaKey = keyof typeof PROVINCIAS;

// Lookup table optimizada por código (acceso O(1))
const PROVINCIAS_BY_CODE: ReadonlyMap<string, Provincia> = new Map(
  Object.values(PROVINCIAS).map((p) => [p.codigo, p]),
);

/**
 * Obtiene una provincia por su código.
 * @param codigo Código de 1-2 dígitos (será normalizado a 2)
 * @returns La provincia, o null si no existe
 */
export function getProvinciaByCode(codigo: string): Provincia | null {
  const padded = codigo.padStart(2, "0");
  return PROVINCIAS_BY_CODE.get(padded) ?? null;
}

/**
 * Lista de provincias ordenadas por código (sin EN_BLANCO).
 */
export function listProvincias(): readonly Provincia[] {
  return Object.values(PROVINCIAS).filter((p) => p.codigo !== "");
}

// Soporte para override de provincias (en caso de que DGI agregue nuevas)
let customProvincias: ReadonlyMap<string, Provincia> | null = null;

/**
 * Permite agregar/sobrescribir provincias en runtime.
 * Útil si DGI agrega nuevas provincias y no querés esperar un release.
 */
export function setCustomProvincias(provincias: readonly Provincia[]): void {
  customProvincias = new Map(provincias.map((p) => [p.codigo, p]));
}

/**
 * Resetea las provincias a los valores por defecto.
 */
export function resetProvincias(): void {
  customProvincias = null;
}

/**
 * Obtiene una provincia considerando overrides custom.
 */
export function resolveProvincia(codigo: string): Provincia | null {
  const padded = codigo.padStart(2, "0");
  if (customProvincias) {
    const custom = customProvincias.get(padded);
    if (custom) return custom;
  }
  return PROVINCIAS_BY_CODE.get(padded) ?? null;
}
