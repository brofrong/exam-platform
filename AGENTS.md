# AGENTS.md

Guidance for AI agents working in this repo.

## Read first

Cursor project rules in `.cursor/rules/` are the source of truth:

- `architecture.mdc` — folders, Vertical Feature Slices, aliases, stack
- `features-ui.mdc` — thin routes, features, shadcn
- `server-zero.mdc` — Drizzle, Zero, auth, env

## Commands

| Task | Command |
|------|---------|
| Dev | `bun run dev` |
| Lint/format check | `bun run check` |
| Typecheck | `bun run typecheck` |
| Build | `bun run build` |
| DB migrate | `bun run db:migrate` |
| Generate Zero schema | `bun run zero:generate` |
| Add shadcn component | `bunx shadcn@latest add <name>` |
| E2E | `bun run test:e2e` (starts e2e compose + migrate; also runs in GitHub Actions) |
| Bump version | `bun run version:patch` / `version:minor` / `version:major` (patch also runs on every regular commit via `.githooks/pre-commit`) |

`SKIP_VERSION_BUMP=1` skips the auto patch bump (useful for amend / intentional major-minor). After clone, `bun install` sets `core.hooksPath` to `.githooks`.

## Do / Don't

- **Do** put new product UI in `src/features/<name>/` and keep routes thin.
- **Do** use `#/` for app imports and `@/` for shadcn/`cn`.
- **Do** keep `server/zero` isomorphic (no Node-only deps).
- **Do** scope Zero queries/mutators with real authz (membership / capabilities) — no demo-open patterns.
- **Do** use unique emails/titles in E2E; keep `data-testid` on interactive UI.
- **Don't** dump logic into `src/routes/*` or recreate `src/utils` / top-level `src/zero`.
- **Don't** commit secrets (`.env`, `.env.e2e`) or edit `routeTree.gen.ts` by hand.
