/**
 * Ejemplo básico de uso en Node.js
 *
 * Ejecutar con: npx tsx examples/node.ts
 */

import {
  calculateDV,
  parse,
  parseMany,
  Ruc,
  validate,
} from "@workflow507/panama-ruc";

// 1. Cálculo simple
console.log("=== Cálculo simple ===");
console.log(`DV de 8-783-1657: ${calculateDV("8-783-1657")}`);

// 2. Validación
console.log("\n=== Validación ===");
const v = validate("8-783-1657-23");
console.log(v);

// 3. Parseo completo
console.log("\n=== Parseo completo ===");
const data = parse("8-783-1657");
console.log(`Tipo: ${data.type}`);
if (data.type === "natural") {
  console.log(`Provincia: ${data.provincia?.nombre}`);
}

// 4. Procesamiento en lote
console.log("\n=== Lote ===");
const result = parseMany([
  "8-783-1657",
  "2588017-1-831938",
  "BASURA",
]);
console.log(`${result.validCount}/${result.total} válidos en ${result.elapsedMs.toFixed(2)}ms`);

// 5. API OOP
console.log("\n=== Clase Ruc ===");
const ruc = Ruc.from("8-783-1657");
console.log(`${ruc.toString()} (${ruc.provincia?.nombre})`);
