# Design: Program topic & lesson locks

## Goal

Преподаватель в настройках программы выбирает, как открываются темы и уроки (независимо), с одним порогом прогресса на программу. Студент видит заблокированные элементы в outline, но не может их открыть, пока blockers не наберут порог.

## Modes

На `program`:

- `topicLockMode`: `open` | `sequential` | `graph` (default `open`)
- `lessonLockMode`: `open` | `sequential` | `graph` (default `open`)
- `unlockThresholdPercent`: `1…100` (default `80`) — один порог на всю программу

| Mode | Semantics |
|------|-----------|
| `open` | всё доступно; graph-рёбра игнорируются |
| `sequential` | узел N требует прогресс ≥ порога у N−1 по `position` |
| `graph` | узел доступен, если **все** входящие blockers ≥ порога; без входящих рёбер — свободен |

Темы: порядок sequential по `topic.position`.  
Уроки: только **внутри темы** по `topic_lesson.position` / graph рёбрам этой темы. Кросс-темы для уроков нет.

## Data

Новые таблицы (только для custom graph):

- `topic_lock_edge` — `(programId, blockerTopicId, topicId)`
- `lesson_lock_edge` — `(programId, topicId, blockerLessonId, lessonId)`

Смена режима **не** удаляет рёбра. Циклы и self-loop запрещены на мутаторе.

### Progress

- Урок: существующий `lesson_progress.percent`
- Тема: среднее `percent` по **опубликованным** урокам темы; draft не считаем; тема без published уроков = `0%`

## Teacher UI

В `admin-programs` workspace — секция «Доступ к занятиям»: два селекта режимов + инпут/слайдер порога.

- Graph тем → editor зависимостей тем (ноды = темы программы)
- Graph уроков → editor **в контексте темы** (ноды = уроки темы)
- Библиотека: `@xyflow/react` (React Flow)
- Save → replace-набор рёбер для program/topic

## Student UX & enforcement

- Outline: заблокированные видны (замок, disabled «Открыть», подсказка с порогом и blockers)
- Доступ к уроку = тема разблокирована **AND** урок разблокирован
- Прямой URL на locked урок → экран «Занятие закрыто», не плеер
- Isomorphic helper: `isTopicUnlocked` / `isLessonUnlocked` (+ список blockers) — один для UI и gate
- Progress mutators отказывают запись по заблокированному уроку
- Админ/преподаватель блокировки не применяют

## Zero / API

- Поля lock на `program` + edge-таблицы; `bun run zero:generate`
- Рёбра в outline queries (admin + published student)
- Mutators: `updateProgramLockSettings`, `setTopicLockEdges`, `setLessonLockEdges` (authz как edit program)
- Feature slice: `features/program-locks/` (lib unlock + graph UI); student/admin только потребляют

## Testing

- Unit: unlock helper — open / sequential / graph, AND, порог, ignore draft
- E2E (позже): sequential — второй урок locked, пока первый < порога

## Out of scope

- Кросс-темы lesson edges
- Порог на ребро / разные пороги для тем и уроков
- Скрытие locked из outline
- Авто-удаление рёбер при смене режима
