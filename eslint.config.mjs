// eslint.config.mjs (Flat config, ESLint v9)
import { defineConfig, globalIgnores } from "eslint/config";
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

    // Zorg dat eslint-plugin-import de TS-aliassen begrijpt
    settings: {
      "import/resolver": {
        // Leest paden/paths uit jouw tsconfig.json
        typescript: {
          project: "./tsconfig.json",
        },
        // (optioneel) Node-resolver voor gewone imports
        node: {
          paths: ["."],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },

    // Eventuele extra regels: pas aan naar smaak
    rules: {
      // Als je tijdens migratie even geen ruis wil:
      // "import/no-unresolved": "off",
    },
  },

  // Houd de default ignores van eslint-config-next aan,
  // maar toon ze expliciet zodat je ze makkelijk kunt aanpassen
  {
    ignores: globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]),
  },
]);