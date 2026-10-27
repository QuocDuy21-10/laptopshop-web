import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// QA session 2026-10-26: same projects as the repo config, plus failure screenshots and JSON output. Local only.
const EVIDENCE = "/Users/dinhduy/Workspace/nodejs/laptopshop-api/docs-local/test/reports/evidence/admin-portal-2026-10-26";
export default defineConfig({
  ...base,
  outputDir: `${EVIDENCE}/playwright-artifacts`,
  reporter: [["list"], ["json", { outputFile: `${EVIDENCE}/playwright-${process.env.QA_TAG ?? "run"}.json` }]],
  use: { ...base.use, screenshot: "only-on-failure", trace: "retain-on-failure" },
});
