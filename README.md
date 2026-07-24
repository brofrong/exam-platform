# Starter: TanStack Start + Zero

Стартер для своих проектов ([MIT](LICENSE)). Клонируй репозиторий, переименуй под задачу и развивай приложение на готовом стеке.

В комплекте: **TanStack Start**, **Drizzle**, **Rocicorp Zero**, **Better Auth**, **Tailwind CSS v4**, **shadcn/ui**, **Bun**. Демо-фича — синхронный чат (`features/chat`).

## Быстрый старт

### 1. Клонировать и переименовать

```bash
git clone <url-этого-репо> my-app
cd my-app
```

В [`package.json`](package.json) поменяй `"name"` на имя проекта. При желании обнови title в [`src/routes/__root.tsx`](src/routes/__root.tsx).

### 2. Установить зависимости

Нужен [Bun](https://bun.sh/) **≥ 1.3** (в `packageManager` зафиксирован `1.3.14`) и Docker (для Postgres + Zero cache).

```bash
bun install
```

### 3. Окружение

```bash
cp .env.example .env
```

При необходимости поправь значения. Переменные приложения типизированы в `src/shared/env.ts`.  
`ZERO_QUERY_URL` / `ZERO_MUTATE_URL` нужны контейнеру Zero (см. compose), не читаются app-кодом.

Опционально задай `BETTER_AUTH_SECRET` (≥ 32 символов) для prod / нескольких инстансов. Если не задан, секрет один раз генерируется и сохраняется в `app_setting`.

### 4. Инфраструктура (Postgres + Zero)

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

Порты: Postgres **5432**, Zero cache **4848**. Compose добавляет `extra_hosts` для Linux (`host.docker.internal`).

### 5. Миграции и dev-сервер

```bash
bun run db:migrate
bun run dev
```

Приложение: [http://localhost:3000](http://localhost:3000). Зарегистрируйся / войди — откроется демо-чат.

> **Authz демо:** любой залогиненный пользователь видит все чаты и может писать в любой `chatId`. Это упрощение для sync-демо. Перед продом замени на membership/ownership — примеры в [`src/server/zero/authz.demo.ts`](src/server/zero/authz.demo.ts).

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
4. Queries/mutators — в `src/server/zero/`, schema обнови через `bun run zero:generate` (скрипт сам чинит `customType` до примитивов).
5. UI — через shadcn:

```bash
bunx shadcn@latest add button
```

### Полезные команды

| Задача | Команда |
|--------|---------|
| Dev-сервер | `bun run dev` |
| Lint / format | `bun run check` |
| Typecheck | `bun run typecheck` |
| Сборка | `bun run build` |
| Prod-старт (после build) | `bun run start` |
| Миграции | `bun run db:migrate` |
| Drizzle Studio | `bun run db:studio` |
| Zero schema | `bun run zero:generate` |
| E2E | `bun run test:e2e` |

Миграции: `bun run db:migrate` — основной путь локально. При старте приложения (`db.ts`) миграции также применяются автоматически (удобно для Docker / `bun start`); путь ищется в `src/server/db/migrations`.

### E2E (Playwright)

Отдельный стек на портах **5433** (Postgres), **4849** (Zero) и app на **3100**, чтобы не мешать dev (`3000` / `5432` / `4848`).

```bash
cp .env.e2e.example .env.e2e   # если ещё нет
bunx playwright install chromium
bun run test:e2e
```

`test:e2e` сам поднимает `docker/docker-compose.e2e.yml`, гоняет миграции и стартует app через Playwright `webServer`. Данные в тестах уникальные (email/чат на каждый прогон) — БД между тестами не чистится.

В CI (`.github/workflows/ci.yml`) параллельно идут `quality` (`check` + `typecheck` + `build`) и Playwright. После успеха обоих на `main` собирается и пушится Docker-образ (`vars.DOCKERHUB_IMAGE`, по умолчанию `brofrong/zero-test`).

Остановить infra локально: `bun run test:e2e:infra:down` (с `-v` снесёт volume).

### Auth и данные

- Клиент: `#/shared/auth-client` (Better Auth), UI — `features/auth`.
- Сервер: `src/server/auth/`.
- Синхрон UI ↔ БД: Zero (`useQuery` / `zero.mutate`) через cache; app отдаёт `/api/query` и `/api/mutate`.

## Production (кратко)

```bash
bun run build
bun run start
```

Полный стек в Docker — [`docker/docker-compose.yml`](docker/docker-compose.yml) и [`Dockerfile`](Dockerfile).

Образ и тег можно переопределить:

```bash
DOCKER_IMAGE=myuser/my-app DOCKER_TAG=latest docker compose -f docker/docker-compose.yml up -d
```

Задай сильные `POSTGRES_PASSWORD`, `ZERO_ADMIN_PASSWORD` и `BETTER_AUTH_SECRET` перед деплоем.

## Troubleshooting

| Проблема | Что проверить |
|----------|----------------|
| Zero не синкается | `docker compose -f docker/docker-compose.dev.yml ps` — порт **4848** должен быть published; `ZERO_CACHE_UPSTREAM_URL=http://localhost:4848` |
| Zero не достучится до app на Linux | В compose уже есть `extra_hosts: host.docker.internal:host-gateway`; app должен слушать `0.0.0.0:3000` (`bun run dev`) |
| Postgres / logical replication | В compose задан `wal_level=logical` — без этого Zero cache не поднимется |
| Playwright не находит браузер | `bunx playwright install chromium` |
| `bun start` не находит migrations | Должна существовать `src/server/db/migrations` относительно cwd (после clone / в Docker она копируется в образ) |
| Типы Zero стали `unknown` | Перегони `bun run zero:generate` — post-скрипт чинит `customType` |
