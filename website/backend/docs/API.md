# KidBuddy website backend – API

The website backend is a **web gateway** in front of the shared KidBuddy API (`fyp/backend`, the same API
the mobile app uses). It does not have its own database: every account, child profile, progress record,
struggle word and reading topic lives in the shared MySQL / MariaDB database, so the app and the website
always show the same data.

```
browser ──► website backend (this, :5050) ──► shared KidBuddy API (fyp/backend, :4000) ──► MySQL / MariaDB
             cookies · CSRF · rate limits         accounts · children · progress · PIN
             security headers · static files      validation · business rules · emails
```

A machine-readable OpenAPI description is served at **`GET /web-api/docs`**.

## What the gateway adds

| Feature | How |
|---|---|
| **Login in an httpOnly cookie** | `kb_session` (httpOnly, SameSite=Lax, Secure on HTTPS). The page never sees the JWT, so a script injected into the page cannot steal the login. The mobile app keeps using its Bearer token unchanged. |
| **Password-reset token in a cookie** | `verify-reset-code` stores the 15-minute reset token in `kb_reset` (httpOnly, SameSite=Strict, path `/api/auth`); `reset-password` adds it for the page. |
| **CSRF protection** | Double-submit: `GET /web-api/csrf` sets the readable `kb_csrf` cookie; every POST/PUT/PATCH/DELETE must send its value in `X-CSRF-Token`. The `Origin` header is also checked against `ALLOWED_ORIGINS`. |
| **Rate limits** | 30 auth POSTs (log in, sign up, codes, password reset) and 600 API requests per IP per 15 minutes. The shared API has its own code / PIN attempt limits on top. |
| **Security headers** | helmet: Content-Security-Policy (self + Google Fonts), `X-Content-Type-Options`, `frame-ancestors 'none'`, Referrer-Policy, HSTS on HTTPS; `Permissions-Policy` allows only the microphone/camera of this site. |
| **Allow-list** | Only `/api/auth/*`, `/api/account/*`, `/api/children/*`, `/api/reading/topics` and `/api/options` are forwarded; everything else is 404. A browser `Authorization` header is ignored (cookie only). |
| **Device info** | Log in / verify email send `platform: "web"` and the browser's user agent as `deviceName`, so web logins are visible as such in `user_sessions`. |
| **Serves the website** | In production it serves `website/frontend/dist` with an `index.html` fallback for page routes. |

## Gateway endpoints

| Request | Answer |
|---|---|
| `GET /web-api/health` | `200 {"status":"ok","gateway":"ok","api":"ok"}` · `503` when the shared API is down |
| `GET /web-api/csrf` | `200 {"csrfToken":"…"}` and the `kb_csrf` cookie |
| `GET /web-api/docs` | the OpenAPI 3 document |

## Endpoints the gateway handles itself

All bodies are JSON; unsafe methods need `X-CSRF-Token`.

| Request | Body | Answer |
|---|---|---|
| `POST /api/auth/login` | `{ email, password }` | `200 { user, hasPin }` + `kb_session` cookie (no `token` in the body) · `401` wrong details · `403 { needsVerification: true }` |
| `POST /api/auth/verify-email` | `{ email, code }` | `200 { user, hasPin }` + `kb_session` cookie |
| `POST /api/auth/logout` | – | `204`, the login is ended on the API and the cookie deleted |
| `GET /api/auth/me` | – | `200 { user, hasPin }` · `401` (no cookie, or the login ended: the cookie is deleted) |
| `POST /api/auth/verify-reset-code` | `{ email, code }` | `200 { verified: true }` + `kb_reset` cookie |
| `POST /api/auth/reset-password` | `{ newPassword }` | `200 { message }` (every login of the account ends) · `400` no verified code / password used before |

## Forwarded endpoints

Everything else is forwarded unchanged (same bodies, answers and status codes) – see
[`fyp/backend/docs/API.md`](../../../backend/docs/API.md):
sign-up, resend code, forgot password, account name, password change (old password + email code),
Parent PIN (create / verify / change / reset), child profiles (list / create / read / update / delete /
select), reading sessions and progress, struggle words, custom topics, reading topics and the option lists.

## Errors

The same shape as the shared API: `{ "error": "A message you can show", ...extra }`.
Extra gateway statuses: `403 { code: "csrf" }` (missing / wrong CSRF token – the website fetches a new
token and retries once), `502` (the shared API cannot be reached), `504` (it did not answer in time).
