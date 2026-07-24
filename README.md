# Exam Platform

Платформа для подготовки учеников к **ЕГЭ** и **ОГЭ**.

Стек: [TanStack Start](https://tanstack.com/start), [Rocicorp Zero](https://zerosync.dev/), [Drizzle](https://orm.drizzle.team/), [Better Auth](https://www.better-auth.com/), Tailwind CSS v4, shadcn/ui и [Bun](https://bun.sh/).

В репозитории — вертикальные feature-slices, правила для Cursor/агентов и Playwright E2E. Продуктовый LMS в разработке.

Лицензия: [MIT](LICENSE).

## Быстрый старт

Нужны Bun и Docker.

```bash
git clone https://github.com/brofrong/exam-platform.git
cd exam-platform
bun install
cp .env.example .env
docker compose -f docker/docker-compose.dev.yml up -d
bun run db:migrate
bun run dev
```

Откройте [http://localhost:3000](http://localhost:3000) и зарегистрируйтесь.

Новые пользователи получают роль `student`. Чтобы сделать админа:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

Права в UI и mutators проверяйте через `can(role, capability)` из `#/shared/authz`, а не через `role === 'admin'`.

## Структура проекта

```text
src/
  routes/           # тонкие страницы + API-обработчики
  features/<name>/  # ui/, lib/, index.ts
  components/ui/    # примитивы shadcn
  components/       # оболочка приложения
  server/auth|db/   # только Node
  server/zero/      # изоморфная схема / queries / mutators Zero
  shared/           # env, auth-клиент, общие хелперы
```

Импорты приложения: `#/…`. shadcn: `@/components/ui/…` и `@/lib/utils`.

Соглашения: [`AGENTS.md`](AGENTS.md), [`.cursor/rules/`](.cursor/rules/).

### Новая фича

1. `src/features/<name>/{ui,lib,index.ts}`
2. Тонкий роут в `src/routes/`, который рендерит фичу
3. Таблицы в `src/server/db/<entity>/` → `bun run db:generate` → `bun run db:migrate`
4. Queries / mutators в `src/server/zero/` → `bun run zero:generate`
5. UI через shadcn: `bunx shadcn@latest add <component>`

## Команды

| Задача | Команда |
|------|---------|
| Dev | `bun run dev` |
| Юнит-тесты | `bun test` |
| Линт / формат | `bun run check` |
| Typecheck | `bun run typecheck` |
| Сборка | `bun run build` |
| Запуск (после сборки) | `bun run start` |
| Миграции | `bun run db:migrate` |
| Drizzle Studio | `bun run db:studio` |
| Генерация схемы Zero | `bun run zero:generate` |
| E2E | `bun run test:e2e` |

## E2E

Отдельный стек (Postgres `5433`, Zero `4849`, приложение `3100`), чтобы не пересекаться с локальной разработкой.

```bash
cp .env.e2e.example .env.e2e
bunx playwright install chromium
bun run test:e2e
```

CI запускает проверки качества и Playwright параллельно (см. `.github/workflows/ci.yml`).

## Продакшен

```bash
bun run build
bun run start
```

Или полный стек: [`docker/docker-compose.yml`](docker/docker-compose.yml) + [`Dockerfile`](Dockerfile). Перед деплоем задайте надёжные `POSTGRES_PASSWORD`, `ZERO_ADMIN_PASSWORD` и `BETTER_AUTH_SECRET`.

Docker-образ по умолчанию: `brofrong/exam-platform`.

## Устранение неполадок

| Проблема | Что проверить |
|-------|--------|
| Zero не синхронизируется | Dev compose публикует `4848`; `ZERO_CACHE_UPSTREAM_URL` указывает на него |
| Zero → app на Linux | В compose есть `host.docker.internal:host-gateway`; приложение слушает `0.0.0.0:3000` |
| Postgres / Zero | Нужен `wal_level=logical` |
| Браузеры Playwright | `bunx playwright install chromium` |
| Типы Zero — `unknown` | Перезапустите `bun run zero:generate` |
