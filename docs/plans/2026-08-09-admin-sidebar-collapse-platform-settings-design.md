# Design: Collapse admin sidebar + platform settings page

## Goal

1. Allow admins and teachers to collapse the desktop admin sidebar to an icon-only thin strip; persist preference in `localStorage`.
2. Turn `/admin/settings` into a general «Настройки платформы» page and move the demo-catalog seed button there (admin only).

## Sidebar collapse

**Scope:** desktop `aside` in `AdminShell` only. Mobile bottom nav + «Ещё» unchanged.

**State:** `collapsed` boolean, key `admin-sidebar-collapsed` in `localStorage`.

**UI:**
- Expanded: current `w-60`, icon + label.
- Collapsed: ~`w-14`, icons only, centered; labels hidden; `title` or Tooltip for accessibility.
- Toggle: chevron/button at bottom of sidebar (or edge).
- Account / «В приложение» / changelog in collapsed mode also icon-only.

**Files:** `src/features/admin-shell/ui/admin-shell.tsx` (and `NavLink` / footer controls), possibly shared collapse helper under `admin-shell/lib/`.

## Platform settings page

**Route:** keep `/admin/settings` (admin-only, existing caps).

**Page:** rename/rework `AiSettingsPage` into platform settings with sections:
1. **ИИ** — existing OpenRouter settings (logic unchanged).
2. **Демо-каталог** — `SeedDemoCatalogButton` + short description.

**Cleanup:** remove `SeedDemoCatalogButton` from sidebar footer (`AdminAccountControls`) and from mobile «Ещё» (`admin-more-menu`).

**Nav label:** rename sidebar/more link «ИИ» → «Настройки» (or «Платформа»).

## Out of scope

- New super-admin role
- Collapsing student shell
- Changing seed server authz (still `program:write`; UI only on admin settings page)
