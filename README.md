# TanStack Start + Zero Starter

A **very opinionated** starter for apps built with [TanStack Start](https://tanstack.com/start), [Rocicorp Zero](https://zerosync.dev/), [Drizzle](https://orm.drizzle.team/), [Better Auth](https://www.better-auth.com/), Tailwind CSS v4, shadcn/ui, and [Bun](https://bun.sh/).

It ships with a realtime multi-user chat demo (`features/chat`), Vertical Feature Slice layout, Cursor/agent rules, and Playwright E2E. Clone it, rename it, delete what you don’t need.

License: [MIT](LICENSE).

## Quick start

Requires Bun and Docker.

```bash
git clone <repo-url> my-app
cd my-app
bun install
cp .env.example .env
docker compose -f docker/docker-compose.dev.yml up -d
bun run db:migrate
bun run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and try the chat.

Update `"name"` in `package.json` (and the document title in `src/routes/__root.tsx` if you want).

> **Demo authz:** any signed-in user can see every chat and post to any `chatId`. That is intentional for the sync demo — replace it before production. See [`src/server/zero/authz.demo.ts`](src/server/zero/authz.demo.ts).

## Project layout

```text
src/
  routes/           # thin pages + API handlers
  features/<name>/  # ui/, lib/, index.ts
  components/ui/    # shadcn primitives
  components/       # app shell
  server/auth|db/   # Node-only
  server/zero/      # isomorphic Zero schema / queries / mutators
  shared/           # env, auth client, helpers
```

App imports use `#/…`. shadcn uses `@/components/ui/…` and `@/lib/utils`.

Conventions for humans and agents: [`AGENTS.md`](AGENTS.md), [`.cursor/rules/`](.cursor/rules/).

### Adding a feature

1. `src/features/<name>/{ui,lib,index.ts}`
2. Thin route under `src/routes/` that renders the feature
3. Tables in `src/server/db/<entity>/` → `bun run db:generate` → `bun run db:migrate`
4. Queries / mutators in `src/server/zero/` → `bun run zero:generate`
5. UI via shadcn: `bunx shadcn@latest add <component>`

## Commands

| Task | Command |
|------|---------|
| Dev | `bun run dev` |
| Lint / format | `bun run check` |
| Typecheck | `bun run typecheck` |
| Build | `bun run build` |
| Start (after build) | `bun run start` |
| Migrate | `bun run db:migrate` |
| Drizzle Studio | `bun run db:studio` |
| Generate Zero schema | `bun run zero:generate` |
| E2E | `bun run test:e2e` |

## E2E

Uses a separate stack (Postgres `5433`, Zero `4849`, app `3100`) so it does not clash with local dev.

```bash
cp .env.e2e.example .env.e2e
bunx playwright install chromium
bun run test:e2e
```

CI runs quality checks and Playwright in parallel (see `.github/workflows/ci.yml`).

## Production

```bash
bun run build
bun run start
```

Or the full stack: [`docker/docker-compose.yml`](docker/docker-compose.yml) + [`Dockerfile`](Dockerfile). Set strong `POSTGRES_PASSWORD`, `ZERO_ADMIN_PASSWORD`, and `BETTER_AUTH_SECRET` before deploying.

## Troubleshooting

| Issue | Check |
|-------|--------|
| Zero not syncing | Dev compose publishes `4848`; `ZERO_CACHE_UPSTREAM_URL` points at it |
| Zero → app on Linux | Compose includes `host.docker.internal:host-gateway`; app listens on `0.0.0.0:3000` |
| Postgres / Zero | `wal_level=logical` is required |
| Playwright browsers | `bunx playwright install chromium` |
| Zero types are `unknown` | Re-run `bun run zero:generate` |
