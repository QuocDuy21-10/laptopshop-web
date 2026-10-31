import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import importOrderByLength from "./eslint-rules/import-order-by-length.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: { local: { rules: { "import-order-by-length": importOrderByLength } } },
    rules: {
      // warn so legacy files do not block `pnpm lint`; run `eslint --fix` on files you touch
      "local/import-order-by-length": "warn",
      "no-duplicate-imports": "warn",
      "@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "src/lib/api/schema.d.ts",
    ".superpowers/**",
    "docs-local/**",
  ]),
]);
