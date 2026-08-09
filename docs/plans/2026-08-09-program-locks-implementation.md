# Program Topic & Lesson Locks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Prefer superpowers:subagent-driven-development when executing in this session.

**Goal:** Преподаватель настраивает режимы блокировки тем и уроков (open / sequential / graph) и общий порог прогресса; студент видит locked-элементы, но не может их открыть/прокачать, пока blockers не наберут порог.

**Architecture:** Поля lock на `program` + таблицы рёбер для graph. Чистый isomorphic unlock helper в `features/program-locks/lib`. Admin UI в workspace/detail программы + React Flow editors. Student outline и lesson player читают тот же helper. Progress mutators проверяют unlock на сервере.

**Tech Stack:** Drizzle, Rocicorp Zero, TanStack Start, Bun test, `@xyflow/react`, shadcn, Biome

**Design:** `docs/plans/2026-08-09-program-locks-design.md`

**Worktree:** `.worktrees/program-locks` on branch `feature/program-locks`

---

### Task 1: Unlock helper (TDD)

**Files:**
- Create: `src/features/program-locks/lib/unlock.ts`
- Create: `src/features/program-locks/lib/unlock.test.ts`
- Create: `src/features/program-locks/index.ts` (re-export public API later; for now helper only)

**Step 1: Write failing tests**

```typescript
import { describe, expect, test } from "bun:test";
import {
	type LockMode,
	computeTopicProgressPercent,
	isLessonUnlocked,
	isTopicUnlocked,
} from "./unlock";

const threshold = 80;

describe("computeTopicProgressPercent", () => {
	test("averages published lesson percents only", () => {
		expect(
			computeTopicProgressPercent([
				{ status: "published", percent: 100 },
				{ status: "draft", percent: 0 },
				{ status: "published", percent: 60 },
			]),
		).toBe(80);
	});

	test("empty published → 0", () => {
		expect(computeTopicProgressPercent([{ status: "draft", percent: 50 }])).toBe(
			0,
		);
	});
});

describe("isTopicUnlocked", () => {
	const topics = [
		{ id: "t1", position: 0, title: "A" },
		{ id: "t2", position: 1, title: "B" },
		{ id: "t3", position: 2, title: "C" },
	];

	test("open → always unlocked", () => {
		const r = isTopicUnlocked({
			mode: "open",
			threshold,
			topicId: "t3",
			topics,
			topicProgressById: { t1: 0, t2: 0, t3: 0 },
			edges: [{ blockerTopicId: "t1", topicId: "t3" }],
		});
		expect(r.unlocked).toBe(true);
		expect(r.blockers).toEqual([]);
	});

	test("sequential → needs previous ≥ threshold", () => {
		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: { t1: 79, t2: 0 },
				edges: [],
			}).unlocked,
		).toBe(false);

		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: { t1: 80, t2: 0 },
				edges: [],
			}).unlocked,
		).toBe(true);
	});

	test("sequential first topic unlocked", () => {
		expect(
			isTopicUnlocked({
				mode: "sequential",
				threshold,
				topicId: "t1",
				topics,
				topicProgressById: {},
				edges: [],
			}).unlocked,
		).toBe(true);
	});

	test("graph AND all blockers; no edges → free", () => {
		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t3",
				topics,
				topicProgressById: { t1: 100, t2: 50 },
				edges: [
					{ blockerTopicId: "t1", topicId: "t3" },
					{ blockerTopicId: "t2", topicId: "t3" },
				],
			}).unlocked,
		).toBe(false);

		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t3",
				topics,
				topicProgressById: { t1: 100, t2: 80 },
				edges: [
					{ blockerTopicId: "t1", topicId: "t3" },
					{ blockerTopicId: "t2", topicId: "t3" },
				],
			}).unlocked,
		).toBe(true);

		expect(
			isTopicUnlocked({
				mode: "graph",
				threshold,
				topicId: "t2",
				topics,
				topicProgressById: {},
				edges: [],
			}).unlocked,
		).toBe(true);
	});
});

describe("isLessonUnlocked", () => {
	const lessons = [
		{ id: "l1", position: 0, title: "L1" },
		{ id: "l2", position: 1, title: "L2" },
	];

	test("open / sequential / graph mirror topic rules within topic", () => {
		expect(
			isLessonUnlocked({
				mode: "sequential",
				threshold,
				lessonId: "l2",
				lessons,
				lessonProgressById: { l1: 79 },
				edges: [],
			}).unlocked,
		).toBe(false);

		expect(
			isLessonUnlocked({
				mode: "graph",
				threshold,
				lessonId: "l2",
				lessons,
				lessonProgressById: { l1: 80 },
				edges: [{ blockerLessonId: "l1", lessonId: "l2" }],
			}).unlocked,
		).toBe(true);
	});
});

describe("combined lesson access", () => {
	test("lesson requires topic unlocked AND lesson unlocked — document via helper compose", () => {
		// Implement `isLessonAccessible` that ANDs topic + lesson results
		const { isLessonAccessible } = require("./unlock") as typeof import("./unlock");
		const r = isLessonAccessible({
			topicUnlocked: false,
			lessonUnlocked: true,
			topicBlockers: [{ id: "t1", title: "A", percent: 10 }],
			lessonBlockers: [],
		});
		expect(r.unlocked).toBe(false);
		expect(r.topicBlockers).toHaveLength(1);
	});
});
```

Adjust imports so `isLessonAccessible` is a named export (no require).

**Step 2:** `bun test src/features/program-locks/lib/unlock.test.ts` — FAIL

**Step 3: Implement** `unlock.ts` with:

```typescript
export type LockMode = "open" | "sequential" | "graph";

export type UnlockBlocker = { id: string; title: string; percent: number };

export type UnlockResult = {
	unlocked: boolean;
	blockers: UnlockBlocker[];
};

// computeTopicProgressPercent, isTopicUnlocked, isLessonUnlocked, isLessonAccessible
```

Semantics per design: open ignore edges; sequential use previous by position; graph AND all incoming edges; missing progress = 0.

**Step 4:** tests PASS

**Step 5: Commit**

```bash
git add src/features/program-locks
git commit -m "feat: add program lock unlock helpers"
```

---

### Task 2: Graph cycle validation helper (TDD)

**Files:**
- Create: `src/features/program-locks/lib/lock-graph.ts`
- Create: `src/features/program-locks/lib/lock-graph.test.ts`

**Step 1: Tests** for `assertAcyclicEdges(edges: { from: string; to: string }[])`:
- empty ok
- self-loop throws
- simple cycle A→B→A throws
- DAG ok
- diamond (A→C, B→C) ok

**Step 2:** FAIL → implement DFS/toposort → PASS

**Step 3: Commit** `feat: add lock graph cycle validation`

---

### Task 3: DB schema + migration + Zero generate

**Files:**
- Modify: `src/server/db/program/program.schema.ts` — add:
  - `topicLockMode` text default `"open"` notNull
  - `lessonLockMode` text default `"open"` notNull
  - `unlockThresholdPercent` integer default `80` notNull
- Create: `src/server/db/topic-lock-edge/topic-lock-edge.schema.ts`
- Create: `src/server/db/lesson-lock-edge/lesson-lock-edge.schema.ts`
- Modify: `src/server/db/schema.ts` — export tables into `DrizzleSchema`
- Modify: `src/server/db/relations.ts` — program ↔ edges; topic/lesson optional relations if useful
- Generate migration via `bun run db:generate`
- Run `bun run zero:generate`
- Optionally add `LOCK_MODES` to `src/server/zero/constants.ts`

**Edge table shapes:**

```typescript
// topic_lock_edge
{
  id: text PK,
  programId: text FK program cascade,
  blockerTopicId: text FK topic cascade,
  topicId: text FK topic cascade,
}
// unique (blockerTopicId, topicId)

// lesson_lock_edge
{
  id: text PK,
  programId: text FK program cascade,
  topicId: text FK topic cascade,
  blockerLessonId: text FK lesson cascade,
  lessonId: text FK lesson cascade,
}
// unique (topicId, blockerLessonId, lessonId)
```

**Step 1:** edit schemas + schema.ts + relations  
**Step 2:** `bun run db:generate` then `bun run zero:generate`  
**Step 3:** `bun run typecheck` (fix any generated type fallout)  
**Step 4: Commit** `feat: add program lock modes and edge tables`

---

### Task 4: Mutators — settings + replace edges

**Files:**
- Modify: `src/server/zero/mutators.ts`

**Mutators:**

1. `updateProgramLockSettings`
   - args: `{ id, topicLockMode?, lessonLockMode?, unlockThresholdPercent? }`
   - validate modes ∈ open|sequential|graph; threshold 1–100
   - `program:write`

2. `setTopicLockEdges`
   - args: `{ programId, edges: { id?, blockerTopicId, topicId }[] }`
   - load topics for program; every id must belong; no self; `assertAcyclicEdges`
   - delete existing edges for programId, insert new set

3. `setLessonLockEdges`
   - args: `{ programId, topicId, edges: { id?, blockerLessonId, lessonId }[] }`
   - topic must belong to program; lessons must be linked via topic_lesson; no self; acyclic
   - replace edges for that topicId only

Reuse `assertAcyclicEdges` from `features/program-locks/lib/lock-graph.ts` (isomorphic, safe for server/zero).

Also: in `markActivityStudied` / `updateVideoProgress`, after resolving program+lesson, if student (no `program:write`), compute unlock from tx data and throw if locked. Keep this as **Task 8** if too large — prefer Task 8.

**Commit:** `feat: add program lock settings and edge mutators`

---

### Task 5: Queries — include edges on program

**Files:**
- Modify: `src/server/zero/queries.ts`

For `programById`, `programsOutline` (if used for admin tree), and `publishedProgramById`:
- `.related("topicLockEdges")` and `.related("lessonLockEdges")` (names per relations)

Student published query already filters published topics/lessons; edges still sync (UI filters to known ids).

**Commit:** `feat: sync lock edges with program outline queries`

---

### Task 6: Admin lock settings UI

**Files:**
- Create: `src/features/program-locks/ui/program-lock-settings.tsx`
- Modify: `src/features/admin-programs/ui/program-detail-page.tsx` (and/or workspace program pane) — mount settings section «Доступ к занятиям»
- Modify: `src/features/program-locks/index.ts` — export settings + later editors
- data-testid: `program-lock-settings`, selects, threshold input

UI:
- Select topic mode / lesson mode (labels RU)
- Number input threshold 1–100
- On change → `updateProgramLockSettings`
- If topic mode === graph → button «Редактор зависимостей тем»
- If lesson mode === graph → hint that editor opens from topic (or list topics with buttons)

**Commit:** `feat: add program lock settings UI`

---

### Task 7: React Flow graph editors

**Files:**
- `bun add @xyflow/react` in worktree
- Create: `src/features/program-locks/ui/topic-lock-graph-editor.tsx`
- Create: `src/features/program-locks/ui/lesson-lock-graph-editor.tsx`
- Create: `src/features/program-locks/ui/lock-graph-canvas.tsx` (shared: nodes, edges, onConnect, delete, save)
- Wire open from settings / topic editor (`topic-editor.tsx` or workspace topic menu)

Behavior:
- Nodes from topics / topic lessons; initial positions from `position` (vertical layout)
- Connect = add edge; Save → `setTopicLockEdges` / `setLessonLockEdges`
- Reject self-loop in UI; on save catch cycle error with toast

**Commit:** `feat: add topic and lesson lock graph editors`

---

### Task 8: Student outline + player gate + progress enforcement

**Files:**
- Modify: `src/features/programs/ui/program-page.tsx` — compute unlock; lock icon; disable Open; tooltip with blockers + threshold
- Modify: `src/features/lesson-player/ui/lesson-player-page.tsx` — if locked, EmptyState «Занятие закрыто» (`data-testid="lesson-locked"`)
- Modify: `src/server/zero/mutators.ts` — `markActivityStudied` / `updateVideoProgress` refuse when locked for non-writers

Helper usage: build `topicProgressById` via `computeTopicProgressPercent` over published lessons; filter edges by mode.

**Commit:** `feat: enforce program locks for students`

---

### Task 9: Changelog + verify

**Files:**
- Create: `changes/unreleased/feat-program-locks.md`

```markdown
- В настройках программы можно выбрать режим открытия тем и уроков (открыто / по порядку / граф зависимостей) и порог прогресса для разблокировки
```

**Steps:**
1. `bun run check`
2. `bun run typecheck`
3. `bun test src/features/program-locks`
4. Commit changelog if not included earlier: `chore: changelog for program locks`

---

## Out of scope (do not implement)

- E2E Playwright (follow-up)
- Cross-topic lesson edges
- Per-edge thresholds
- Hiding locked items from outline
- Deleting edges on mode switch
