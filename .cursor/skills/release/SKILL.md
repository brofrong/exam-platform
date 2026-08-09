---
name: release
description: >-
  бамп версии, сбор changelog, commit/push релиза, Docker через CI.
  Use when user asks for release, релиз, bump version, выкатить в GitHub/Docker Hub.
---

# Release

Bumps semver, folds `changes/unreleased/` into a released changelog, commits, and pushes. Docker Hub tags come from CI — do not `docker push` by hand.

**Default bump:** `patch`. Use `minor` / `major` only when the user asks.

## During development

Same rules as `.cursor/rules/changelog.mdc` (`changes/unreleased/`):

1. After a feature/fix, add `changes/unreleased/<prefix>-<slug>.md`
   - prefix: `feat` | `fix` | `chore`
   - slug: short kebab-case, Latin
2. Short **Russian** bullets only (1–5 lines):

```markdown
- Что изменилось для пользователя/разработчика
```

3. Do not edit others' files in `unreleased/`
4. Do not hand-edit `changes/released/` or `src/shared/changelog.ts` — `bun run release` owns those

## Release checklist

Copy and track:

```
Release Progress:
- [ ] Working tree clean (or user approved dirty)
- [ ] On intended branch (usually `main` or release PR branch)
- [ ] `bun run release -- [patch|minor|major]`
- [ ] `bun run check` + `bun run typecheck` if code changed in same session
- [ ] Commit `chore(release): vX.Y.Z` including `package.json`, `changes/`, `src/shared/changelog.ts`
- [ ] Push to GitHub
- [ ] Confirm CI docker-publish will tag `latest` + semver
```

### Steps

1. **Working tree** — `git status`. If dirty, stop unless the user explicitly approves releasing with local changes.
2. **Branch** — confirm `main` or the intended release PR branch.
3. **Run release** (default patch):

```bash
bun run release -- patch
# or: bun run release -- minor | major
```

This collects `changes/unreleased/*.md`, bumps version, writes `changes/released/<version>.md`, clears unreleased, regenerates `src/shared/changelog.ts`, updates `package.json`.

4. **Verify** — if other code changed in this session: `bun run check` and `bun run typecheck`.
5. **Commit** — stage only release artifacts:

```bash
git add package.json changes/ src/shared/changelog.ts
git commit -m "$(cat <<'EOF'
chore(release): vX.Y.Z

EOF
)"
```

Replace `X.Y.Z` with the new version from `package.json`.

6. **Push** to GitHub (`git push` / `git push -u origin HEAD` as needed). Do not push unless releasing.
7. **Docker** — confirm CI `docker-publish` on the target branch tags `latest` and the semver from `package.json`. No manual Docker Hub push.

## Do not

- Re-enable auto bump workflow (`.github/workflows/bump-version.yml` was removed)
- Hand-edit `changes/released/` or `src/shared/changelog.ts`
- Skip the checklist or invent a parallel bump path
