# Changelog + Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Агенты пишут changelog в `changes/unreleased/`, скилл `release` бампит версию и собирает историю; в админке по клику на версию открывается модалка changelog.

**Architecture:** Отдельные markdown-файлы в `changes/unreleased/` (без merge conflict). Скрипт `scripts/release.ts` бампит semver, переносит заметки в `changes/released/<version>.md`, генерирует `src/shared/changelog.ts` для UI. Авто-bump workflow удаляется; Docker CI получает semver-тег.

**Tech Stack:** Bun, TypeScript, shadcn Dialog, GitHub Actions, Cursor rules/skills

**Design:** `docs/plans/2026-08-09-changelog-release-design.md`

---

### Task 1: Scaffold changes dirs + empty changelog module

**Files:**
- Create: `changes/unreleased/.gitkeep`
- Create: `changes/released/.gitkeep`
- Create: `src/shared/changelog.ts`
- Test: `src/shared/changelog.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, expect, test } from "bun:test";
import { CHANGELOG } from "./changelog";

describe("CHANGELOG", () => {
	test("exports an array", () => {
		expect(Array.isArray(CHANGELOG)).toBe(true);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `bun test src/shared/changelog.test.ts`
Expected: FAIL (module not found)

**Step 3: Minimal implementation**

`src/shared/changelog.ts`:

```typescript
export type ChangelogEntry = {
	version: string;
	changes: string[];
};

/** Generated/updated by `bun run release`. Do not edit by hand during tasks. */
export const CHANGELOG: ChangelogEntry[] = [];
```

Create empty dirs with `.gitkeep`.

**Step 4: Run test to verify it passes**

Run: `bun test src/shared/changelog.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add changes src/shared/changelog.ts src/shared/changelog.test.ts
git commit -m "feat: scaffold changelog dirs and empty CHANGELOG module"
```

---

### Task 2: Release script — collect unreleased + bump + write released

**Files:**
- Create: `scripts/release.ts`
- Modify: `scripts/bump-version.ts` (keep as library helper OR inline bump into release.ts and thin-wrap `version:bump`)
- Modify: `package.json` (add `"release": "bun run scripts/release.ts"`)
- Test: `scripts/release.test.ts` (unit-test pure helpers with temp dirs)

**Step 1: Write failing tests for helpers**

Cover:
- `parseUnreleasedFiles(dir)` → sorted list of `{ slug, bullets: string[] }`
- `formatReleasedMarkdown(bullets)` → markdown with `- ` lines
- `buildChangelogTs(entries)` → TypeScript source string
- `bumpSemver(version, level)` → next version
- `compareSemverDesc(a, b)` for sorting released files

**Step 2: Run tests — expect FAIL**

Run: `bun test scripts/release.test.ts`

**Step 3: Implement `scripts/release.ts`**

CLI: `bun run release -- [patch|minor|major]` (default patch)

Algorithm:
1. Read `package.json` version
2. Compute next version
3. Read all `changes/unreleased/*.md` (skip `.gitkeep`)
4. Parse bullets (lines starting with `- ` / `* `)
5. If no bullets and no `--allow-empty`, exit 1 with message
6. Write `changes/released/<nextVersion>.md`
7. Delete unreleased `*.md` (keep `.gitkeep`)
8. Rebuild `CHANGELOG` from all `changes/released/*.md` sorted semver desc → write `src/shared/changelog.ts`
9. Update `package.json` version
10. Print summary

Flags:
- `--dry-run` — print plan, no writes
- `--allow-empty` — allow release with empty changelog (rare)

Keep `bun run version:bump` working by calling shared bump helper (for backwards compat) OR document that agents must use `release` only.

**Step 4: Run tests — PASS**

Also manual dry-run:
```bash
bun run release -- --dry-run
```

**Step 5: Commit**

```bash
git add scripts/release.ts scripts/release.test.ts scripts/bump-version.ts package.json
git commit -m "feat: add release script that bumps version and aggregates changelog"
```

---

### Task 3: Disable auto version bump workflow + Docker semver tag

**Files:**
- Delete: `.github/workflows/bump-version.yml`
- Modify: `.github/workflows/ci.yml` (docker metadata tags)

**Step 1: Remove bump-version.yml**

**Step 2: Update docker metadata in ci.yml**

Add semver tag from package.json:

```yaml
- name: Read package version
  id: pkg
  run: echo "version=$(bun -e 'console.log((await Bun.file("package.json").json()).version)')" >> "$GITHUB_OUTPUT"

- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v6
  with:
    images: ${{ vars.DOCKERHUB_IMAGE || 'brofrong/exam-platform' }}
    tags: |
      type=raw,value=latest
      type=raw,value=${{ steps.pkg.outputs.version }}
      type=sha,prefix=,format=short
```

Place «Read package version» before Extract metadata in `docker-publish` job.

**Step 3: Commit**

```bash
git add -u .github/workflows
git commit -m "chore: remove auto version bump; tag Docker images with semver"
```

---

### Task 4: Cursor rule for changelog during tasks

**Files:**
- Create: `.cursor/rules/changelog.mdc`
- Modify: `AGENTS.md` (one line pointing to the rule + `bun run release`)

**Step 1: Write rule**

```markdown
---
description: Писать краткий changelog на русском в changes/unreleased после каждой задачи
alwaysApply: true
---

# Changelog

После завершения задачи (feature/fix), до коммита:

1. Создай файл `changes/unreleased/<prefix>-<slug>.md`
   - prefix: `feat` | `fix` | `chore`
   - slug: короткий kebab-case, латиница
2. Пиши **кратко на русском**, только буллеты:

\`\`\`markdown
- Что изменилось для пользователя/разработчика
\`\`\`

3. Не редактируй чужие файлы в `unreleased/`
4. Не пиши в `changes/released/` и не правь `src/shared/changelog.ts` вручную — это делает `bun run release`
5. Релиз — только через скилл `release` / `bun run release`
```

**Step 2: Update AGENTS.md** — mention changelog rule and release command in Commands table / Do list.

**Step 3: Commit**

```bash
git add .cursor/rules/changelog.mdc AGENTS.md
git commit -m "docs: add always-apply changelog rule for agents"
```

---

### Task 5: Release skill

**Files:**
- Create: `.cursor/skills/release/SKILL.md`

**Step 1: Write skill**

Frontmatter:
- `name: release`
- `description`: бамп версии, сбор changelog, commit/push релиза, Docker через CI. Use when user asks for release, релиз, bump version, выкатить в GitHub/Docker Hub.
- Do NOT set `disable-model-invocation: true` — agent should find it when asked for release.

Body sections:
1. **During development** — same rules as changelog.mdc (point to `changes/unreleased/`)
2. **Release checklist** — copy and track:
   - [ ] Working tree clean (or user approved dirty)
   - [ ] On intended branch (usually `main` or release PR branch)
   - [ ] `bun run release -- [patch|minor|major]`
   - [ ] `bun run check` + `bun run typecheck` if code changed in same session
   - [ ] Commit `chore(release): vX.Y.Z` including `package.json`, `changes/`, `src/shared/changelog.ts`
   - [ ] Push to GitHub
   - [ ] Confirm CI docker-publish will tag `latest` + semver
3. **Do not** re-enable auto bump workflow
4. **Default bump:** patch

**Step 2: Commit**

```bash
git add .cursor/skills/release/SKILL.md
git commit -m "docs: add release skill for agents"
```

---

### Task 6: Changelog modal in admin shell

**Files:**
- Create: `src/features/admin-shell/ui/changelog-dialog.tsx`
- Modify: `src/features/admin-shell/ui/admin-shell.tsx` (version click → dialog)
- Modify: `src/features/admin-shell/index.ts` if needed (only if exporting)
- Optionally: small unit-less manual check / e2e later — keep UI lean

**Step 1: Implement `ChangelogDialog`**

Use shadcn Dialog. Props: `open`, `onOpenChange`, data from `CHANGELOG`.

Layout per entry:
```
{version}
--------
• change
• change
```

Empty: «Пока нет записей об изменениях»

`data-testid="changelog-dialog"`

**Step 2: Wire version button in admin-shell**

- Split brand: Link «Админка» stays; version becomes `<button type="button">` with `data-testid="admin-version"` that opens dialog
- Prevent link navigation when clicking version (version outside Link or stopPropagation)

**Step 3: Run check**

```bash
bun run check
bun run typecheck
```

**Step 4: Commit**

```bash
git add src/features/admin-shell
git commit -m "feat: open changelog modal from admin version label"
```

---

### Task 7: Seed initial released entry + verify end-to-end script

**Files:**
- Create: `changes/unreleased/chore-changelog-system.md` (this feature's notes)
- Run release dry-run then real local release **without push** only if user wants — OR leave unreleased for first real release

**Preferred for this PR:** leave notes in unreleased; do **not** bump version in the feature PR (version bump is release skill's job).

Write:

```markdown
- Добавлена система changelog в changes/unreleased
- Скилл release и скрипт сборки релиза
- Модалка списка изменений в админке по клику на версию
```

**Step 1: Add unreleased note**

**Step 2: Final verification**

```bash
bun test src scripts/release.test.ts
bun run check
bun run typecheck
bun run release -- --dry-run
```

**Step 3: Commit**

```bash
git add changes/unreleased/chore-changelog-system.md
git commit -m "docs: record changelog system in unreleased notes"
```

---

## Execution notes

- Worktree: `.worktrees/changelog-release` on branch `feat/changelog-release`
- Do not push or create GitHub release unless user asks
- First real `bun run release` happens later via skill after merge to main (or from main)
- Biome: tabs, double quotes
