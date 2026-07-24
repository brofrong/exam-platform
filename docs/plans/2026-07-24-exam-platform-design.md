# Exam Platform Design

Дата: 2026-07-24  
Статус: согласован (brainstorming); MVP реализован на ветке `feat/exam-platform-lms`

## Цель

LMS для подготовки к ЕГЭ/ОГЭ: администратор наполняет программы прямо на сайте, ученик проходит только выданные ему программы, видит прогресс и общается с преподавателями (админами) в общем треде поддержки.

Стек уже в репозитории: TanStack Start, Drizzle, Rocicorp Zero, Better Auth, Tailwind v4, shadcn/ui, Bun. Демо realtime-чат полностью удаляется.

## Решения (зафиксировано)

| Тема | Решение |
|------|---------|
| Роли MVP | `admin`, `student` |
| Авторизация прав | Capabilities / feature-flags на роль (легко добавить `teacher` позже) |
| Урок | Отдельная сущность, M2M с темами; один урок в нескольких темах/программах |
| Прогресс | В контексте `(user, program, lesson)` / activity внутри enrollment программы |
| Инвайт | Персональная одноразовая ссылка на **несколько** программ |
| Практика | Автопроверка + ручная (файл), комментарий ревьюера |
| Оценка | Верно / неверно (+ комментарий при ручной проверке) |
| Прогресс UX | Гибрид: детали для ученика, агрегаты + drill-down для админа |
| Публикация | `draft` \| `published` у program, topic и lesson |
| Контент урока | Урок = контейнер + упорядоченные `activities` (`theory` \| `practice`) |
| Видео | Кастомная TipTap-нода (URL → embed), прогресс best-effort |
| Интерактив | TipTap-нода `liveReact` + react-live + Mafs |
| Файлы | S3-совместимый object storage (MinIO в docker-compose) |
| Чат | Один support-тред на ученика ↔ все админы (не демо-чат) |
| Лендинг | Заглушка в MVP |
| UI kit | shadcn + LMS-композиты; галерея `/dev` (как shadcn) |

## Обзор продукта и экраны

### Публичное

- `/` — лендинг-заглушка
- `/login` — вход / регистрация (Better Auth)
- `/invite/:token` — активация инвайта (после auth)
- `/dev` — галерея UI-компонентов (DEV и/или admin)

### Ученик

- Navbar: гость → «Войти»; авторизованный → аватар (`user.image` / инициалы) и меню
- `/app` — домашняя: инфографика прогресса, «продолжить», блок «на проверке», превью чата с преподом
- `/app/programs/:programId` — темы, уроки, прогресс по программе (только enrolled + published)
- `/app/programs/:programId/lessons/:lessonId` — плеер занятий
- `/app/support` — тред с преподавателями

### Админ

- `/admin` — дашборд
- `/admin/programs` — CRUD программ, тем, порядок `topic_lesson`, publish
- `/admin/lessons` — каталог уроков и activities, редактор TipTap
- `/admin/invites` — одноразовые ссылки на несколько программ
- `/admin/reviews` — очередь ручной проверки
- `/admin/analytics` — прогресс учеников с drill-down
- `/admin/support` — inbox тредов учеников

Route guards: session + `can(capability)`.

## Доменная модель

### Каталог

```
program
  id, title, description, examType, subject, status(draft|published), timestamps

topic
  id, programId, title, position, status(draft|published)

lesson
  id, title, status(draft|published)   -- не принадлежит одной программе

topic_lesson
  topicId, lessonId, position          -- M2M, порядок в теме

activity
  id, lessonId, type(theory|practice), position, content(jsonb TipTap)
```

Ученик видит activity только если:

1. есть `enrollment` на программу,
2. program / topic / lesson = `published`,
3. урок привязан к теме этой программы через `topic_lesson`.

### Практика (внутри TipTap practice)

Question-ноды:

- `short_text` — авто (нормализованное сравнение)
- `single_choice` / `multiple_choice` — авто
- `file_upload` — ручная проверка

Поля ноды (концепт): `questionId`, prompt, options?, `grading: auto|manual`, `correctAnswer?` (только сервер / админ-редактор; в ученический payload не отдаём).

### Доступ

```
program_invite
  id, token, createdByUserId, inviteeEmail?, inviteeName?, expiresAt?, usedAt?, usedByUserId?

program_invite_program
  inviteId, programId                  -- несколько программ на одну ссылку

enrollment
  id, userId, programId                -- unique(userId, programId)
```

Активация атомарна: погасить token → upsert enrollment на каждую программу инвайта.

### Прогресс и ответы

```
activity_progress
  userId, programId, activityId
  status, videoPositionSec?, videoPercent?, completedAt?

lesson_progress
  userId, programId, lessonId
  status, percent, completedAt?        -- агрегат

submission
  id, userId, programId, activityId
  answers(jsonb), status(pending|graded)
  reviewedBy?, reviewerComment?, reviewedAt?
```

Файлы ответов: объекты в S3, в `answers` / отдельной таблице — `storageKey`, filename, mime, size.

### Роли и capabilities

```
user.role: admin | student

capabilities (примеры):
  program:write
  lesson:write
  invite:create
  submission:review
  analytics:read
  support:reply
  content:read          -- у student через enrollment, не глобально
```

MVP: маппинг role → capabilities константой в коде (или таблица `role_capabilities`). UI и mutators проверяют capability, не `role === 'admin'`.

### Support-чат

```
support_thread
  id, studentUserId (unique), createdAt

support_message
  id, threadId, authorId, body, createdAt
```

Писать/читать: владелец-ученик + пользователи с `support:reply`.

## Контент: TipTap

Один пайплайн редактора; разные наборы нод для theory и practice.

### Theory

- Базовый WYSIWYG (заголовки, списки, изображения → upload в S3)
- Нода `video`: кнопка «Вставить видео» → URL → `{ provider, sourceId, embedUrl, originalUrl }`; view = embed. Прогресс: player API / postMessage где доступно; иначе heartbeat + кнопка «Отметить просмотренным» (VK может ограничивать API)
- Нода `liveReact`: исходник как текст; preview/view через `react-live` + scope `{ React, Mafs, Coordinates, Plot, Theme, ... }`. Код на сервере не исполняется. Только доверенный админский контент; без произвольного network/DOM вне корня в v1

### Practice

- Тот же редактор + question-ноды
- Сабмит → серверная автопроверка для `auto`; `manual`/`file_upload` → `pending` в reviews
- Ревьюер: signed URL файла из S3, верно/неверно, комментарий; ученик видит результат у задания

Хранение: `activity.content` = TipTap JSON (jsonb). Списки уроков отдают метаданные без полного JSON; полный документ — по `activityId`.

## Архитектура runtime

### Zero sync

Синхронизировать:

- каталог с фильтрами по роли / enrollment / published
- enrollment, прогресс (агрегаты), submissions (ученик — свои; админ — очередь)
- invites (админ)
- support threads/messages по authz

Не тащить в list-sync:

- полный TipTap JSON всех activities
- бинарники (только metadata + upload/download API)

### HTTP API (дополнительно к Zero)

- `/api/auth/*` — Better Auth
- `/api/invite/activate` — атомарная активация
- `/api/upload` / `/api/files/:key` — S3 (presign или proxy)
- `/api/query`, `/api/mutate` — Zero со строгим authz (demo-open удалить)

### Object storage

- MinIO (или аналог) в `docker/docker-compose.dev.yml` (+ e2e compose)
- Единый storage-адаптер в серверном коде; buckets для `editor-images` и `submission-files`
- Env в `#/shared/env`: endpoint, keys, bucket names

### Navbar / shell

- Гость: кнопка входа
- Пользователь: аватар; пункт «Админка» если есть любая admin-capability

## Ключевые сценарии

### Активация доступа

1. Админ создаёт invite, выбирает ≥1 программу, опционально email/имя/expiry → URL `/invite/:token`
2. Ученик открывает ссылку → login/register с returnUrl при необходимости
3. Сервер: валидный неиспользованный token → `usedAt`/`usedBy` → enrollment на каждую программу
4. Редирект на `/app` (или единственную программу)
5. Повтор: «ссылка уже использована»; если тот же user уже enrolled — можно мягко пустить в `/app`

### Домашняя ученика

- Инфографика по enrolled программам (% уроков, последняя активность)
- CTA «Продолжить» → последний незавершённый activity
- Список submissions `pending` с контекстом (программа / урок / задание)
- Превью support-чата + переход в тред

### Прохождение

1. Только published + enrolled
2. Theory: completed по политике (кнопка «Изучено» и/или video threshold)
3. Practice: submission; авто сразу, ручные после review
4. Агрегация lesson/program percent для UI и аналитики

### Ручная проверка и аналитика

- `/admin/reviews` — pending → grade + comment
- `/admin/analytics` — ученики × программы → темы → уроки → activities

## Feature slices

| Feature | Назначение |
|---------|------------|
| `landing` | Заглушка |
| `shell` | Navbar, layouts |
| `auth` | Существующий login; редиректы |
| `student-home` | Инфографика, continue, pending, chat preview |
| `programs` | Список/страница программы для ученика |
| `lesson-player` | Просмотр activities, прогресс, сабмиты |
| `lesson-editor` | TipTap admin (video, liveReact, questions) |
| `admin-programs` | CRUD program/topic/topic_lesson/publish |
| `admin-lessons` | Каталог уроков + activities |
| `invites` | Multi-program one-time links |
| `reviews` | Ручная проверка |
| `analytics` | Прогресс учеников |
| `support-chat` | Тред ученик ↔ админы |
| `storage` | S3 helpers (lib) + использование из API |

Удалить: `features/chat`, таблицы chat/message, demo Zero authz/queries/mutators, связанные E2E.

## Риски и митигации

| Риск | Митигация |
|------|-----------|
| VK Video progress | Best-effort + «отметить просмотренным» |
| react-live XSS / размер | Whitelist scope; админ-only authoring; lazy load Mafs |
| Тяжёлый контент в Zero | Content fetch by activity id |
| Хрупкая автопроверка текста | Единый normalizer на сервере |
| Утечка correctAnswer | Sanitized document для student queries |

## Порядок внедрения (MVP)

Подробные задачи: `docs/plans/2026-07-24-exam-platform-implementation.md`.

1. Удалить демо-чат; лендинг-заглушка; `role` + capabilities; shell (Войти / аватар)
2. UI kit + галерея `/dev` (shadcn primitives + LMS-композиты) — до продуктовых экранов
3. MinIO в compose + upload API
4. Схема catalog + admin CRUD + publish
5. TipTap theory: video + liveReact/Mafs; lesson-player
6. Practice + submissions + reviews
7. Invites (multi-program) + enrollment + student home + progress
8. Support-chat + analytics + E2E

## Вне скоупа v1 (намеренно)

- Отдельная роль `teacher` (модель прав уже готова к добавлению)
- Балльная шкала вместо верно/неверно
- Публичный маркетплейс программ / самозапись без инвайта
- Исполнение произвольного ученического кода
- Полноценный лендинг/маркетинг
- Мобильные нативные приложения

## Следующий шаг

После утверждения этого документа — implementation plan (`docs/plans/2026-07-24-exam-platform-implementation.md`) и работа в git worktree / по задачам плана.
`}