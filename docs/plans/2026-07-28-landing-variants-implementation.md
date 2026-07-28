# Landing Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 unique PHYS&MATH landing variants on `/v/<slug>` with a header version dropdown.

**Architecture:** Shared content + nav/footer; each variant is a full page component; thin `v.$slug` route resolves from a registry.

**Tech Stack:** TanStack Start/Router, Tailwind v4, shadcn DropdownMenu, CSS animations, existing Particles.

---

### Task 1: Shared content + variant registry

**Files:**
- Create: `src/features/landing/lib/content.ts`
- Create: `src/features/landing/lib/variants.ts`
- Modify: `src/features/landing/ui/landing-page.tsx` (import content)
- Modify: `src/features/landing/index.ts`

### Task 2: Nav dropdown + shared footer

**Files:**
- Modify: `src/features/landing/ui/landing-nav.tsx`
- Create: `src/features/landing/ui/landing-footer.tsx`
- Modify: original landing to use footer

### Task 3: Variant pages (orbit, atelier, proof, chalk, story)

**Files:**
- Create: `src/features/landing/ui/variants/*.tsx`
- Modify: `src/styles.css` (variant tokens + motion)
- Create: `src/routes/v.$slug.tsx`

### Task 4: Verify

- `bun run check` + `bun run typecheck`
- Manual smoke: `/`, `/v/orbit` … `/v/story`, unknown slug 404
