# Admin Sidebar Collapse + Platform Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Сворачиваемый desktop-сайдбар админки (иконки + localStorage) и страница «Настройки платформы» с ИИ и демо-каталогом.

**Architecture:** Состояние collapse — чистый helper + React state в `AdminShell`. Страница `/admin/settings` становится контейнером секций; кнопка сида уходит из shell/more. Mobile не меняем.

**Tech Stack:** TanStack Start, React, Tailwind v4, shadcn Button, lucide-react, Bun test

**Design:** `docs/plans/2026-08-09-admin-sidebar-collapse-platform-settings-design.md`

**Worktree:** `.worktrees/admin-sidebar-collapse` on branch `feat/admin-sidebar-collapse`

---

### Task 1: localStorage helper for sidebar collapse

**Files:**
- Create: `src/features/admin-shell/lib/sidebar-collapsed.ts`
- Create: `src/features/admin-shell/lib/sidebar-collapsed.test.ts`

**Step 1: Write failing tests**

```typescript
import { afterEach, describe, expect, test } from "bun:test";
import {
	ADMIN_SIDEBAR_COLLAPSED_KEY,
	readSidebarCollapsed,
	writeSidebarCollapsed,
} from "./sidebar-collapsed";

afterEach(() => {
	localStorage.removeItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
});

describe("sidebar-collapsed", () => {
	test("read defaults to false when empty", () => {
		expect(readSidebarCollapsed()).toBe(false);
	});

	test("write and read true", () => {
		writeSidebarCollapsed(true);
		expect(localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY)).toBe("1");
		expect(readSidebarCollapsed()).toBe(true);
	});

	test("write false clears collapsed", () => {
		writeSidebarCollapsed(true);
		writeSidebarCollapsed(false);
		expect(readSidebarCollapsed()).toBe(false);
	});

	test("invalid stored value → false", () => {
		localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, "yes");
		expect(readSidebarCollapsed()).toBe(false);
	});
});
```

**Step 2: Run test — expect FAIL**

Run: `bun test src/features/admin-shell/lib/sidebar-collapsed.test.ts`

**Step 3: Implement**

```typescript
export const ADMIN_SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

export function readSidebarCollapsed(): boolean {
	if (typeof localStorage === "undefined") return false;
	try {
		return localStorage.getItem(ADMIN_SIDEBAR_COLLAPSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function writeSidebarCollapsed(collapsed: boolean): void {
	if (typeof localStorage === "undefined") return;
	try {
		if (collapsed) {
			localStorage.setItem(ADMIN_SIDEBAR_COLLAPSED_KEY, "1");
		} else {
			localStorage.removeItem(ADMIN_SIDEBAR_COLLAPSED_KEY);
		}
	} catch {
		// ignore quota / private mode
	}
}
```

**Step 4: Run tests — PASS**

**Step 5: Commit**

```bash
git add src/features/admin-shell/lib/sidebar-collapsed.ts src/features/admin-shell/lib/sidebar-collapsed.test.ts
git commit -m "feat: add admin sidebar collapsed localStorage helper"
```

---

### Task 2: Collapsible desktop sidebar in AdminShell

**Files:**
- Modify: `src/features/admin-shell/ui/admin-shell.tsx`

**Step 1: Wire state**

```typescript
const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
	setCollapsed(readSidebarCollapsed());
}, []);

const toggleCollapsed = () => {
	setCollapsed((prev) => {
		const next = !prev;
		writeSidebarCollapsed(next);
		return next;
	});
};
```

**Step 2: Update `aside`**

- Width: `collapsed ? "w-14" : "w-60"`
- Add `data-collapsed={collapsed ? "true" : "false"}` on aside (for tests/e2e)
- Brand header when collapsed: only the primary dot (or icon), hide «Админка» text and version (or show version via title on brand)
- Prefer keeping a tiny brand mark + collapse toggle visible

**Step 3: Extend `NavLink` for sidebar collapsed**

When `variant === "sidebar"` and `collapsed`:
- `justify-center px-0`, hide label text (`sr-only` or conditional)
- set `title={label}` on the Link for hover hint
- keep `data-testid` unchanged

Pass `collapsed` into each sidebar `NavLink`.

**Step 4: `AdminAccountControls`**

Add prop `collapsed: boolean`.
- When collapsed: avatar-only account link (`title={userName}`), icon-only back-to-app button (`title="В приложение"`, `aria-label`), hide text labels
- **Remove** `<SeedDemoCatalogButton variant="sidebar" />` and its import entirely

**Step 5: Collapse toggle button**

Above or below account controls (inside footer), add:

```tsx
<Button
	type="button"
	variant="ghost"
	size="sm"
	className={cn(collapsed && "px-0 justify-center")}
	onClick={toggleCollapsed}
	data-testid="admin-sidebar-collapse"
	aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
	title={collapsed ? "Развернуть" : "Свернуть"}
>
	{collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
</Button>
```

(Use lucide `PanelLeftCloseIcon` / `PanelLeftOpenIcon` or `ChevronsLeft` / `ChevronsRight`.)

**Step 6: Manual check**

- Desktop: toggle → thin icons; reload → stays collapsed
- Mobile: unchanged bottom nav

**Step 7: Commit**

```bash
git add src/features/admin-shell/ui/admin-shell.tsx
git commit -m "feat: collapse admin sidebar to icon-only strip"
```

---

### Task 3: Remove seed from mobile «Ещё» + rename nav link

**Files:**
- Modify: `src/features/admin-shell/ui/admin-more-menu.tsx`

**Step 1: Remove seed**

- Delete `SeedDemoCatalogButton` import and usage from sheet
- Remove unused import

**Step 2: Rename settings link**

```typescript
{
	to: "/admin/settings",
	label: "Настройки",
	description: "ИИ, демо-каталог и платформа",
	testId: "admin-nav-ai-settings", // keep testId for existing e2e if any
	icon: <SettingsIcon className="size-4" />, // or keep SparklesIcon — prefer SettingsIcon
},
```

Import `SettingsIcon` from lucide if switching icon; can drop `SparklesIcon` if unused.

**Step 3: Commit**

```bash
git add src/features/admin-shell/ui/admin-more-menu.tsx
git commit -m "feat: move platform settings label; drop demo seed from more menu"
```

---

### Task 4: Platform settings page (AI + demo catalog)

**Files:**
- Modify: `src/features/admin-settings/ui/ai-settings-page.tsx` → prefer rename file to `platform-settings-page.tsx` OR keep filename and rename export
- Modify: `src/features/admin-settings/index.ts`
- Modify: `src/routes/admin/settings/index.tsx`
- Modify: `src/features/admin-seed/ui/seed-demo-catalog-button.tsx` (optional `variant: "page"`)

**Recommended approach (minimal churn):**

1. Rename component `AiSettingsPage` → `PlatformSettingsPage` (file can stay or become `platform-settings-page.tsx`).
2. Page header:
   - title: `Настройки платформы`
   - description: кратко про ИИ и служебные действия
   - breadcrumb last crumb: `Настройки`
   - `data-testid="admin-platform-settings-page"` (keep old `admin-ai-settings-page` as alias on same element OR update — prefer new id + keep form testids)
3. Structure:

```tsx
<main ... data-testid="admin-platform-settings-page">
  <PageHeader title="Настройки платформы" ... />

  <section className="grid gap-4" aria-labelledby="platform-ai-heading">
    <h2 id="platform-ai-heading" className="text-lg font-semibold">ИИ</h2>
    {/* existing loading / form — unchanged logic, same form testids */}
  </section>

  <section className="grid gap-3" aria-labelledby="platform-demo-heading">
    <h2 id="platform-demo-heading" className="text-lg font-semibold">Демо-каталог</h2>
    <p className="text-sm text-muted-foreground">
      Идемпотентно создаёт 4 программы ОГЭ/ЕГЭ с темами, уроками и активностями.
    </p>
    <SeedDemoCatalogButton variant="page" className="w-fit" />
  </section>
</main>
```

4. In `seed-demo-catalog-button.tsx`:
   - Extend variant: `"sidebar" | "sheet" | "page"`
   - `page` = same as current default outline button (or explicit default); can remove unused `sidebar`/`sheet` variants if nothing else uses them — **remove dead variants** after shell/more cleanup.

5. Export from `index.ts`:

```typescript
export { PlatformSettingsPage } from "./ui/platform-settings-page";
// optional: export { PlatformSettingsPage as AiSettingsPage } for compat — YAGNI, just update route
```

6. Route:

```tsx
import { PlatformSettingsPage } from "#/features/admin-settings";
// ...
return <PlatformSettingsPage />;
```

Auth `settings:ai` unchanged.

**Step 5: Commit**

```bash
git add src/features/admin-settings src/features/admin-seed/ui/seed-demo-catalog-button.tsx src/routes/admin/settings/index.tsx
git commit -m "feat: platform settings page with AI and demo catalog"
```

---

### Task 5: Changelog + verify

**Files:**
- Create: `changes/unreleased/feat-admin-sidebar-collapse.md`

```markdown
- Сайдбар админки сворачивается до иконок (состояние в localStorage)
- Демо-каталог перенесён в «Настройки платформы» (/admin/settings)
```

**Verify** (from worktree; if biome ignores `.worktrees`, run from repo files or `bunx biome check src/...`):

```bash
bun test src/features/admin-shell/lib/sidebar-collapsed.test.ts
bun run typecheck
bunx biome check --write src/features/admin-shell src/features/admin-settings src/features/admin-seed/ui/seed-demo-catalog-button.tsx src/routes/admin/settings
```

**Commit**

```bash
git add changes/unreleased/feat-admin-sidebar-collapse.md
git commit -m "chore: changelog for sidebar collapse and platform settings"
```

---

### Manual QA checklist

- [ ] Admin/teacher: desktop sidebar collapse/expand; icons only when collapsed; tooltips via `title`
- [ ] Reload keeps collapsed state
- [ ] Mobile bottom nav + «Ещё» without demo button; «Настройки» link visible for admin
- [ ] Teacher does not see Настройки (no `settings:ai`)
- [ ] Admin `/admin/settings`: AI form works; demo button seeds / already_exists toast
- [ ] Demo button absent from sidebar footer

---

### Out of scope

- Super-admin role
- Student shell collapse
- Changing `seedDemoCatalog` server authz
