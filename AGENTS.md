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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
