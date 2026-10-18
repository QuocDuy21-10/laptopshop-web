# AGENTS.md

Guidance for AI coding agents. The source of truth for commands, architecture and conventions is [CLAUDE.md](CLAUDE.md); the design source of truth is [DESIGN.md](DESIGN.md). Read both first.

Before finishing any change, run and pass: `npm run lint && npm run lint:css && npm run typecheck && npm test`.

Rules that are easy to miss:
- Colours only through `var(--color-*)`; Stylelint rejects hex outside `src/styles/_tokens.scss`.
- Public catalog data: Server Components + `src/lib/api/server.ts`. User data: TanStack Query hooks + `src/lib/api/client.ts`.
- Do not add a second token-refresh path; use `refreshSession()`.
- Show only product data the API returns; no fake ratings, discounts or urgency.
- After changing the API contract, run `npm run gen:api` and commit `src/lib/api/schema.d.ts`.
