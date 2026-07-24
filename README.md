# Starter: TanStack Start + Zero

Стартер для своих проектов. Клонируй репозиторий, переименуй под задачу и развивай приложение на готовом стеке.

В комплекте: **TanStack Start**, **Drizzle**, **Rocicorp Zero**, **Better Auth**, **Tailwind CSS v4**, **shadcn/ui**, **Bun**. Демо-фича — синхронный чат (`features/chat`).

## Быстрый старт

### 1. Клонировать и переименовать

```bash
git clone <url-этого-репо> my-app
cd my-app
```

В [`package.json`](package.json) поменяй `"name"` на имя проекта. При желании обнови title в [`src/routes/__root.tsx`](src/routes/__root.tsx).

### 2. Установить зависимости

Нужен [Bun](https://bun.sh/) (canary / свежий релиз) и Docker (для Postgres + Zero cache).

```bash
bun install
```

### 3. Окружение

Создай `.env` в корне (можно скопировать значения ниже):

```bash
APP_URL="http://localhost:3000"
ZERO_UPSTREAM_DB="postgres://postgres:pass@localhost:5432/zero"
ZERO_CACHE_UPSTREAM_URL="http://localhost:4848"
ZERO_QUERY_URL="http://localhost:3000/api/query"
ZERO_MUTATE_URL="http://localhost:3000/api/mutate"
```

### 4. Инфраструктура (Postgres + Zero)

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

### 5. Миграции и dev-сервер

```bash
bun run db:migrate
bun run dev
```

Приложение: [http://localhost:3000](http://localhost:3000). Зарегистрируйся / войди — откроется демо-чат.

## Разработка

### Структура

Код организован как **Vertical Feature Slices**:

```text
src/
  routes/              # тонкие страницы и API
  features/<name>/     # фича: ui/, lib/, index.ts
  components/ui/       # shadcn
  components/          # shell (Header, ThemeToggle, …)
  server/auth|db/      # сервер (Node-only)
  server/zero/         # Zero schema / queries / mutators (изоморфно)
  shared/              # env, auth-client, общие хелперы
```

Импорты приложения: `#/…`. shadcn: `@/components/ui/…`, `@/lib/utils`.

Подробные правила для ИИ и людей: [`AGENTS.md`](AGENTS.md) и [`.cursor/rules/`](.cursor/rules/).

### Новая фича

1. Создай `src/features/<name>/{ui,lib,index.ts}`.
2. Добавь тонкий route в `src/routes/`, который рендерит фичу.
3. Таблицы — в `src/server/db/<entity>/`, затем `bun run db:generate` и `bun run db:migrate`.
4. Queries/mutators — в `src/server/zero/`, schema обнови через `bun run zero:generate` (если типы стали `unknown`, верни примитивы `string`/`number` в `customType`).
5. UI — через shadcn:

```bash
bunx shadcn@latest add button
```

### Полезные команды

| Задача | Команда |
|--------|---------|
| Dev-сервер | `bun run dev` |
| Lint / format | `bun run check` |
| Сборка | `bun run build` |
| Prod-старт (после build) | `bun run start` |
| Миграции | `bun run db:migrate` |
| Drizzle Studio | `bun run db:studio` |
| Zero schema | `bun run zero:generate` |
| Unit-тесты | `bun run test` |
| E2E | `bun run test:e2e` |

### E2E (Playwright)

Отдельный стек на портах **5433** (Postgres), **4849** (Zero) и app на **3100**, чтобы не мешать dev (`3000` / `5432` / `4848`).

```bash
cp .env.e2e.example .env.e2e   # если ещё нет
bunx playwright install chromium
bun run test:e2e
```

`test:e2e` сам поднимает `docker/docker-compose.e2e.yml`, гоняет миграции и стартует app через Playwright `webServer`. Данные в тестах уникальные (email/чат на каждый прогон) — БД между тестами не чистится.

В CI то же самое делает workflow [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) на push в `main` и на pull request.

Остановить infra локально: `bun run test:e2e:infra:down` (с `-v` снесёт volume).

### Auth и данные

- Клиент: `#/shared/auth-client` (Better Auth).
- Сервер: `src/server/auth/`.
- Синхрон UI ↔ БД: Zero (`useQuery` / `zero.mutate`) через cache; app отдаёт `/api/query` и `/api/mutate`.

## Production (кратко)

```bash
bun run build
bun run start
```

Полный стек в Docker — [`docker/docker-compose.yml`](docker/docker-compose.yml) и [`Dockerfile`](Dockerfile).
