import { DEFAULT_MESSAGES, type RucErrorCode } from "./codes.js";

/**
 * Error tipado para operaciones con RUCs.
 *
 * Incluye un código de error machine-readable que permite
 * tomar decisiones programáticas sin parsear el mensaje.
 *
 * @example
 * try {
 *   parse("invalido");
 * } catch (e) {
 *   if (e instanceof RucError && e.code === "INVALID_FORMAT") {
 *     // manejar específicamente
 *   }
 * }
 */
export class RucError extends Error {
  public readonly code: RucErrorCode;
  public readonly field?: string;
  public readonly expected?: string;
  public readonly received?: string;
  public readonly input?: string;

  constructor(
    code: RucErrorCode,
    options: {
      message?: string;
      field?: string;
      expected?: string;
      received?: string;
      input?: string;
    } = {},
  ) {
    const message = options.message ?? DEFAULT_MESSAGES[code];
    super(message);
    this.name = "RucError";
    this.code = code;
    if (options.field !== undefined) this.field = options.field;
    if (options.expected !== undefined) this.expected = options.expected;
    if (options.received !== undefined) this.received = options.received;
    if (options.input !== undefined) this.input = options.input;

    // Asegurar prototype chain en transpilación a ES5/CommonJS
    Object.setPrototypeOf(this, RucError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      ...(this.field && { field: this.field }),
      ...(this.expected && { expected: this.expected }),
      ...(this.received && { received: this.received }),
      ...(this.input && { input: this.input }),
    };
  }
}

/**
 * Type guard para verificar si un error es un RucError.
 */
export function isRucError(error: unknown): error is RucError {
  return error instanceof RucError;
}
