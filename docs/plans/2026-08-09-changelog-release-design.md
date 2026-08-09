# Changelog + Release — Design

**Date:** 2026-08-09  
**Status:** Approved

## Goal

Агенты кратко фиксируют изменения на русском в отдельных файлах (без merge conflict). Скилл `release` собирает их, бампит версию, пушит в GitHub; Docker Hub получает semver-тег из CI. В админке по клику на версию открывается модалка с changelog.

## Changelog files

```
changes/
  unreleased/              # агенты пишут по ходу задач
    feat-admin-modal.md
    fix-login-redirect.md
  released/                # только скрипт релиза
    0.1.3.md
    0.1.2.md
```

**Формат `unreleased/<slug>.md`:** только буллеты на русском, 1–5 пунктов.

```markdown
- Краткий пункт
- Ещё один пункт
```

**Имена файлов:** `feat-` / `fix-` / `chore-` + kebab-case slug. Не трогать чужие файлы. Не писать в `released/` вручную.

**Почему unreleased + отдельные файлы:** параллельные PR/агенты не конфликтуют по одному changelog-файлу.

## Agent rule

Always-apply правило в `.cursor/rules/changelog.mdc`:

1. В конце задачи создать файл в `changes/unreleased/`
2. Писать кратко на русском
3. Не редактировать чужие unreleased-файлы и `released/`

То же описать в скилле `release` (раздел «во время разработки»).

## Release skill + script

**Скилл:** `.cursor/skills/release/SKILL.md`  
**Триггеры:** «релиз», «release», bump версии, выкатить в GitHub/Docker Hub.

**Скрипт:** расширить/заменить `scripts/bump-version.ts` → `scripts/release.ts` (или оркестратор поверх bump).

Шаги:

1. Проверить чистое рабочее дерево (или согласовать с пользователем)
2. Собрать все `changes/unreleased/*.md`
3. Bump semver (`patch` по умолчанию; иначе `minor` / `major`)
4. Записать `changes/released/<version>.md`
5. Очистить `changes/unreleased/`
6. Пересобрать `src/shared/changelog.ts` из `released/` (новые версии сверху)
7. Обновить `package.json`
8. Commit `chore(release): vX.Y.Z`
9. Push в GitHub

Версию бампит **только** этот скрипт через агентов. Workflow `.github/workflows/bump-version.yml` — удалить или оставить только ручной `workflow_dispatch` отключённым; авто-bump на push в `main` убрать.

## Docker Hub

CI `docker-publish` на push в `main` уже пушит образ. Добавить semver-тег из `package.json` (например `0.1.3`) рядом с `latest` и short SHA. Отдельный ручной `docker push` из скилла не нужен.

## In-app modal

- Клик по `v{APP_VERSION}` в `admin-shell` открывает Dialog
- Формат:

```
0.1.3
--------
• пункт
• пункт

0.1.2
--------
• пункт
```

- Данные из `src/shared/changelog.ts`
- Пусто → «Пока нет записей об изменениях»
- Версия — button, без навигации

## Out of scope

- Changelog на лендинге / студенческом UI
- Автооткрытие модалки «что нового» после обновления
- Conventional commits enforcement
