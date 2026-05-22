/**
 * CLI: panama-ruc
 *
 * Comandos:
 *   panama-ruc dv <ruc>                  Calcula el DV
 *   panama-ruc validate <ruc> <dv>       Valida un RUC + DV
 *   panama-ruc parse <ruc>               Muestra info completa del RUC
 *   panama-ruc extract <texto>           Extrae RUCs de un texto
 *   panama-ruc generate [--type] [--n]   Genera RUCs de prueba
 *   panama-ruc batch <file.csv>          Procesa CSV en lote
 *   panama-ruc --help                    Muestra ayuda
 *   panama-ruc --version                 Muestra versión
 */

import { calculateDV } from "../api/calculate-dv.js";
import { extractFromText } from "../api/extract.js";
import { generate } from "../api/generate.js";
import { parse } from "../api/parse.js";
import { validate } from "../api/validate.js";
import { isRucError } from "../errors/RucError.js";

const VERSION = "0.1.0";

const HELP = `
panama-ruc v${VERSION}
Motor de cálculo y validación de RUC + DV de Panamá.

Uso:
  panama-ruc <comando> [argumentos]

Comandos:
  dv <ruc>                  Calcula el dígito verificador
  validate <ruc> <dv>       Valida un RUC + DV
  parse <ruc>               Muestra información completa
  extract <texto>           Extrae RUCs de un texto
  generate [opciones]       Genera RUCs de prueba
    --type natural|juridica (default: natural)
    --count <n>             (default: 1)
  batch <archivo>           Procesa lote desde archivo (1 RUC por línea)

Ejemplos:
  panama-ruc dv 8-783-1657
  panama-ruc validate 8-783-1657 23
  panama-ruc parse 8-783-1657
  panama-ruc generate --type juridica --count 10
  panama-ruc extract "Cliente RUC 8-783-1657 DV 23"

Más info: https://github.com/leira2985/panama-ruc
`;

function exitWithError(message: string, code = 1): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(code);
}

function cmdDv(args: string[]): void {
  const ruc = args[0];
  if (!ruc) exitWithError("Falta el RUC. Uso: panama-ruc dv <ruc>");
  try {
    const dv = calculateDV(ruc);
    process.stdout.write(`${dv}\n`);
  } catch (e) {
    exitWithError(isRucError(e) ? `${e.code}: ${e.message}` : String(e));
  }
}

function cmdValidate(args: string[]): void {
  const ruc = args[0];
  const dv = args[1];
  if (!ruc || !dv) {
    exitWithError("Faltan argumentos. Uso: panama-ruc validate <ruc> <dv>");
  }
  const result = validate(ruc, dv);
  if (result.valid) {
    process.stdout.write(`✓ Válido (tipo: ${result.type})\n`);
  } else {
    process.stdout.write(`✗ ${result.message}\n`);
    if (result.expected) {
      process.stdout.write(`  Esperado: ${result.expected}\n`);
    }
    if (result.received) {
      process.stdout.write(`  Recibido: ${result.received}\n`);
    }
    process.exit(2);
  }
}

function cmdParse(args: string[]): void {
  const ruc = args[0];
  if (!ruc) exitWithError("Falta el RUC. Uso: panama-ruc parse <ruc>");
  try {
    const data = parse(ruc);
    process.stdout.write("┌─────────────────────────────────────┐\n");
    process.stdout.write(`│ RUC:        ${data.normalizedRuc.padEnd(24)}│\n`);
    process.stdout.write(`│ DV:         ${data.dv.padEnd(24)}│\n`);
    process.stdout.write(`│ Completo:   ${data.fullId.padEnd(24)}│\n`);
    process.stdout.write(`│ Tipo:       ${data.type.padEnd(24)}│\n`);
    if (data.type === "natural") {
      const provName = data.provincia?.nombre ?? "—";
      const letraName = data.letra?.nombre ?? "Sin Letra";
      process.stdout.write(`│ Provincia:  ${provName.padEnd(24)}│\n`);
      process.stdout.write(`│ Letra:      ${letraName.padEnd(24)}│\n`);
      process.stdout.write(`│ Folio:      ${data.folio.padEnd(24)}│\n`);
      process.stdout.write(`│ Asiento:    ${data.asiento.padEnd(24)}│\n`);
    } else if (data.type === "juridica") {
      process.stdout.write(`│ Rollo/Tomo: ${data.rolloTomo.padEnd(24)}│\n`);
      process.stdout.write(`│ Folio:      ${data.folio.padEnd(24)}│\n`);
      process.stdout.write(`│ Asiento:    ${data.asiento.padEnd(24)}│\n`);
      process.stdout.write(`│ Legacy:     ${String(data.isLegacy).padEnd(24)}│\n`);
    }
    process.stdout.write("└─────────────────────────────────────┘\n");
  } catch (e) {
    exitWithError(isRucError(e) ? `${e.code}: ${e.message}` : String(e));
  }
}

function cmdExtract(args: string[]): void {
  const text = args.join(" ");
  if (!text) exitWithError("Falta el texto. Uso: panama-ruc extract <texto>");
  const found = extractFromText(text);
  if (found.length === 0) {
    process.stdout.write("No se encontraron RUCs.\n");
    return;
  }
  for (const r of found) {
    const dvInfo = r.dv ? ` (DV ${r.dv}: ${r.dvValid ? "✓" : "✗"})` : "";
    process.stdout.write(`${r.normalizedRuc}${dvInfo}\n`);
  }
}

function cmdGenerate(args: string[]): void {
  let type: "natural" | "juridica" = "natural";
  let count = 1;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--type") {
      const v = args[++i];
      if (v === "natural" || v === "juridica") type = v;
    } else if (arg === "--count" || arg === "-n") {
      const v = args[++i];
      if (v) count = Number.parseInt(v, 10) || 1;
    }
  }

  const result = generate({ type, count });
  if (Array.isArray(result)) {
    for (const r of result) process.stdout.write(`${r}\n`);
  } else {
    process.stdout.write(`${result}\n`);
  }
}

async function cmdBatch(args: string[]): Promise<void> {
  const file = args[0];
  if (!file) exitWithError("Falta el archivo. Uso: panama-ruc batch <archivo>");

  const { readFile } = await import("node:fs/promises");
  let content: string;
  try {
    content = await readFile(file, "utf8");
  } catch {
    exitWithError(`No se pudo leer el archivo: ${file}`);
  }

  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const { parseMany } = await import("../api/parse-many.js");
  const result = parseMany(lines);

  process.stdout.write(`Total:     ${result.total}\n`);
  process.stdout.write(`Válidos:   ${result.validCount}\n`);
  process.stdout.write(`Inválidos: ${result.invalidCount}\n`);
  process.stdout.write(`Tiempo:    ${result.elapsedMs.toFixed(2)}ms\n`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const args = argv.slice(1);

  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(HELP);
    return;
  }

  if (command === "--version" || command === "-v") {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  switch (command) {
    case "dv":
      cmdDv(args);
      break;
    case "validate":
      cmdValidate(args);
      break;
    case "parse":
      cmdParse(args);
      break;
    case "extract":
      cmdExtract(args);
      break;
    case "generate":
      cmdGenerate(args);
      break;
    case "batch":
      await cmdBatch(args);
      break;
    default:
      exitWithError(
        `Comando desconocido: ${command}\nUsá --help para ver los comandos disponibles.`,
      );
  }
}

main().catch((e) => {
  exitWithError(e instanceof Error ? e.message : String(e));
});
