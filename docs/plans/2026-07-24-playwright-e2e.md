# Playwright E2E Chat Sync — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Добавить Playwright E2E: signup/logout/login, два пользователя пишут в один чат и оба видят оба сообщения.

**Architecture:** Playwright + два `browser.newContext()`. Отдельный `docker/docker-compose.e2e.yml` поднимает изолированные Postgres + Zero на неконфликтных портах. App стартует через Playwright `webServer` с `.env.e2e`.

**Tech Stack:** Playwright, Bun, Docker Compose, Better Auth, Zero, TanStack Start

---

## Решение: отдельный compose для тестов — да

Не правим только `docker-compose.dev.yml`. Для E2E заводим **`docker/docker-compose.e2e.yml`**.

Почему:
- не мешает локальному dev (другие порты/имена контейнеров/volume)
- предсказуемый стек в CI и у других разработчиков
- можно сбросить volume между прогонами без потери dev-данных
- Zero сразу с опубликованным портом (в dev сейчас 4848 не проброшен)

Конкретные порты (не пересекаются с dev `5432` / `4848`):

| Сервис | Host port | Контейнер |
|--------|-----------|-----------|
| Postgres | `5433` | `5432` |
| Zero cache | `4849` | `4848` |

Имена: `zero-postgres-e2e`, `zero-cache-e2e`, volume `zero-cache-e2e-data`.

Файл окружения: **`.env.e2e`** (в `.gitignore`, в репо — `.env.e2e.example`):

```bash
APP_URL="http://localhost:3000"
ZERO_UPSTREAM_DB="postgres://postgres:pass@localhost:5433/zero"
ZERO_CACHE_UPSTREAM_URL="http://localhost:4849"
ZERO_QUERY_URL="http://localhost:3000/api/query"
ZERO_MUTATE_URL="http://localhost:3000/api/mutate"
```

Zero-cache в compose указывает на app:

```yaml
ZERO_QUERY_URL: http://host.docker.internal:3000/api/query
ZERO_MUTATE_URL: http://host.docker.internal:3000/api/mutate
```

+ `ports: ["4849:4848"]`, postgres `ports: ["5433:5432"]`, `wal_level=logical`.

Скрипты:

```json
"test:e2e:infra": "docker compose -f docker/docker-compose.e2e.yml up -d",
"test:e2e:infra:down": "docker compose -f docker/docker-compose.e2e.yml down -v",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

Перед тестами: infra up → `dotenv -e .env.e2e -- bun run db:migrate` (или migrate с `ZERO_UPSTREAM_DB` из `.env.e2e`). Playwright `webServer` запускает `bun run dev` с теми же env.

---

## Остальное (без изменений по смыслу)

### data-testid
Login + chat UI: `auth-*`, `chat-logout`, `chat-new`, `chat-create-*`, `chat-list-item`, `chat-message-input`, `chat-send`, `chat-message`.

### Playwright
`playwright.config.ts`, `e2e/helpers/{auth,chat}.ts`, `e2e/chat-sync.spec.ts`.

### Сценарий `chat-sync.spec.ts`
1. Context A: signup → logout → login → create chat  
2. Context B: signup → open same chat  
3. A→msg, B видит; B→msg, A видит; оба видят оба  

Уникальные email через timestamp. Expect с таймаутом под Zero sync.

### Docs
README + AGENTS: `test:e2e:infra` → migrate → `test:e2e`.

## Tasks

1. Create `docker/docker-compose.e2e.yml` + `.env.e2e.example` + gitignore `.env.e2e`
2. Add package scripts for e2e infra
3. Add data-testid to login/chat UI
4. Install Playwright, config, helpers
5. Write `e2e/chat-sync.spec.ts`
6. Update README / AGENTS
