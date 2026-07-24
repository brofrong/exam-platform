# Exam Platform

LMS для подготовки к **ЕГЭ** и **ОГЭ**: админ наполняет программы и уроки, ученик проходит выданные программы, сдаёт практику, смотрит прогресс и пишет в поддержку.

Стек: [TanStack Start](https://tanstack.com/start), [Rocicorp Zero](https://zerosync.dev/), [Drizzle](https://orm.drizzle.team/), [Better Auth](https://www.better-auth.com/), TipTap, MinIO (S3), Tailwind CSS v4, shadcn/ui, [Bun](https://bun.sh/), Playwright.

В репозитории — вертикальные feature-slices, правила для Cursor/агентов и E2E. Дизайн и план реализации: [`docs/plans/`](docs/plans/).

Лицензия: [MIT](LICENSE).

## Продукт (MVP)

| Роль | Что доступно |
|------|----------------|
| **Student** | `/app` — программы по enrollment, уроки (теория + практика), прогресс, `/app/support` |
| **Admin** | `/admin` — программы/темы, каталог уроков, инвайты, очередь ревью, аналитика, inbox поддержки |

Публичное: `/` (лендинг-заглушка), `/login`, `/invite/:token`.

Контент: программа → темы → уроки (M2M) → activities (`theory` \| `practice`). Публикация `draft` \| `published`. Файлы в S3 (`editor/…`, `submissions/…`).

### Инвайты

1. Админ создаёт одноразовую ссылку в `/admin/invites` (несколько программ, опционально email и срок).
2. Ученик открывает `/invite/:token` (нужна сессия), активирует — получает enrollment.
3. После активации токен одноразовый; дальше программы видны в `/app`.

### Роли и capabilities

Новые пользователи — `student`. Админ вручную:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

Права в UI и Zero mutators — через `can(role, capability)` из `#/shared/authz`, не через `role === 'admin'`.

| Capability | Кто |
|------------|-----|
| `program:write`, `lesson:write`, `invite:create` | admin |
| `submission:review`, `analytics:read`, `support:reply` | admin |
| *(пусто)* | student — доступ к своим enrollment / submissions / support-треду |

Роль `teacher` в MVP нет; карта capabilities готова к расширению.

### UI-галерея `/dev`

Каталог shadcn + LMS-композитов (как docs у shadcn).

- В **DEV** (`bun run dev`) открыта без ограничений.
- В **production** — только пользователи с `program:write` (иначе редирект на `/app` / `/login`).

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

Откройте [http://localhost:3000](http://localhost:3000), зарегистрируйтесь, при необходимости повысьте роль до admin (SQL выше).

### MinIO / S3

Object storage поднимается вместе с Postgres/Zero:

| Сервис | Порт | URL |
|--------|------|-----|
| S3 API | `9000` | `http://localhost:9000` |
| MinIO Console | `9001` | [http://localhost:9001](http://localhost:9001) |

Логин консоли по умолчанию: `minioadmin` / `minioadmin`. Bucket `exam-platform-uploads` создаётся init-контейнером (`minio-init`). Переменные: `S3_*` в `.env` (см. `.env.example`, типизация в `src/shared/env.ts`). Проверка: `bun run smoke:s3`.

## Структура проекта

```text
src/
  routes/           # тонкие страницы + API-обработчики
  features/<name>/  # ui/, lib/, index.ts
  components/ui/    # примитивы shadcn
  components/       # оболочка + LMS-композиты
  server/auth|db/   # только Node
  server/zero/      # изоморфная схема / queries / mutators Zero
  shared/           # env, authz, auth-клиент
```

Импорты приложения: `#/…`. shadcn: `@/components/ui/…` и `@/lib/utils`.

Соглашения: [`AGENTS.md`](AGENTS.md), [`.cursor/rules/`](.cursor/rules/).

### Новая фича

1. `src/features/<name>/{ui,lib,index.ts}`
2. Тонкий роут в `src/routes/`, который рендерит фичу
3. Таблицы в `src/server/db/<entity>/` → `bun run db:generate` → `bun run db:migrate`
4. Queries / mutators в `src/server/zero/` → `bun run zero:generate`
5. UI через shadcn: `bunx shadcn@latest add <component>`; демо в `/dev` при необходимости

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
| Smoke MinIO / S3 | `bun run smoke:s3` |
| E2E | `bun run test:e2e` |

## E2E

Отдельный стек (Postgres `5433`, Zero `4849`, MinIO API `9010` / console `9011`, приложение `3100`), чтобы не пересекаться с локальной разработкой.

```bash
cp .env.e2e.example .env.e2e
bunx playwright install chromium
bun run test:e2e
```

`test:e2e` поднимает e2e compose, мигрирует БД и гоняет Playwright (критические LMS-потоки в `e2e/lms-critical-paths.spec.ts`). В CI то же параллельно с quality checks (см. `.github/workflows/ci.yml`).

Используйте уникальные email/titles в тестах; интерактивным контролам — `data-testid`.

## Продакшен

```bash
bun run build
bun run start
```

Или полный стек: [`docker/docker-compose.yml`](docker/docker-compose.yml) + [`Dockerfile`](Dockerfile). Перед деплоем задайте надёжные `POSTGRES_PASSWORD`, `ZERO_ADMIN_PASSWORD`, `BETTER_AUTH_SECRET`, `S3_ACCESS_KEY` и `S3_SECRET_KEY`.

Docker-образ по умолчанию: `brofrong/exam-platform`.

## Устранение неполадок

| Проблема | Что проверить |
|-------|--------|
| Zero не синхронизируется | Dev compose публикует `4848`; `ZERO_CACHE_UPSTREAM_URL` указывает на него |
| Zero → app на Linux | В compose есть `host.docker.internal:host-gateway`; приложение слушает `0.0.0.0:3000` |
| Postgres / Zero | Нужен `wal_level=logical` |
| MinIO / upload | Dev: API `9000`, console `9001`; `S3_*` в `.env`; `bun run smoke:s3` |
| Браузеры Playwright | `bunx playwright install chromium` |
| Типы Zero — `unknown` | Перезапустите `bun run zero:generate` |
| Нет программ у ученика | Enrollment через инвайт `/invite/:token`; программы должны быть `published` |
