# Admin nav + programs tree — Design

**Date:** 2026-07-28  
**Status:** Approved  
**Branch:** `feature/admin-nav-programs`

## Problem

Admin UX is a hub of link cards plus breadcrumbs. Primary actions (programs, review) are not always one tap away. Program structure is nested lists; lesson create starts as a title modal. We want a persistent admin chrome and a desktop file-tree for program → topic → lesson, with clearer lesson create/link flow.

## Goals

1. Desktop: left sidebar; mobile: bottom tabs.
2. Primary nav: **Программы** | **Проверка** | **Ещё**.
3. Desktop programs: Magic UI–style file tree + split detail pane.
4. Mobile programs: drill-down (programs → program → topics/lessons → lesson page).
5. “+ урок”: modal — create new **or** pick existing; new lesson opens a **page**.
6. Lessons store optional **home** `programId` / `topicId` for search; `topic_lesson` multi-link stays.

## Non-goals

- Redesign reviews / analytics / support UI.
- Move TipTap activity editing off dialogs onto routes.
- npm `magicui` dependency.
- Primary-nav lessons catalog.

## Approach

**AdminShell** (`features/admin-shell`), patterned on `StudentShell`:

- Wrap `/admin` layout (auth + Zero unchanged).
- Hide `AppHeader` on `/admin/*` (same as `/app`).
- `/admin` redirects to `/admin/programs`.
- “Ещё”: popover (desktop) / sheet (mobile) — analytics (if `analytics:read`), support, invites. Lessons catalog not in primary nav; search lives in add-lesson modal.

**Programs desktop:** left file-tree, right detail for selected program / topic / lesson. Selection via search params (`topic`, `lesson`) under `/admin/programs/$programId` (and list at `/admin/programs`).

**Programs mobile:** existing nested pages / list drill-down; lesson opens `/admin/lessons/$lessonId`.

**Lesson home fields:** nullable `home_program_id`, `home_topic_id` on `lesson`; backfill from first `topic_lesson`; create mutator accepts optional home + auto-link into topic.

**Add lesson modal:** “Создать новый” → `/admin/lessons/new?programId=&topicId=`; “Выбрать существующий” → filtered search → `linkLessonToTopic`.

## Data

| Change | Detail |
|--------|--------|
| `lesson.home_program_id` | nullable FK → program, `ON DELETE SET NULL` |
| `lesson.home_topic_id` | nullable FK → topic, `ON DELETE SET NULL` |
| `topic_lesson` | unchanged |
| Zero | regenerate schema; extend `createLesson`; search query by home filters |

## UX details

### Shell

- Sidebar: brand “Админка”, three items, account/theme/logout like student shell.
- Bottom tabs: same three; “Ещё” opens sheet.
- Active state from pathname (`/admin/programs*`, `/admin/reviews*`, else secondary).

### Tree

- Expand/collapse programs and topics.
- Icons for folder/file style nodes.
- Click selects; selection drives right pane.
- Topic actions: add lesson (modal), rename/publish as today.
- Program actions: meta, add topic, publish.

### Create lesson page

- Route: `/admin/lessons/new`.
- Form: title (required); creates lesson + home ids + topic link; redirects to program split (desktop) or lesson detail (mobile).

## Testing

- E2E: admin shell visible; create via modal → new page → lesson in tree; link existing; reviews reachable from tab; `/admin` → programs.
- `bun run check` / typecheck after schema change.

## Risks

- Deep-link/search-param selection must stay bookmarkable.
- Don’t mix with in-progress landing work on dirty `main` — implement on this branch/worktree only.
