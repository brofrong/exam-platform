# Exam Platform Implementation Plan

> **Status:** MVP implemented on `feat/exam-platform-lms` (tasks 1–29). Out-of-scope items below remain deferred.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the demo chat with a full EGE/OGE LMS (admin CMS, reusable lessons, TipTap theory/practice, invites, progress, support chat, analytics) and ship a `/dev` UI gallery like shadcn.

**Architecture:** Vertical feature slices under `src/features/*`; thin TanStack Start routes; Drizzle + Zero for synced domain data; TipTap JSON in `activity.content`; S3/MinIO for binaries; capabilities on roles for authz. UI primitives live in `src/components/ui` (shadcn) + app composites in `src/components` / feature `ui/`, all browsable at `/dev`.

**Tech Stack:** TanStack Start, Drizzle, Rocicorp Zero, Better Auth, TipTap, react-live, Mafs, MinIO (S3), Tailwind v4, shadcn/ui, Bun, Playwright.

**Design doc:** `docs/plans/2026-07-24-exam-platform-design.md`

---

## Execution notes

- Prefer TDD where logic is pure (capabilities, invite activation, answer grading, TipTap sanitize).
- UI gallery tasks come **early** so product screens reuse reviewed components.
- After each task: `bun run check` (and `bun run typecheck` when touching types/schema).
- Do **not** commit secrets; keep `.env.example` / `.env.e2e.example` in sync.
- Demo chat removal is Task 1 — do not build LMS on top of chat tables.

---

## Phase 0 — Cleanup & foundation

### Task 1: Remove demo chat end-to-end

**Files:**
- Delete: `src/features/chat/**`
- Delete: `src/server/db/chat/**`, `src/server/db/message/**`
- Modify: `src/server/db/schema.ts`, `src/server/db/relations.ts`
- Modify: `src/server/zero/queries.ts`, `src/server/zero/mutators.ts`, `src/server/zero/authz.demo.ts` (replace or delete)
- Modify: `src/routes/_authenticated/index.tsx` (temporary placeholder home)
- Modify: `e2e/**` chat specs → remove or skip
- Modify: `README.md` (drop chat demo claims)

**Steps:**
1. Remove chat feature imports from routes/layouts.
2. Drop chat/message from Drizzle schema + relations; `bun run db:generate` + migrate.
3. Strip Zero chat queries/mutators; keep registries compiling with empty/domain stubs if needed.
4. Update E2E so CI is green (login-only smoke ok).
5. `bun run check && bun run typecheck`
6. Commit: `chore: remove demo chat feature and schema`

---

### Task 2: Landing stub + route map scaffolding

**Files:**
- Create: `src/features/landing/ui/landing-stub.tsx`, `src/features/landing/index.ts`
- Modify: `src/routes/index.tsx` (create if missing; public `/`)
- Create stub route files (empty shells ok):  
  `src/routes/app.tsx`, `src/routes/app/index.tsx`,  
  `src/routes/admin.tsx`, `src/routes/admin/index.tsx`,  
  `src/routes/dev.tsx`, `src/routes/dev/index.tsx`
- Modify: `src/routes/__root.tsx` / `Header` as needed so `/` is public

**Steps:**
1. Public `/` renders landing stub (“Exam Platform — скоро”).
2. `/app` and `/admin` redirect unauthenticated users to `/login`.
3. Commit: `feat: add landing stub and app/admin/dev route shells`

---

### Task 3: Roles + capabilities module

**Files:**
- Create: `src/server/db/user/` — add `role` column (`admin` | `student`, default `student`)
- Create: `src/shared/authz/capabilities.ts` — capability union + `ROLE_CAPABILITIES` map + `can(role, capability)`
- Create: `src/shared/authz/index.ts`
- Test: `src/shared/authz/capabilities.test.ts` (bun:test) **or** colocate under `src/shared/authz/` with bun test script if absent — add `"test": "bun test"` to `package.json` if needed
- Modify: Better Auth user mapping / session payload to expose `role`
- Modify: migration via `bun run db:generate` + `bun run db:migrate`

**Steps:**
1. Write failing tests: `admin` has `program:write`, `student` does not; unknown capability false.
2. Implement `can` + map (include: `program:write`, `lesson:write`, `invite:create`, `submission:review`, `analytics:read`, `support:reply`).
3. Add `role` to user table; document how to promote admin (SQL / seed note in README).
4. Commit: `feat: add user roles and capability checks`

---

### Task 4: App shell — navbar Login vs Avatar

**Files:**
- Modify: `src/components/Header.tsx` → prefer `src/features/shell/ui/app-header.tsx`
- Create: `src/features/shell/ui/user-menu.tsx`, `src/features/shell/index.ts`
- Use existing `Avatar`, `Button`; add shadcn `dropdown-menu` if missing

**Steps:**
1. `bunx shadcn@latest add dropdown-menu`
2. Guest: Login button → `/login` (`data-testid="nav-login"`).
3. Authed: avatar menu — home, admin link if `can(role,'program:write')` (or any admin cap), logout.
4. Wire into `__root` / layouts.
5. Commit: `feat: shell header with login and user avatar menu`

---

## Phase 1 — UI kit & `/dev` gallery (priority)

Goal: install/build all primitives and composites needed by LMS screens, present them on a shadcn-like gallery at `/dev`.

### Task 5: Install shadcn primitives batch

**Files:** `src/components/ui/*` via shadcn CLI

**Add (at minimum):**
`card`, `badge`, `tabs`, `dialog`, `alert-dialog`, `dropdown-menu` (if not done), `select`, `checkbox`, `radio-group`, `label`, `progress`, `table`, `sheet`, `tooltip`, `popover`, `alert`, `breadcrumb`, `skeleton`, `switch`, `sonner`, `collapsible`, `accordion`, `scroll-area` (exists), `separator` (exists)

**Steps:**
1. Run `bunx shadcn@latest add <names>` (batch).
2. Fix any import/CSS issues; `bun run check`.
3. Commit: `chore: add shadcn ui primitives for lms`

---

### Task 6: `/dev` gallery shell (shadcn-style site)

**Files:**
- Create: `src/features/dev-gallery/index.ts`
- Create: `src/features/dev-gallery/lib/registry.ts` — list of `{ slug, title, description, category, component }`
- Create: `src/features/dev-gallery/ui/dev-gallery-layout.tsx` — left nav by category, right preview + optional code note
- Create: `src/features/dev-gallery/ui/component-page.tsx`
- Create: `src/routes/dev/index.tsx`, `src/routes/dev/$slug.tsx`
- Gate: only `admin` **or** `import.meta.env.DEV` (document choice: prefer **DEV or admin** so prod admins can QA)

**Categories (initial):** Foundations, Forms, Feedback, Navigation, Data display, LMS composites, Editor (placeholders ok)

**Steps:**
1. `/dev` index lists categories/cards.
2. `/dev/$slug` shows live preview.
3. Empty states when slug unknown.
4. Commit: `feat: add /dev component gallery shell`

---

### Task 7: LMS composite components + gallery entries

**Files (create under `src/components/` or `src/features/dev-gallery/ui/composites/` — prefer reusable `src/components/` for product use):**

| Component | Used by |
|-----------|---------|
| `page-header.tsx` | admin/student pages |
| `empty-state.tsx` | lists |
| `stat-card.tsx` | student home infographics |
| `progress-stat.tsx` | program/lesson progress |
| `status-badge.tsx` | draft/published, pending/graded |
| `program-card.tsx` | student program list |
| `continue-learning-card.tsx` | student home CTA |
| `pending-review-list.tsx` | student home + admin reviews teaser |
| `file-dropzone.tsx` | practice file upload |
| `publish-toggle.tsx` | admin CMS |
| `entity-row.tsx` | admin sortable lists |
| `support-message-bubble.tsx` | support chat |
| `video-embed-frame.tsx` | theory player (iframe wrapper) |
| `confirm-action-dialog.tsx` | destructive admin actions |

**Steps:**
1. Implement each composite with `data-testid` where interactive.
2. Register each in `dev-gallery/lib/registry.ts` with usage notes.
3. Visual pass on `/dev` (light/dark if theme exists).
4. Commit: `feat: add lms composite components to /dev gallery`

---

### Task 8: Form patterns on `/dev`

**Files:**
- Gallery demos: login-like form, invite create form (multi select programs), practice answer widgets (short text, single/multi choice, file)
- Create: `src/components/answer-widgets/*` presentational only (no server yet)

**Steps:**
1. Build presentational answer widgets.
2. Add gallery pages demonstrating validation/error/disabled states.
3. Commit: `feat: add form and answer widget demos to /dev`

---

## Phase 2 — Infra: MinIO + storage API

### Task 9: MinIO in docker compose

**Files:**
- Modify: `docker/docker-compose.dev.yml`, `docker/docker-compose.e2e.yml`
- Modify: `.env.example`, `.env.e2e.example`, `src/shared/env.ts`
- Create: `src/server/storage/s3.ts`, `src/server/storage/index.ts`

**Steps:**
1. Add MinIO service + console port; create buckets via init script or documented `mc` commands.
2. Env: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_UPLOADS`, `S3_REGION`.
3. Implement `putObject`, `getSignedGetUrl`, `deleteObject`.
4. Smoke via bun script or unit test with MinIO up.
5. Commit: `feat: add minio object storage to docker stack`

---

### Task 10: Upload API routes

**Files:**
- Create: `src/routes/api/upload.ts`
- Create: `src/routes/api/files/$key.ts` (or presign-only design — prefer upload via server + signed download)
- Auth: session required; for submissions later check enrollment; for editor images check `lesson:write`

**Steps:**
1. POST multipart → S3 key `editor/{userId}/…` or `submissions/{userId}/…`.
2. GET signed URL for authorized users.
3. Commit: `feat: add authenticated file upload and download api`

---

## Phase 3 — Catalog domain + admin CMS

### Task 11: Drizzle schema for catalog

**Files:**
- Create: `src/server/db/program/program.schema.ts`
- Create: `src/server/db/topic/topic.schema.ts`
- Create: `src/server/db/lesson/lesson.schema.ts`
- Create: `src/server/db/topic-lesson/topic-lesson.schema.ts`
- Create: `src/server/db/activity/activity.schema.ts`
- Modify: `schema.ts`, `relations.ts`
- Run: `bun run db:generate`, `bun run db:migrate`, `bun run zero:generate`

**Fields:** as in design doc (`status`, `position`, `content` jsonb for activity, etc.).

**Steps:**
1. Add tables + relations.
2. Generate Zero schema.
3. Commit: `feat: add program topic lesson activity schema`

---

### Task 12: Zero queries/mutators for catalog (admin)

**Files:**
- Modify: `src/server/zero/queries.ts`, `mutators.ts`
- Create: `src/server/zero/authz.ts` (real checks; delete demo-open patterns)
- Capabilities: `program:write`, `lesson:write`

**Steps:**
1. Mutators: create/update/reorder/publish program, topic, lesson, activity, topic_lesson link.
2. Queries: admin lists all; no student filters yet (next tasks).
3. Commit: `feat: zero catalog mutators with capability authz`

---

### Task 13: Admin programs UI

**Files:**
- Create: `src/features/admin-programs/**`
- Routes: `src/routes/admin/programs/index.tsx`, `$programId.tsx`
- Guard layout `src/routes/admin.tsx` with `can(program:write)`

**Steps:**
1. List/create/edit programs; topics CRUD + order; attach existing lessons via `topic_lesson`.
2. Publish toggles using `PublishToggle` / `StatusBadge`.
3. E2E smoke: admin creates program (seed admin user in e2e).
4. Commit: `feat: admin programs and topics cms`

---

### Task 14: Admin lessons catalog + activity shells

**Files:**
- Create: `src/features/admin-lessons/**`
- Routes: `src/routes/admin/lessons/index.tsx`, `$lessonId.tsx`

**Steps:**
1. Lesson CRUD + list activities (theory/practice) reorder.
2. Activity editor placeholder textarea JSON for now (TipTap in Phase 4).
3. Commit: `feat: admin lessons and activities cms shell`

---

## Phase 4 — TipTap theory editor & player

### Task 15: TipTap base editor package wiring

**Files:**
- Deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`, etc.
- Create: `src/features/lesson-editor/lib/editor-schema.ts`
- Create: `src/features/lesson-editor/ui/theory-editor.tsx`
- Create: `src/features/lesson-editor/ui/theory-renderer.tsx`
- Gallery: `/dev/theory-editor` entry

**Steps:**
1. Basic document round-trip save to `activity.content`.
2. Show on `/dev`.
3. Commit: `feat: add tiptap theory editor foundation`

---

### Task 16: Video node

**Files:**
- Create: `src/features/lesson-editor/lib/nodes/video.ts`
- Create: `src/features/lesson-editor/lib/parse-video-url.ts` (+ tests for VK URLs)
- Create: insert button + dialog (reuse shadcn Dialog)
- Use: `VideoEmbedFrame` in renderer

**Steps:**
1. Tests for URL parse → provider/embedUrl.
2. Editor insert UX; renderer iframe.
3. Commit: `feat: tiptap video block for theory`

---

### Task 17: liveReact + Mafs node

**Files:**
- Deps: `react-live`, `mafs` (+ CSS import)
- Create: `src/features/lesson-editor/lib/nodes/live-react.ts`
- Create: `src/features/lesson-editor/ui/live-react-block.tsx` (scope whitelist)
- Gallery demo with sine plot sample from design doc

**Steps:**
1. Editor preview + student renderer share component.
2. Document allowed scope in code comment / `/dev` notes.
3. Commit: `feat: tiptap live-react and mafs block`

---

### Task 18: Lesson player (theory read + progress stub)

**Files:**
- Create: `src/features/lesson-player/**`
- Routes under `src/routes/app/programs/$programId/lessons/$lessonId.tsx`
- Schema later for progress — for now local UI “Изучено” calling mutator stub

**Steps:**
1. Render published theory activities in order.
2. Wire video embed; mark complete button.
3. Commit: `feat: student theory lesson player`

---

## Phase 5 — Practice, submissions, reviews

### Task 19: Practice TipTap + question nodes

**Files:**
- Extend lesson-editor with `practice-editor.tsx`
- Nodes: `shortTextQuestion`, `singleChoiceQuestion`, `multipleChoiceQuestion`, `fileUploadQuestion`
- Create: `src/features/lesson-editor/lib/sanitize-practice-doc.ts` (+ tests — strips `correctAnswer` for students)

**Steps:**
1. Admin can author questions with grading mode.
2. Sanitizer unit tests.
3. Commit: `feat: practice editor with answer question nodes`

---

### Task 20: Submissions schema + grading

**Files:**
- Create: `src/server/db/submission/submission.schema.ts`
- Create: `src/server/db/activity-progress/…`, `lesson-progress/…`
- Create: `src/server/grading/normalize-answer.ts`, `grade-submission.ts` (+ tests)
- Zero mutators: submit, review

**Steps:**
1. Auto grade short/choice; manual/file → `pending`.
2. Review mutator requires `submission:review`; sets correct/incorrect + comment.
3. Commit: `feat: submissions grading and review mutators`

---

### Task 21: Student practice UI + admin reviews UI

**Files:**
- `src/features/lesson-player/ui/practice-activity.tsx`
- `src/features/reviews/**`
- Routes: `src/routes/admin/reviews/index.tsx`

**Steps:**
1. Student answers + file dropzone → upload API → submit.
2. Admin queue grades with comment; student sees result.
3. Commit: `feat: practice play and admin review queue`

---

## Phase 6 — Invites, enrollment, student home

### Task 22: Invite + enrollment schema & activate API

**Files:**
- Create: `src/server/db/program-invite/**`, `enrollment/**`
- Create: `src/routes/api/invite/activate.ts`
- Create: `src/features/invites/**` admin UI
- Create: `src/routes/invite/$token.tsx`
- Tests: activate multi-program, reject reused token

**Steps:**
1. Admin creates one-time token linked to N programs.
2. Activate atomic; create enrollments.
3. Commit: `feat: multi-program one-time invites`

---

### Task 23: Student-visible catalog queries

**Files:**
- Zero queries filtered by enrollment + published flags
- Mutators forbidden for students on catalog writes

**Steps:**
1. Student cannot see draft or non-enrolled programs.
2. Commit: `feat: enforce enrollment and publish visibility`

---

### Task 24: Student home + program pages

**Files:**
- Create: `src/features/student-home/**`
- Create: `src/features/programs/**`
- Routes: `src/routes/app/index.tsx`, `src/routes/app/programs/$programId.tsx`

**Steps:**
1. Home: stat cards, continue CTA, pending reviews list, support preview placeholder.
2. Program page: topics/lessons + progress.
3. Commit: `feat: student home and program progress pages`

---

### Task 25: Progress tracking (hybrid)

**Files:**
- activity_progress / lesson_progress writers from player
- Aggregations for home + analytics
- Video position best-effort + “отметить просмотренным”

**Steps:**
1. Persist video position when available.
2. Recompute lesson percent from activities.
3. Commit: `feat: activity and lesson progress tracking`

---

## Phase 7 — Support chat & analytics

### Task 26: Support thread (one per student)

**Files:**
- Create: `src/server/db/support-thread/**`, `support-message/**`
- Create: `src/features/support-chat/**`
- Routes: `src/routes/app/support.tsx`, `src/routes/admin/support/index.tsx`, `$threadId.tsx`
- Zero authz: student owns thread; admins with `support:reply`

**Steps:**
1. Auto-create thread on first message.
2. Realtime messages via Zero.
3. Preview on student home.
4. Commit: `feat: student-admin support chat`

---

### Task 27: Admin analytics page

**Files:**
- Create: `src/features/analytics/**`
- Route: `src/routes/admin/analytics/index.tsx`
- Capability: `analytics:read`

**Steps:**
1. Table students × programs with %; drill-down topic → lesson → activity.
2. Reuse `ProgressStat`, `StatusBadge`, `Table`.
3. Commit: `feat: admin student progress analytics`

---

## Phase 8 — Hardening

### Task 28: E2E critical paths

**Files:** `e2e/**`

**Flows:**
1. Admin login → create program/topic/lesson/theory → publish
2. Create invite → student activates → sees program
3. Student completes practice auto-question
4. Manual file submission → admin review
5. Support message round-trip

**Steps:**
1. Seed admin in e2e prepare.
2. Unique emails/titles per run.
3. Commit: `test: e2e critical lms flows`

---

### Task 29: Docs & README pass ✅

**Files:** `README.md`, `.env.example`, design/implementation cross-links

**Steps:**
1. Document MinIO, promoting admin, `/dev` gallery, authz model.
2. Commit: `docs: update readme for lms mvp`

**Done:** README covers LMS product, invites, capabilities, MinIO, `/dev`, e2e; plans committed under `docs/plans/`.

---

## Suggested commit cadence

One commit per task above (already specified). Do not batch unrelated phases.

## Out of scope (do not implement in this plan)

- Marketing landing
- Teacher role (capabilities ready)
- Points-based grading
- Student-authored code
- Native apps

---

## Handoff

Plan saved to `docs/plans/2026-07-24-exam-platform-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** — fresh subagent per task, review between tasks  
2. **Parallel Session (separate)** — new session with `executing-plans` in a worktree  

**Which approach?**
