/**
 * Opciones de configuración para las APIs.
 */

export interface ParseOptions {
  /**
   * Si `true`, no aplica normalización automática del input.
   * @default false
   */
  readonly strict?: boolean;

  /**
   * Hint para forzar el tipo de RUC en caso de ambigüedad.
   */
  readonly typeHint?: "natural" | "natural-nt" | "juridica" | "juridica-nt";
}

export interface ValidateOptions extends ParseOptions {
  /**
   * Si `true`, requiere que el DV venga incluido en el RUC (formato "X-X-X-DV").
   * @default false
   */
  readonly requireDv?: boolean;
}

export interface BatchOptions extends ParseOptions {
  /**
   * Si `true`, continúa procesando incluso si hay errores.
   * @default true
   */
  readonly continueOnError?: boolean;

  /**
   * Usar cache LRU para evitar recálculos en lotes con duplicados.
   * @default true
   */
  readonly useCache?: boolean;
}

export interface ExtractOptions {
  /**
   * Si `true`, retorna todos los matches. Si `false`, solo el primero.
   * @default true
   */
  readonly multiple?: boolean;

  /**
   * Si `true`, valida los DVs encontrados en el texto.
   * @default true
   */
  readonly validateDv?: boolean;
}

export interface GenerateOptions {
  /**
   * Tipo de RUC a generar.
   * @default "natural"
   */
  readonly type?: "natural" | "juridica";

  /**
   * Provincia específica para RUCs naturales.
   */
  readonly provincia?: string;

  /**
   * Cantidad de RUCs a generar.
   * @default 1
   */
  readonly count?: number;

  /**
   * Seed para reproducibilidad en tests.
   */
  readonly seed?: number;
}

export interface GlobalConfig {
  /**
   * Tamaño del cache LRU.
   * @default 1000
   */
  readonly cacheSize?: number;

  /**
   * Función de logging para observability.
   */
  readonly logger?: (level: string, message: string, meta?: unknown) => void;

  /**
   * Modo estricto: no aplica autocorrecciones.
   * @default false
   */
  readonly strictMode?: boolean;
}
