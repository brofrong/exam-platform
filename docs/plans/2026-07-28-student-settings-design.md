# Student Profile Settings Design

Дата: 2026-07-28  
Статус: согласован (brainstorming)

## Цель

Страница настроек профиля ученика: аватар, имя, почта, пароль, тема, префы уведомлений (без доставки), управление сессиями. Тема убирается из сайдбара/мобильного блока профиля.

## Решения (зафиксировано)

| Тема | Решение |
|------|---------|
| Маршрут | `/app/settings` внутри StudentShell |
| Навигация desktop | Пункт «Настройки» в сайдбаре + ссылка с «Мой профиль» |
| Навигация mobile | Только ссылка с «Мой профиль» (таббар без изменений: 2 кнопки) |
| Имя | `authClient.updateUser({ name })` |
| Аватар | Upload MinIO purpose `avatar` → `user.image` = `/api/files/<key>` |
| Email | Сразу без письма: `changeEmail.enabled` + `updateEmailWithoutVerification` |
| Пароль | `changePassword` (+ опционально revoke other sessions) |
| Тема | localStorage light/dark/auto (как сейчас), UI только в настройках |
| Уведомления | Тогглы в UI, поля `notifySupportReply` / `notifyReviewGraded` (boolean), без доставки |
| Сессии | `listSessions` / `revokeSession` / `revokeOtherSessions` |
| Выход | Остаётся в сайдбаре (desktop); на мобилке — через профиль/настройки |

## Экран

Блоки сверху вниз:

1. **Профиль** — аватар + имя  
2. **Контакты** — email  
3. **Безопасность** — смена пароля  
4. **Тема** — light / dark / system  
5. **Уведомления** — `supportReply`, `reviewGraded`  
6. **Сессии** — список + «Выйти везде» (другие устройства)

## Данные и API

### Better Auth

```ts
user: {
  changeEmail: {
    enabled: true,
    updateEmailWithoutVerification: true,
  },
  additionalFields: {
    role: { /* existing */ },
    notificationPrefs: {
      type: "json",
      required: false,
      defaultValue: { supportReply: true, reviewGraded: true },
      input: true,
    },
  },
}
```

Client: `updateUser`, `changeEmail`, `changePassword`, `listSessions`, `revokeSession`, `revokeOtherSessions`.

### Schema

- `user.notificationPrefs` — jsonb (или text JSON), defaults `{ supportReply: true, reviewGraded: true }`
- Migration via drizzle

### Avatar upload

- `UPLOAD_PURPOSES` += `"avatar"`
- Allow only image content types for avatar purpose (or reuse existing image types)
- Any authenticated user can upload own avatar (no admin capability)

## Структура файлов

```
features/student-settings/
  ui/student-settings-page.tsx
  ui/*-section.tsx          # optional split
  lib/notification-prefs.ts
  index.ts
routes/app/settings.tsx
```

Updates: `student-shell`, `student-home`, `auth.ts`, `auth-client`, `user.schema`, storage upload, e2e helpers if needed.

## Вне скоупа

- Реальная доставка уведомлений (email/push/in-app)
- Удаление аккаунта
- OAuth / account linking
- Отдельные настройки для admin chrome (можно переиспользовать позже)
- Смена email с verification-письмом
