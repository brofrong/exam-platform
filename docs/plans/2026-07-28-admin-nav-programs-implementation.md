# Admin nav + programs tree Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Give admins a StudentShell-style chrome (sidebar / bottom tabs), a desktop program file-tree with split detail, and a create-or-link lesson flow with home program/topic on lessons.

**Architecture:** New `features/admin-shell` wraps `/admin`. Programs desktop becomes tree + detail pane; mobile keeps drill-down. Lesson schema gains home FKs; `AddLessonDialog` + `/admin/lessons/new` replace title-only create modal from the catalog path for topic-scoped creation.

**Tech Stack:** TanStack Start/Router, Zero mutators/queries, Drizzle migration, Tailwind, existing Dialog/Sheet/Popover, custom file-tree (no magicui npm).

---

### Task 1: Lesson home columns + migration + Zero

**Files:**
- Modify: `src/server/db/lesson/lesson.schema.ts`
- Create: drizzle migration (via `bun run db:generate` or project’s migrate workflow)
- Modify: `src/server/zero/schema.ts` (or regenerate via `bun run zero:generate`)
- Modify: `src/server/db/relations.ts` if needed
- Modify: `src/server/zero/mutators.ts` — `createLesson`
- Modify: `src/server/zero/queries.ts` — lesson search with optional home filters

**Steps:**
1. Add nullable `homeProgramId` / `homeTopicId` (`home_program_id` / `home_topic_id`) to `lessonsTable` with FKs `ON DELETE SET NULL`.
2. Generate migration; include SQL backfill: set home from first `topic_lesson` join topic → program where null.
3. Regenerate/update Zero schema + relationships.
4. Extend `createLesson` args: optional `homeProgramId`, `homeTopicId`, and optional `linkTopicId` + `position` — if `linkTopicId` set, insert `topic_lesson` in same mutator.
5. Add or extend query `lessons` / `searchLessons` accepting optional `homeProgramId` / `homeTopicId` (and title search if easy).
6. `bun run check` / typecheck on touched files.
7. Commit: `feat(admin): add lesson home program/topic fields`

---

### Task 2: AdminShell + hide header + redirect hub

**Files:**
- Create: `src/features/admin-shell/ui/admin-shell.tsx`
- Create: `src/features/admin-shell/ui/admin-more-menu.tsx`
- Create: `src/features/admin-shell/index.ts`
- Modify: `src/routes/admin.tsx` — wrap Outlet in AdminShell
- Modify: `src/routes/admin/index.tsx` — redirect to `/admin/programs`
- Modify: `src/features/shell/ui/app-chrome.tsx` — hide header on `/admin`

**Steps:**
1. Mirror `StudentShell`: desktop sidebar (`data-testid="admin-sidebar"`), mobile bottom nav (`data-testid="admin-bottom-nav"`).
2. Nav: Programs → `/admin/programs`, Reviews → `/admin/reviews`, More → popover/sheet with analytics (if `can(role,"analytics:read")`), support, invites.
3. Account controls: theme + logout (reuse patterns from student shell).
4. Wire into `admin.tsx`; redirect index; hide AppHeader for admin paths.
5. Smoke: routes still render; `data-testid`s present.
6. Commit: `feat(admin): add AdminShell sidebar and bottom nav`

---

### Task 3: File-tree UI primitive

**Files:**
- Create: `src/components/ui/file-tree.tsx` (Magic UI–inspired API: Tree, Folder, File, collapse/expand)
- Optional demo entry in dev-gallery if cheap

**Steps:**
1. Implement accessible tree with expand state, selection callback, indentation, folder/file icons (lucide).
2. Keep API small: controlled/uncontrolled expanded ids + `selectedId` + `onSelect`.
3. Commit: `feat(ui): add file-tree component`

---

### Task 4: Desktop programs split + tree

**Files:**
- Modify: `src/features/admin-programs/ui/programs-list-page.tsx` (or new `programs-workspace.tsx`)
- Modify: `src/features/admin-programs/ui/program-detail-page.tsx`
- Modify: `src/features/admin-programs/ui/topic-editor.tsx` (slim / reuse actions)
- Modify: routes under `src/routes/admin/programs/`
- Create: `src/features/admin-programs/ui/programs-file-tree.tsx`
- Create: `src/features/admin-programs/ui/program-detail-pane.tsx` (program/topic/lesson panes)

**Steps:**
1. Desktop (`md+`): left tree of all programs → topics → lessons from Zero queries; right pane by selection.
2. URL: `/admin/programs/$programId` with search `topic`, `lesson` for deep link; list route can show empty pane or first program hint.
3. Mobile: keep drill-down list → program page → lesson link to `/admin/lessons/$id` (no split).
4. Wire publish/rename/add-topic actions into pane; remove dependency on hub-only UX.
5. Commit: `feat(admin): programs desktop file-tree split view`

---

### Task 5: AddLessonDialog + lesson new page

**Files:**
- Create: `src/features/admin-lessons/ui/add-lesson-dialog.tsx`
- Create: `src/features/admin-lessons/ui/lesson-create-page.tsx`
- Create: `src/routes/admin/lessons/new.tsx`
- Modify: topic “add lesson” entry points to open dialog
- Modify: `src/features/admin-lessons/index.ts` exports
- Optionally demote/remove primary use of `LessonFormDialog` for topic flow

**Steps:**
1. Dialog: two choices — create new (navigate to `/admin/lessons/new?programId&topicId`) or pick existing (query + link mutator).
2. Create page: title form → `createLesson` with home + link → redirect desktop to program with lesson selected, mobile to `$lessonId`.
3. Commit: `feat(admin): add-or-link lesson dialog and create page`

---

### Task 6: E2E + cleanup

**Files:**
- Modify: `e2e/lms-critical-paths.spec.ts` and/or admin e2e helpers
- Remove obsolete admin hub card assumptions; keep breadcrumbs only where still useful

**Steps:**
1. Update tests for shell testids, create flow, reviews tab.
2. Run `bun run check` and relevant e2e if env available.
3. Commit: `test(admin): cover admin shell and lesson create flow`

---

## Execution notes

- Work only in `.worktrees/admin-nav-programs` on `feature/admin-nav-programs`.
- Prefer matching StudentShell tokens (`sidebar-*`).
- Do not pull landing-variant dirty files from the other working tree.
- YAGNI: no full lessons catalog in “Ещё” unless needed for e2e; search-in-modal is enough.
