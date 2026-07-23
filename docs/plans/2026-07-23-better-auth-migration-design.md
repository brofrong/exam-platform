# Better Auth Migration Design

Replace the custom HMAC cookie auth with Better Auth (email + password only).

## Goals

- Single auth system: Better Auth
- Email/password sign-in and sign-up without email verification
- One `/login` page with a Sign in / Sign up toggle
- Protect routes and Zero APIs via Better Auth session

## Non-goals

- OAuth providers
- Email verification / password reset flows
- Keeping backward compatibility with the old `session` cookie

## Architecture

### Server

- Configure `betterAuth` with:
  - `secret` / `baseURL` from env
  - `drizzleAdapter` with `user`, `session`, `account`, `verification`
  - `emailAndPassword.enabled: true` (no required verification)
  - `tanstackStartCookies` plugin
- Keep only the catch-all route `/api/auth/$`
- Delete old auth: `session.ts`, `login.ts`, `logout.ts`, `me.ts`, `SESSION_SECRET`
- `getCurrentUser` uses `auth.api.getSession({ headers })` and returns `{ id, name, email }` or `null`
- `/api/query` and `/api/mutate` authenticate via the same session helper

### Client / UI

- `/login`: toggle between Sign in (email + password) and Sign up (name + email + password)
- Use `authClient.signIn.email` / `signUp.email`
- On success, redirect to `/`
- Logout via `authClient.signOut()`
- Authenticated layout still uses `getCurrentUser` in `beforeLoad`
- Display `user.name` (fallback to email); drop `user.login`
- Zero provider context: `{ id, name }` (no `login`)
- Regenerate Zero schema for Better Auth `user` columns

### Schema / env / errors

- Export auth tables from the Drizzle schema module for the adapter
- Env: keep `BETTER_AUTH_SECRET` and Better Auth URL vars; remove `SESSION_SECRET`
- Surface Better Auth error messages in the login form
- Unauthenticated: redirect to `/login` (routes) or `401` (Zero APIs)
- No new DB migrations — auth tables already exist

## Data flow

1. Sign up/in → Better Auth handler sets session cookie
2. Page load / `beforeLoad` → `getCurrentUser` → session or redirect
3. Zero query/mutate → validate Better Auth session → proceed or 401
4. Sign out → clear Better Auth session → redirect to `/login`

## Success criteria

- Old HMAC auth code and routes are gone
- Login/signup works via Better Auth
- Protected pages and Zero APIs reject unauthenticated requests
- UI shows name/email instead of login
