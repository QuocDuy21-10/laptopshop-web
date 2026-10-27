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

## Deployment

`docker compose -f docker-compose.example.yml up -d --build` runs the API stack (included from `../nodejs-pro`), this app and nginx on port 80.

- nginx sends `/api/v1/` and `/images/` straight to Express and everything else to Next. Next rewrites drop `X-Forwarded-For`, so routing API traffic through Next in production would make every user share one IP in the API rate limiter.
- `API_ORIGIN` is a Docker build arg (rewrites are compiled at build time) and a runtime env (server-side catalog fetches).
- Set the API's `CORS_ORIGINS` to the public site origin (the API rejects writes from other origins) and terminate HTTPS in front of nginx: the API's auth cookies are `Secure` in production.
