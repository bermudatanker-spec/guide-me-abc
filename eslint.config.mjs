// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginImport from "eslint-plugin-import";

export default defineConfig([
  nextVitals,
  nextTs,
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
      // 🔇 Onze “openingstijden / useParams” situatie is veilig
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",

      // 🔇 Geen gezeur over ' en <a> voor nu
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",

      // 🔇 TypeScript mag lekker los gaan met any & lege interfaces
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // 🔇 Unused variabelen negeren
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // 🔇 Console & anonieme default exports boeien nu even niet
      "no-console": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
]);