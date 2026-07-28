# Landing Page Variants

Дата: 2026-07-28  
Статус: согласован (brainstorming)

## Цель

Сделать 5 уникальных визуальных версий лендинга PHYS&MATH на базе текущего контента, с переключением через dropdown в header и отдельными роутами.

## Решения

| Тема | Решение |
|------|---------|
| Роутинг | Отдельные роуты: `/` (оригинал) + `/v/<slug>` |
| Контент | Общий (STATS, AUDIENCE, FORMATS, FAQ, WHY, copy) |
| Nav | Dropdown версий на всех лендингах |
| Motion | CSS + существующие Particles/kenburns; без framer-motion |
| Ассеты | Существующие `/public/landing`, `/diploms`, `/victoria` |

## Роуты

| Path | Slug | Название |
|------|------|----------|
| `/` | — | Оригинал |
| `/v/orbit` | `orbit` | Orbit |
| `/v/atelier` | `atelier` | Atelier |
| `/v/proof` | `proof` | Proof |
| `/v/chalk` | `chalk` | Chalk |
| `/v/story` | `story` | Story |

Неизвестный slug → 404 / notFound.

## Визуальные направления

### 1. Orbit — cinematic dark

- Тёмный космос, орбиты, particles, янтарь.
- Hero без фото: бренд + headline + CTA.
- Motion: появление орбит, fade текста, particles.

### 2. Atelier — full-bleed portrait

- Full-bleed `victoria-hero` / whiteboard на весь первый экран.
- Текст поверх с градиентом затемнения.
- Motion: ken-burns фона, fade текста.

### 3. Proof — trust-first light

- Светлый trust: большие цифры, ряд дипломов, портрет + credentials.
- Меньше атмосферы, больше доказательств.
- Motion: count-up статистики, stagger секций.

### 4. Chalk — STEM geometry

- Тонкие геометрические линии (парабола, сетка), teal + coral.
- «Классная доска» без клише мела.
- Motion: линии рисуются (SVG stroke), лёгкий hover.

### 5. Story — editorial narrative

- Крупная типографика, одно фото на секцию, почти без карточек.
- Фокус на истории «от паники к баллу».
- Motion: scroll-reveal, мягкий reviews.

## Структура секций (общий скелет)

1. Hero (бренд + 1 headline + 1 subtitle + CTA)
2. About / Виктория (+ фото)
3. Audience
4. Formats
5. Trial CTA
6. Why
7. Reviews
8. FAQ
9. Footer

Акценты по версиям меняют композицию/порядок акцентов, но не продуктовый смысл.

## Архитектура файлов

```
src/features/landing/
  index.ts
  lib/
    content.ts          # STATS, AUDIENCE, FORMATS, FAQ, WHY, shared copy
    variants.ts         # registry: slug → meta + component
  ui/
    landing-nav.tsx     # + version dropdown
    landing-page.tsx    # оригинал (/)
    landing-footer.tsx  # shared footer (если вынести)
    reviews-marquee.tsx
    review-card.tsx
    social-links.tsx
    variants/
      orbit-landing.tsx
      atelier-landing.tsx
      proof-landing.tsx
      chalk-landing.tsx
      story-landing.tsx

src/routes/
  index.tsx             # LandingPage (оригинал)
  v.$slug.tsx           # thin: resolve variant or notFound
```

## Nav dropdown

- Пункты: Оригинал · Orbit · Atelier · Proof · Chalk · Story
- Активный вариант подсвечен
- Переход через TanStack `Link`
- shadcn `DropdownMenu`
- Виден на desktop; на mobile — в burger-меню или рядом с auth

## Motion budget

- 2–3 осознанных эффекта на версию
- `prefers-reduced-motion: reduce` отключает анимации
- Не добавлять framer-motion без необходимости

## Design constraints (frontend)

- Hero: один composition, бренд hero-level, без карточек в hero
- Не purple/cream-serif/terracotta AI defaults; Chalk — teal/coral осознанно, не «AI purple»
- Full-bleed hero только где задумано (Atelier)
- Сохранить читаемость на mobile

## Out of scope

- Изменение продуктового копирайта / оффера
- A/B аналитика
- Замена оригинала на `/`
- Новые фотосессии (только существующие ассеты)
