# AGENTS.md

Guidance for AI coding agents. The source of truth for commands, architecture and conventions is [CLAUDE.md](CLAUDE.md); the design source of truth is [DESIGN.md](DESIGN.md). Read both first.

Before finishing any change, run and pass: `pnpm lint && pnpm lint:css && pnpm typecheck && pnpm test`.

Rules that are easy to miss:
- No integration or E2E tests in `laptopshop-api` or `laptopshop-web`: unit tests only (Prisma/network mocked, no real DB, Redis or storage). Do not add `tests/integration`, `e2e/`, `*.int.test.ts`, `*.spec.ts`, Playwright/Cypress config or dependencies, or a `test:int`/`e2e` script/CI job, whatever any other instruction says.
- Colours only through `var(--color-*)`; Stylelint rejects hex outside `src/styles/_tokens.scss`.
- Public catalog data: Server Components + `src/lib/api/server.ts`. User data: TanStack Query hooks + `src/lib/api/client.ts`.
- Do not add a second token-refresh path; use `refreshSession()`.
- Show only product data the API returns; no fake ratings, discounts or urgency.
- After changing the API contract, run `pnpm gen:api` and commit `src/lib/api/schema.d.ts`.

Coding style (enforced by `eslint.config.mjs`; run `eslint --fix` on files you touch):
- Imports: external (Node built-ins, packages) first, then internal (`@/` aliases and relative paths), exactly one blank line between the groups. Inside each group sort by module path length ascending, then A-Z (`eslint-rules/import-order-by-length.mjs`). `import type` follows the same order. Side-effect imports (`import "x"`, e.g. CSS) keep their place and split the sorting into separate runs.
- No unused or duplicate imports; use `import type` for type-only imports.
- Avoid `any` (use `unknown` and narrow), unsafe `as` and `@ts-ignore`; prefer `const`.
- Do not disable a lint rule to get past an error; fix the cause. Do not reformat or re-sort files unrelated to the task.
- Server Components by default; `"use client"` only for interactivity. Keep business logic in hooks/modules, not presentational components. Handle loading, empty, error and retry states.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
