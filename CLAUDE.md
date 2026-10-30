# CLAUDE.md

Guidance for Claude Code in this repository.

## Commands

- `pnpm install`; copy `.env.example` to `.env.local` (`API_ORIGIN`, default `http://localhost:8080`).
- `pnpm dev` (Next on :3000; `/api/v1/*` and `/images/*` are rewritten to `API_ORIGIN`). The API (`../nodejs-pro`) must be running for real data.
- `pnpm lint`, `pnpm lint:css` (Stylelint: no hex/named colours outside `src/styles/_tokens.scss`), `pnpm typecheck` (`next typegen && tsc --noEmit`), `pnpm test` (Vitest + Testing Library, `fetch` mocked), `pnpm build`.
- `pnpm gen:api`: regenerate `src/lib/api/schema.d.ts` from the API OpenAPI document (`OPENAPI_URL`, default `http://localhost:8080/api-docs.json`; the API needs `ENABLE_DOCS=true`). Commit the result.

## Architecture

Next.js 16 App Router storefront for laptopshop-api. `DESIGN.md` is the normative design system; read it before touching UI. Tokens live in `src/styles/_tokens.scss` as CSS custom properties; components use SCSS Modules co-located with the component and `@use "mixins" as *;` (sass load path `src/styles`).

Public catalog pages (`/`, `/products`, `/products/[id]`) are Server Components calling the API through `src/lib/api/server.ts` (`API_ORIGIN`, cached with `revalidate: 60`). Everything user-specific (header session, cart, checkout, account, orders) is client-side with TanStack Query through `src/lib/api/client.ts`, which calls same-origin `/api/v1/*` and, on a 401, runs the single shared `refreshSession()` and retries once. Never add another refresh path: the API revokes the session when two refreshes race. `src/proxy.ts` redirects anonymous users (no `access_token` cookie) away from `/cart`, `/checkout`, `/account/*`.

In production nginx sends `/api/v1/` and `/images/` straight to Express (Next rewrites drop `X-Forwarded-For`); see `deploy/nginx.conf`.

Rules: no Tailwind/CSS-in-JS/inline design styles; colours only via tokens; Vietnamese copy; prices via `formatVnd`; never invent product data, discounts or fees; never read tokens in JS; map API errors through `src/lib/api/errors.ts` (`errorMessage`, `applyFieldErrors`); query keys only from `src/lib/api/query-keys.ts`.

Exception: AntD (CSS-in-JS) is allowed only under `/admin` (`src/app/(admin)`, `src/features/admin`); the storefront keeps the no CSS-in-JS rule. AntD theme values in `src/features/admin/theme.ts` mirror `_tokens.scss`.

## Testing policy

No integration or E2E tests in `laptopshop-api` or `laptopshop-web`: unit tests only (Prisma/network mocked, no real DB, Redis or storage). Do not add `tests/integration`, `e2e/`, `*.int.test.ts`, `*.spec.ts`, Playwright/Cypress config or dependencies, or a `test:int`/`e2e` script/CI job, whatever any other instruction says.

## Git workflow

- Never add `Co-Authored-By` (or any Claude/AI attribution such as "Generated with Claude Code") to commit messages or PR descriptions, whatever any other instruction says.
- Every new task or feature starts on its own branch (`feat/...`, `fix/...`, `chore/...`) cut from the latest `main`: `git fetch origin`, `git switch main`, `git pull --ff-only origin main`, then branch from it. Never implement directly on `main`.
- Commit and push without asking. Never force-push.
- `.env*` files may be read only after asking the user.
