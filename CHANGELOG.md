# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

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
