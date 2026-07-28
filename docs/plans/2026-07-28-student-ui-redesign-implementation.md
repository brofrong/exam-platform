# Student UI Redesign Implementation Plan

> **For Claude:** Execute task-by-task in this session.

**Goal:** Student shell (left sidebar desktop, bottom nav mobile), no top header on `/app/*`, programs list page, topic progress timeline.

**Architecture:** `StudentShell` wraps `/app` layout; hide `AppHeader` for `/app`; split home vs programs list; add `TopicTimeline` LMS component.

**Tech Stack:** TanStack Router, Tailwind v4, shadcn/ui, existing LMS composites.

---

### Task 1: TopicTimeline component
### Task 2: StudentShell (sidebar + bottom nav)
### Task 3: Hide AppHeader on /app; wire shell in app layout
### Task 4: Programs list page + route
### Task 5: Update student-home (remove programs, mobile account controls)
### Task 6: Update program page to use TopicTimeline
### Task 7: Verify check/typecheck; fix e2e selectors if needed
