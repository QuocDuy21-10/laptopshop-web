# laptopshop-web

Storefront for LaptopShop (Next.js 16, TypeScript, SCSS Modules). Talks to [laptopshop-api](https://github.com/QuocDuy21-10/laptopshop-api) over `/api/v1`. Design system: [DESIGN.md](DESIGN.md).

## Development

```bash
cp .env.example .env.local      # API_ORIGIN=http://localhost:8080
pnpm install
pnpm dev                        # http://localhost:3000
```

Run the API alongside it (`../nodejs-pro`: `docker compose up -d mysql redis`, `npm run dev`). In dev, Next rewrites `/api/v1/*` and `/images/*` to `API_ORIGIN`, so the browser only talks to `localhost:3000` and the auth cookies are first-party.

Scripts: `pnpm lint`, `pnpm lint:css`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm gen:api` (regenerate API types; see CLAUDE.md).

## E2E (local only)

Needs the API on :8080 with seeded data (`npx prisma migrate deploy && npm run seed` in the API repo). Then `pnpm exec playwright install chromium` once and `pnpm e2e`. The API limits auth calls to 10 per 15 minutes per IP; after many reruns, flush it with `docker compose exec redis redis-cli FLUSHALL` in the API repo.

The admin spec logs in as the seeded `admin@gmail.com`. If the API was seeded with a non-default `ADMIN_PASSWORD`, run `E2E_ADMIN_PASSWORD=<password> pnpm e2e`.

## Deployment

`docker compose -f docker-compose.example.yml up -d --build` runs the API stack (included from `../nodejs-pro`), this app and nginx on port 80.

- nginx sends `/api/v1/` and `/images/` straight to Express and everything else to Next. Next rewrites drop `X-Forwarded-For`, so routing API traffic through Next in production would make every user share one IP in the API rate limiter.
- `API_ORIGIN` is a Docker build arg (rewrites are compiled at build time) and a runtime env (server-side catalog fetches).
- Set the API's `CORS_ORIGINS` to the public site origin (the API rejects writes from other origins) and terminate HTTPS in front of nginx: the API's auth cookies are `Secure` in production.
