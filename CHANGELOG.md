# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [0.4.0] - 2026-05-25

Ajuste de diseño tras validar el comportamiento real de la DGI (cada tipo de
contribuyente produce un DV distinto del mismo número, y el tipo se decide por
el **formato** del RUC, no se adivina al azar).

### Cambiado (incompatible)

- 🔤 **Formato de `fullId` / `toString()`**: ahora es `8-783-1657 DV23` (RUC,
  espacio, sigla `DV` + dígitos), como lo escribe la DGI. Antes era el guion
  pegado `8-783-1657-23`, que no es un formato oficial.
- 🧭 **RUC corto (1-2 díg ≤ 14) ya NO lanza error**: se interpreta como
  **persona natural** (la provincia de la cédula), que es lo correcto en la
  práctica. Se eliminó el error `AMBIGUOUS_NATURAL_JURIDICA` introducido en
  0.3.0. Para el caso raro de una empresa antigua con ese formato (delatada por
  su nombre, ej. "S.A."), se fuerza con `{ typeHint: "juridica" }` y recalcula.

### Notas

- El resultado siempre incluye `type` (detectado por formato). Pensado para
  alimentar un selector de tipo en la UI: mostrar el tipo elegido y permitir
  cambiarlo + recalcular en vivo.
- `validate` / `extractFromText` ya no requieren lógica especial de
  desambiguación (el RUC corto resuelve a natural directo).

## [0.3.0] - 2026-05-24

Versión validada **contra el consultador oficial de la DGI** (etax2 ConsultarDV).
Se auditó el motor con ~64 RUC jurídicos reales (Grandes Contribuyentes) y 13
fincas reales, además de casos natural/NT confirmados, alcanzando **100% de
coincidencia** con el DV oficial.

### Agregado

- 🏠 **Soporte completo para Finca (inmueble)** — 5º tipo de contribuyente.
  Formato de dos partes `provincia-finca` (ej. `8-30213562`). El número de finca
  se rellena a 8 dígitos **a la derecha** (hallazgo validado con 13 fincas reales
  de la DGI, 13/13). Nuevo tipo `FincaRucData` y `type: "finca"`.
- 🛡️ Nuevo error tipado **`AMBIGUOUS_NATURAL_JURIDICA`**: un RUC de formato corto
  (primer grupo de 1-2 dígitos ≤ 14) puede ser persona **natural** o **jurídica
  antigua**, con DV distinto. Sin `typeHint`, `calculateDV`/`parse` fallan de
  forma explícita en vez de adivinar.
- ✨ `typeHint` agregado a `validate`, `isValid` y `Ruc.from`/`Ruc.tryFrom`.

### Corregido

- 🐛 **Jurídicas antiguas con tomo corto** (ej. `82-30-15216` NESTLE, `39-35-5021`
  CITIBANK) eran rechazadas como "provincia no reconocida". Ahora, si el primer
  grupo es > 14 (no puede ser provincia), se clasifican correctamente como
  jurídica-legacy.
- 🐛 RUC corto que el detector mandaba siempre a "natural" podía devolver un DV
  equivocado para empresas antiguas. Ahora se desambigua (ver arriba).

### Cambios incompatibles (breaking)

- ⚠️ `calculateDV` / `parse` ahora **lanzan `AMBIGUOUS_NATURAL_JURIDICA`** para
  RUC cortos (≤14) sin `typeHint`, donde antes devolvían un DV asumido como
  natural. Migración: pasá `{ typeHint: "natural" }` o `{ typeHint: "juridica" }`.
  `validate`/`extractFromText` no cambian su firma de uso (desambiguan con el DV).

## [0.2.1] - 2026-05-22

### Mantenimiento

- 🔧 `bin.panama-ruc` normalizado (`dist/cli/index.js`) según `npm pkg fix`.
- ⬆️ Workflows de CI/Release actualizados a `actions/checkout@v5` y
  `actions/setup-node@v5` (compatibles con Node.js 24).

## [0.2.0] - 2026-05-22

### Agregado

- ✅ Soporte completo y verificado para **Natural NT** (extranjero residente) y
  **Jurídica NT** (sin fines de lucro), formato `provincia-NT-folio-asiento`.
- ✨ Opción `typeHint` en `parse`, `safeParse` y `calculateDV` para desambiguar
  el subtipo NT (ambos comparten el mismo formato textual con DV distinto).
- 🛡️ Nuevo error tipado `AMBIGUOUS_NT_TYPE`: ante un NT sin `typeHint`, la
  librería **falla de forma explícita** en vez de devolver un DV adivinado.

### Corregido

- 🐛 Las **jurídicas antiguas (legacy)** con rollo/tomo de 4-5 dígitos
  (ej. `12388-184-921`) ya no devuelven `TYPE_UNDETECTABLE`; el detector ya no
  exige un mínimo de 7 dígitos en la primera parte.
- 🐛 Eliminada la heurística "prefijo 155-159 = NT" que clasificaba mal como NT
  a jurídicas normales válidas (ej. `155720753-2-2022`, `15565624-2-2017`).
- 🐛 `splitRucAndDv` confundía el último segmento de un RUC NT con un DV
  embebido; ahora respeta el formato de 4 partes de los NT.

### Validación

- 📚 DV de **todos** los tipos soportados verificados contra casos publicados por
  implementaciones independientes de referencia. Tests: 149 (antes 61).

## [0.1.0] - 2026-05-21

### Agregado

- 🚀 Lanzamiento inicial del paquete `@workflow507/panama-ruc`
- ✨ API funcional: `calculateDV`, `validate`, `isValid`, `parse`, `safeParse`
- ✨ API en lote: `parseMany`, `calculateDvMany`, `validateMany`
- ✨ API OOP: clase `Ruc`
- ✨ Extracción de texto sucio: `extractFromText`
- ✨ Generador de RUCs de prueba: `generate` (con seed para reproducibilidad)
- 🧮 Motor de cálculo módulo 11 optimizado (~0.6µs por validación)
- 🗂️ Soporte para tipos de RUC:
  - Persona Natural (cédula)
  - Natural con letras E, N, PE (extranjería)
  - Natural con letras AV, PI (al medio)
  - Persona Jurídica (sociedades)
  - Jurídica antigua (legacy con cross-reference)
- 🌎 Catálogo de provincias actualizado incluyendo **Comarca Naso Tjër Di**
- 🛡️ Errores tipados con códigos machine-readable (`RucError` + `RUC_ERROR_CODES`)
- 🧹 Normalización automática de inputs sucios (espacios, puntos, slashes)
- 💾 Cache LRU configurable para optimizar lotes con duplicados
- 🖥️ CLI con comandos: `dv`, `validate`, `parse`, `extract`, `generate`, `batch`
- 📚 Tests: 61 casos cubriendo unit + integración + performance
- 📖 README bilingüe (español + inglés)

### Notas técnicas

- Bundle: ~18.5 KB minified, ~6 KB gzipped
- Cero dependencias en producción
- ESM + CommonJS dual output
- TypeScript 5.7+
- Node 18+, Bun, Deno, Cloudflare Workers, Browser

## [Próximamente]

### v0.3

- Web Worker support para batches gigantes
- API REST opcional (`@workflow507/panama-ruc-server`)
- Investigar algoritmo de Fincas (SB/EE) si DGI lo publica
