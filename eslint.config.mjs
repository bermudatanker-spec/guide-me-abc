// eslint.config.mjs (Flat config, ESLint v9)
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginImport from "eslint-plugin-import";

export default defineConfig([
  // Next.js + TypeScript basis
  nextVitals,
  nextTs,

  // Onze eigen laag erbovenop
  {
    plugins: {
      import: pluginImport,
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
        node: {
          paths: ["."],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    rules: {
      // Tijdens migratie kun je deze eventueel nog even uitlaten:
      // "import/no-unresolved": "off",
    },
  },

  // ✅ ignores moet een array zijn
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
]);