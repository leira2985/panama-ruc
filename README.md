# @workflow507/panama-ruc

> Motor ultra rápido de cálculo y validación del Dígito Verificador (DV) del RUC en Panamá. Sin dependencias. Funciona en Node, Bun, Deno, Cloudflare Workers y navegadores.

[![npm version](https://img.shields.io/npm/v/@workflow507/panama-ruc.svg)](https://www.npmjs.com/package/@workflow507/panama-ruc)
[![license](https://img.shields.io/npm/l/@workflow507/panama-ruc.svg)](LICENSE)
[![tests](https://img.shields.io/badge/tests-149%20passing-brightgreen)]()

---

## 🇵🇦 Español

### ¿Qué hace?

Calcula y valida el **Dígito Verificador (DV)** del RUC en Panamá según el algoritmo oficial publicado por la DGI.

```typescript
import { calculateDV, validate, parse, Ruc } from '@workflow507/panama-ruc';

calculateDV("8-783-1657");           // → "23"
validate("8-783-1657-23");           // → { valid: true, dv: "23", type: "natural" }
validate("8-783-1657", "99");        // → { valid: false, code: "DV_MISMATCH", expected: "23" }

parse("8-783-1657");
// → {
//     type: "natural",
//     dv: "23",
//     fullId: "8-783-1657-23",
//     provincia: { codigo: "08", nombre: "Panamá" },
//     letra: { letra: "", nombre: "Sin Letra", ... },
//     folio: "783",
//     asiento: "1657"
//   }
```

### ¿Por qué este paquete?

- ⚡ **Ultra rápido**: ~0.6µs por validación
- 🪶 **Liviano**: ~18 KB minificado, ~6 KB gzipeado, sin dependencias
- 🌐 **Universal**: Node, Bun, Deno, Cloudflare Workers, Browser, React Native
- 🎯 **Tipado completo**: TypeScript-first con discriminated unions
- 🛡️ **Robusto**: 149 tests, errores tipados, casos de borde cubiertos
- 🧹 **Acepta inputs sucios**: `"8 783 1657"`, `"8.783.1657"`, `"  8-783-1657  "`
- 🆕 **Actualizado**: Incluye Comarca Naso Tjër Di (Ley 656 de 2020)
- 🔧 **API funcional + OOP**: Usá lo que prefieras

### Instalación

```bash
npm install @workflow507/panama-ruc
# o
pnpm add @workflow507/panama-ruc
# o
bun add @workflow507/panama-ruc
```

### Uso

#### API funcional

```typescript
import {
  calculateDV,
  validate,
  parse,
  parseMany,
  extractFromText,
  generate,
} from '@workflow507/panama-ruc';

// Calcular DV
calculateDV("8-783-1657");                    // "23"

// Validar
validate("8-783-1657", "23");                 // { valid: true, ... }
validate("8-783-1657-23");                    // { valid: true, ... }

// Parsear info completa
const data = parse("8-783-1657");
console.log(data.provincia?.nombre);          // "Panamá"

// Procesar lote (10,000 RUCs en ~60ms)
const result = parseMany(["8-783-1657", "2588017-1-831938", ...]);
console.log(`${result.validCount}/${result.total} válidos`);

// Extraer de texto sucio
const found = extractFromText("Cliente: María, RUC 8-783-1657 DV 23");
// → [{ ruc: "8-783-1657", dv: "23", dvValid: true, position: 17 }]

// Generar RUCs de prueba
const rucs = generate({ type: "natural", count: 10, seed: 42 });
```

#### API orientada a objetos

```typescript
import { Ruc } from '@workflow507/panama-ruc';

const ruc = Ruc.from("8-783-1657");
console.log(ruc.dv);                          // "23"
console.log(ruc.type);                        // "natural"
console.log(ruc.provincia?.nombre);           // "Panamá"
console.log(ruc.toString());                  // "8-783-1657-23"
console.log(ruc.isValid("23"));               // true
```

#### Manejo de errores

```typescript
import { parse, RucError, RUC_ERROR_CODES } from '@workflow507/panama-ruc';

try {
  parse("BASURA");
} catch (e) {
  if (e instanceof RucError) {
    if (e.code === RUC_ERROR_CODES.TYPE_UNDETECTABLE) {
      console.log("No se pudo detectar el tipo");
    }
  }
}

// O sin throw
import { safeParse } from '@workflow507/panama-ruc';
const result = safeParse("BASURA");
if (!result.ok) {
  console.log(result.error.code);
}
```

#### RUCs NT (formato ambiguo)

Los RUC de tipo NT (`provincia-NT-folio-asiento`) pueden ser **natural-nt**
(extranjero residente) o **juridica-nt** (sin fines de lucro). El mismo texto
da DV distinto según el subtipo, así que hay que decir cuál es:

```typescript
import { calculateDV, parse, safeParse } from '@workflow507/panama-ruc';

calculateDV("8-NT-1-13656", { typeHint: "natural-nt" });   // → "02"
calculateDV("8-NT-1-13656", { typeHint: "juridica-nt" });  // → "43"

// Sin typeHint NO adivina: falla fuerte para no devolver un DV incorrecto.
const r = safeParse("8-NT-1-13656");
// → { ok: false, error.code: "AMBIGUOUS_NT_TYPE" }

parse("8-NT-1-24", { typeHint: "natural-nt" });            // ok
```

### CLI

```bash
$ npm install -g @workflow507/panama-ruc

$ panama-ruc dv 8-783-1657
23

$ panama-ruc validate 8-783-1657 23
✓ Válido (tipo: natural)

$ panama-ruc parse 8-783-1657
┌─────────────────────────────────────┐
│ RUC:        8-783-1657              │
│ DV:         23                      │
│ Completo:   8-783-1657-23           │
│ Tipo:       natural                 │
│ Provincia:  Panamá                  │
│ Folio:      783                     │
│ Asiento:    1657                    │
└─────────────────────────────────────┘

$ panama-ruc generate --type juridica --count 5

$ panama-ruc batch rucs.csv
```

### Tipos de RUC soportados

| Tipo | Ejemplo | Soporte |
|------|---------|---------|
| Persona Natural (cédula) | `8-783-1657` | ✅ Completo |
| Natural con letra E (Extranjero) | `E-12-345` | ✅ Completo |
| Natural con letra N (Naturalizado) | `N-12-345` | ✅ Completo |
| Natural con letra PE (Panameño Extranjero) | `PE-12-345` | ✅ Completo |
| Natural con letra AV (Antes Vigencia) | `8AV-123-45` | ✅ Completo |
| Natural con letra PI (Panameño Indígena) | `4PI-123-45` | ✅ Completo |
| Persona Jurídica | `2588017-1-831938` | ✅ Completo |
| Jurídica antigua (legacy) | `12388-184-921` | ✅ Completo |
| Natural NT (extranjero residente) | `8-NT-1-24` | ✅ Completo¹ |
| Jurídica NT (sin fines de lucro) | `8-NT-1-13656` | ✅ Completo¹ |
| Fincas (SB/EE) | Variados | ❌ DGI no publica algoritmo |

> ¹ Los dos tipos NT comparten el formato textual `provincia-NT-folio-asiento` pero
> producen un DV distinto. Como no se pueden distinguir solo por el texto, debés
> indicar el subtipo con `typeHint`. Si no lo hacés, la librería **falla con
> `AMBIGUOUS_NT_TYPE`** en vez de devolver un DV adivinado (ver más abajo).

### Rendimiento

| Operación | Tiempo |
|-----------|--------|
| `calculateDV()` | ~0.6µs |
| `parseMany(10000)` sin cache | ~60ms |
| `parseMany(10000)` con cache | ~12ms |
| Bundle size (min) | 18.5 KB |
| Bundle size (min+gzip) | ~6 KB |

### Compatibilidad

- ✅ Node.js 18+
- ✅ Bun
- ✅ Deno
- ✅ Cloudflare Workers
- ✅ Browser (todos los modernos)
- ✅ React Native
- ✅ ESM y CommonJS

### Configuración avanzada

```typescript
// Override de provincias si DGI agrega nuevas
import { setCustomProvincias } from '@workflow507/panama-ruc';

setCustomProvincias([
  ...defaultProvincias,
  { codigo: "15", nombre: "Nueva Provincia", tipo: "provincia" },
]);
```

### Algoritmo

Esta librería implementa el algoritmo oficial de la **Dirección General de Ingresos (DGI)** de Panamá, publicado en el documento "Cálculo del DV del RUC".

El cálculo es:
1. Se construye un RUCTB (RUC table) de 20 caracteres
2. Se aplica módulo 11 con pesos incrementales desde 2
3. Para RUCs jurídicos antiguos, se aplica un salto de peso en posición 12
4. El DV son 2 dígitos calculados secuencialmente

**Validación de correctitud:** los DV de todos los tipos soportados (natural sin letra, E, PE, N, AV, PI, jurídica, jurídica legacy, natural-nt y juridica-nt) están verificados en los tests contra los casos publicados por implementaciones independientes de referencia ([juancorradine/Panama-RUC-DV-Calculator](https://github.com/juancorradine/Panama-RUC-DV-Calculator) y [apple314159/panama-dv](https://github.com/apple314159/panama-dv)), que a su vez derivan del documento oficial de la DGI. Ver [`tests/fixtures/known-rucs.json`](tests/fixtures/known-rucs.json).

### Casos de uso

- Validación de formularios web/móvil
- Procesamiento de planillas DGI en bulk
- Sistemas de factura electrónica (validación de RUCs de receptores)
- Importación y limpieza de bases de datos contables
- ETL para sistemas financieros y contables
- Apps de contadores y firmas contables

### Contribuir

Issues y PRs son bienvenidos en [GitHub](https://github.com/leira2985/panama-ruc).

---

## 🇬🇧 English

### What it does

Calculates and validates the **Check Digit (DV)** of Panama's Single Taxpayer Registry (RUC), following the official algorithm published by DGI (Dirección General de Ingresos).

```typescript
import { calculateDV, validate, parse } from '@workflow507/panama-ruc';

calculateDV("8-783-1657");           // → "23"
validate("8-783-1657-23");           // → { valid: true, dv: "23", type: "natural" }
```

### Why this package?

- ⚡ **Ultra fast**: ~0.6µs per validation
- 🪶 **Lightweight**: ~18 KB minified, ~6 KB gzipped, zero dependencies
- 🌐 **Universal**: Node, Bun, Deno, Cloudflare Workers, Browser
- 🎯 **Fully typed**: TypeScript-first with discriminated unions
- 🛡️ **Robust**: 149 tests, typed errors, edge cases covered

### Installation

```bash
npm install @workflow507/panama-ruc
```

See Spanish section above for complete API documentation.

---

## Acknowledgments

This library was inspired by previous community implementations such as:
- [panama-ruc-dv-calculator](https://github.com/juancorradine/Panama-RUC-DV-Calculator) (Python) by Juan Corradine
- [panama-dv](https://github.com/apple314159/panama-dv) (Python)

The algorithm itself is publicly documented by [DGI Panama](https://dgi.mef.gob.pa/) in their official specification "Cálculo del DV del RUC".

This is an independent TypeScript implementation written from the public specification, with added features (auto-detection, validation, batch processing, text extraction, generation, CLI, etc.).

## License

MIT © 2026 Jeziel Leira / Workflow507

---

Made with ❤️ in 🇵🇦 by [Workflow507](https://workflow507.com)
