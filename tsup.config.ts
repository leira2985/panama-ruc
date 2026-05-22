import { defineConfig } from "tsup";

export default defineConfig([
  // Main library
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    target: "es2022",
    platform: "neutral",
    outDir: "dist",
  },
  // CLI
  {
    entry: ["src/cli/index.ts"],
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: false,
    target: "node18",
    platform: "node",
    outDir: "dist/cli",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
