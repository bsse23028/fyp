# KidBuddy API reference

Base URL: `http://localhost:4000` (see the README for phones and emulators).

## Conventions

- Bodies are JSON. Send `Content-Type: application/json`.
- 🔒 means a login is needed. Send `Authorization: Bearer <token>`.
- ids are sent and returned as **text** (`"12"`), like the ids the app used before.
- Dates: `"YYYY-MM-DD"` for days. Times are ISO strings in UTC (`"2026-11-11T09:30:00.000Z"`).

### Errors
Every error has the same shape:
```json
{ "error": "A message you can show to the parent.", "details": ["...all problems, for 400 validation errors"] }
```

| Status | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | OK, nothing to send back |
| 400 | The data is wrong (validation, wrong code, wrong old password ...) |
| 401 | Not logged in, wrong token, or the login has ended. The app should go to Log In. |
| 403 | Known, but not allowed (email not verified, account disabled) |
| 404 | Not found, or it belongs to another parent |
| 409 | Already exists |
| 413 | Body too large |
| 429 | Too many tries or too soon. Wait a bit. |
| 500 | Server problem (details only in the server log) |
| 502 | The email could not be sent |

---

## Health

### `GET /health`
Checks that the server and the database work. → `200 {"status":"ok"}`

---

## Auth: `/api/auth`

### `POST /api/auth/signup`
Step 1 of sign-up. It saves the account as *pending* and emails a 6-digit code.
```json
{ "name": "Sara", "email": "sara@example.com", "password": "Secret#123" }
```
Password rules (the same as the app): at least 8 characters, one uppercase letter, one
lowercase letter, one number, one special character, no spaces, and at most 72 characters.

- `201 { "message": "We sent a 6-digit code to your email.", "email": "sara@example.com" }`
- `400` validation · `409` an active account already uses this email

Signing up again before verifying updates the name and password. A new code is sent at most once a minute.

### `POST /api/auth/verify-email`
Step 2 of sign-up. If the code is right, the account becomes active and the parent is **logged in**.
```json
{ "email": "sara@example.com", "code": "123456", "deviceName": "Pixel 7", "platform": "android" }
```
`deviceName` and `platform` are optional.
- `200 { "token": "eyJ...", "user": { "id": "1", "name": "Sara", "email": "sara@example.com" }, "hasPin": false }`
- `400` wrong or expired code · `409` already verified · `429` 5 wrong tries (ask for a new code)

### `POST /api/auth/resend-code`
The "Resend code" link.
```json
{ "email": "sara@example.com", "purpose": "signup" }
```
`purpose` is `"signup"` or `"reset_password"`.
- `200 { "message": "If the email can receive a code, a 6-digit code is on its way." }`. The answer is always the same, for privacy. Only one code is sent per minute.
- `400` validation

### `POST /api/auth/login`
```json
{ "email": "sara@example.com", "password": "Secret#123", "deviceName": "Pixel 7", "platform": "android" }
```
- `200 { "token": "eyJ...", "user": { "id", "name", "email" }, "hasPin": true }`
- `401 { "error": "Incorrect email or password." }`
- `403 { "error": "Please verify your email first...", "needsVerification": true }`. Then call `resend-code`.
- `400` validation

The token lasts `JWT_EXPIRES_IN` (default 7 days).

### `POST /api/auth/logout` 🔒
Ends **this** login on the server. → `204`

### `GET /api/auth/me` 🔒
Use this when the app starts, to restore the session.
→ `200 { "user": { "id", "name", "email" }, "hasPin": true }` · `401`

### `POST /api/auth/forgot-password`
```json
{ "email": "sara@example.com" }
```
→ `200` with the same message as `resend-code`. If the account exists, a code is emailed.

### `POST /api/auth/verify-reset-code`
```json
{ "email": "sara@example.com", "code": "123456" }
```
- `200 { "resetToken": "eyJ..." }`. It works for 15 minutes and only once.
- `400` wrong or expired code · `429` too many wrong tries

### `POST /api/auth/reset-password`
```json
{ "resetToken": "eyJ...", "newPassword": "Brand#New9" }
```
- `200 { "message": "Your password was changed. Please log in with the new password." }`. **Every** login of the account is ended.
- `400` expired or already-used token, the new password was used before, or it breaks the password rules

---

## Account: `/api/account` 🔒

### `PATCH /api/account`
```json
{ "name": "Sara Khan" }
```
→ `200 { "user": { "id", "name", "email" } }` · `400`

### `POST /api/account/verify-password`
Checks the account password. The app uses it before sending the change-password code, and for "Forgot PIN?".
```json
{ "password": "Secret#123" }
```
→ `200 { "valid": true }` or `200 { "valid": false }` · `400` empty

### `POST /api/account/password/send-code`
Emails a code to change the password. No body.
→ `200` · `429` if a code was sent less than a minute ago

### `POST /api/account/password/verify-code`
Checks the code without using it up (step 1 of the screen).
```json
{ "code": "123456" }
```
→ `200 { "valid": true }` · `400` wrong or expired · `429` too many tries

### `PUT /api/account/password`
```json
{ "oldPassword": "Secret#123", "newPassword": "Brand#New9", "code": "123456" }
```
- `200 { "message": "Your password was changed." }`. Other phones are logged out; this one stays logged in.
- `400` wrong old password, the password was used before, a weak password, or a wrong code

### Parent PIN

| Request | Body | Success | Errors |
|---|---|---|---|
| `GET /api/account/pin` | none | `200 { "hasPin": true, "lockedUntil": null }` | |
| `POST /api/account/pin` (first PIN) | `{ "pin": "1234" }` | `201` | `400` not 4 digits · `409` a PIN exists already |
| `POST /api/account/pin/verify` (leave Child Mode) | `{ "pin": "1234" }` | `200 { "valid": true }` or `200 { "valid": false, "attemptsLeft": 3, "lockedUntil": null }` | `404` no PIN yet · `429` locked `{ "lockedUntil": "..." }` |
| `PUT /api/account/pin` (change) | `{ "oldPin": "1234", "newPin": "4321" }` | `200` | `400` wrong old PIN (`attemptsLeft`), same PIN, bad format · `404` · `429` locked |
| `POST /api/account/pin/reset` ("Forgot PIN?") | `{ "password": "Secret#123", "newPin": "2468" }` | `200` (also unlocks the PIN) | `400` wrong password or bad PIN |

After **5 wrong PINs in a row**, the PIN is locked for **5 minutes**. The 5th wrong try answers
`valid: false, attemptsLeft: 0, lockedUntil: "..."`.

---

## Child profiles: `/api/children` 🔒

A **child** object has the same shape as the app's `childSlice`:
```json
{
  "id": "12",
  "name": "Zara",
  "ageBand": "4–6 years",
  "avatar": "rabbit",
  "language": "en",
  "supports": ["Reading"],
  "modules": ["Read-Along", "Phonics"],
  "story": {
    "people":     { "preferredName": "", "mother": "", "father": "", "siblings": [], "others": [{ "name": "Dadi", "relation": "Grandmother" }] },
    "favourites": { "animal": "Cat", "toy": "", "food": "", "colour": "Blue", "character": "", "game": "" },
    "interests":  { "hobbies": ["Drawing"], "place": "Park", "storyTypes": [] },
    "everyday":   { "hometown": "Lahore", "activity": "", "places": [], "routine": "" },
    "notes": ""
  },
  "reading":  { "date": "2026-11-11", "starsToday": 3, "sessions": 1 },
  "activity": { "2026-11-11": { "sessions": 1, "stars": 3 } }
}
```
- `reading` is the **latest** day with Read-Along. Compare `reading.date` with the phone's today, as `ChildHomeScreen` already does.
- `activity` has every day, with all modules added together (used by Parent Progress).

Allowed values come from `GET /api/options`. `ageBand` accepts the label (`"4–6 years"`) or the code (`"4-6"`).

**Ownership:** if `:childId` does not exist **or belongs to another parent**, every route below answers `404 { "error": "Child profile not found." }`.

### `GET /api/children`
→ `200 { "children": [ child, ... ], "activeId": "12" }`. `activeId` is the child chosen most recently, or else the first child. It is `null` when there are no children.

### `POST /api/children`
```json
{ "name": "Zara", "ageBand": "4–6 years", "avatar": "rabbit", "language": "en",
  "supports": [], "modules": ["Read-Along"], "story": { ... } }
```
Only `name` and `ageBand` are required. Defaults: avatar `rabbit`, language `en`, supports `[]`,
modules = every module with `onByDefault` (the same as `defaultModules()` in the app), and an empty story.
- `201 { "child": { ... } }`
- `400` validation, or an unknown age band, avatar, language, support or module. Nothing is saved.

### `GET /api/children/:childId`
→ `200 { "child": { ... } }` · `404`

### `PATCH /api/children/:childId`
Send only the fields that change. `supports`, `modules` and `story` **replace** the whole list or story.
```json
{ "avatar": "wolf" }
{ "story": { ...the full story... } }
```
→ `200 { "child": { ... } }` · `400` (including an empty body) · `404`

Story limits: 100 characters per answer, up to 20 items per list, notes up to 1000 characters.
Empty answers are not saved. A relationship from the list is stored as a link to `relations`; one the parent typed is stored as text.

### `DELETE /api/children/:childId`
Deletes the child **and everything that belongs to it** (progress, story, struggle words, custom topics). → `204` · `404`

### `POST /api/children/:childId/select`
"Continue as Zara" (enter Child Mode with this child). → `200 { "activeId": "12" }` · `404`

---

## Progress 🔒

### `POST /api/children/:childId/sessions`
Call this when a Read-Along session finishes (`ReadingSummaryScreen`).
```json
{
  "clientSessionId": "3f1c7a2e-6b1d-4b8e-9d55-2f1e0c9a7b11",
  "stars": 3,
  "topicId": "animals",
  "level": "easy",
  "language": "en",
  "sessionDate": "2026-11-11"
}
```
- `clientSessionId`: a UUID made by the app **once per session**. If the request is retried with the same id, the stars are **not** added twice.
- `topicId`: a built-in topic or one of this child's custom topics. `level`: `easy`, `medium` or `hard`.
- `language` (optional, default `en`): `en` or `ur`.
- `sessionDate` (optional): the **phone's** today, so streaks follow the child's time zone. It must be within 2 days of today. If it is missing, the server uses today in UTC.
- `stars`: a whole number from 0 to 100.

Responses:
- `201 { "duplicate": false, "reading": { ... }, "activity": { ... } }`
- `200 { "duplicate": true, ... }` when the session was already saved
- `400` validation, or an unknown topic or level · `404`

### `GET /api/children/:childId/progress`
→ `200 { "reading": { "date", "starsToday", "sessions" }, "activity": { "YYYY-MM-DD": { "sessions", "stars" } } }`

---

## Struggle words 🔒

### `GET /api/children/:childId/struggle-words?language=en`
`language` is optional (`en` or `ur`). The most-missed words come first.
```json
{ "words": [ { "word": "lightning", "count": 3, "topic": "Weather", "topicId": "weather", "language": "en", "lastMissedAt": "2026-11-11T09:30:00.000Z" } ] }
```
`400` unknown language · `404`

### `POST /api/children/:childId/struggle-words`
```json
{ "word": "lightning", "topic": "Weather", "language": "en" }
```
`topic` (optional) can be a topic id (`"weather"`) or a title (`"Weather"`). The same word
again, in any upper or lower case, adds 1 to its count.
- `201 { "word": { ... "count": 1 } }` for a new word · `200 { "word": { ... "count": 2 } }` when counted again
- `400` missing or too-long word, unknown topic, or unknown language · `404`

---

## Reading 🔒

### `GET /api/reading/topics`
### `GET /api/reading/topics?childId=12`
The Read-Along content, in the **same shape as `readingTopics.json`**. With `childId`, the
child's own custom topics are added at the end.
```json
{
  "levels": [ { "id": "easy", "label": "Easy", "stars": 1, "tint": "sagePale", "color": "sage" }, ... ],
  "topics": [
    {
      "id": "animals", "title": "Animals", "icon": "🐶", "tint": "bluePale", "isCustom": false,
      "levels": {
        "easy": [
          { "words": ["The","cat","sat","on","the","mat."], "focus": 1,
            "ur": { "words": ["بلی","چٹائی","پر","بیٹھی۔"], "focus": 0 } }
        ],
        "medium": [ ... ], "hard": [ ... ]
      }
    }
  ]
}
```
`focus` counts from **0**, as in the app (`null` = no glowing word).
`401` · `404` if `childId` is not this parent's child

### `POST /api/children/:childId/topics`
Saves a custom (personalised) topic that **only this child** sees.
```json
{
  "title": "Zara at the park", "icon": "🌳", "tint": "sagePale",
  "levels": {
    "easy": [
      { "words": ["Zara","runs","fast."], "focus": 0, "ur": { "words": ["زارا","تیز","دوڑتی","ہے۔"], "focus": 0 } }
    ]
  }
}
```
Rules: at least one level (`easy`, `medium` or `hard`), 1–20 sentences per level, 1–40 words per sentence, single words only (punctuation may stay attached), and `ur` is required for every sentence.
- `201 { "topic": { "id": "custom-<uuid>", ..., "isCustom": true } }`
- `400` validation · `404`

---

## Options (public)

### `GET /api/options`
Every choice list the forms need, read from the lookup tables:
```json
{
  "languages":  [ { "code": "en", "name": "English", "nativeName": "English", "isRtl": false }, ... ],
  "ageBands":   [ { "code": "4-6", "label": "4–6 years", "minAge": 4, "maxAge": 6 }, ... ],
  "avatars":    [ { "code": "panda", "name": "Panda" }, ... ],
  "supports":   [ { "code": "reading", "name": "Reading" }, ... ],
  "modules":    [ { "code": "read-along", "name": "Read-Along", "sensor": "Mic", "isAvailable": true, "onByDefault": true, "supports": ["Reading"] }, ... ],
  "relations":  [ { "code": "grandmother", "name": "Grandmother" }, ... ],
  "storyFields":[ { "code": "preferred_name", "section": "people", "label": "Preferred name", "isMulti": false, "hasRelation": false }, ... ],
  "readingLevels": [ { "id": "easy", "label": "Easy", "stars": 1, "tint": "sagePale", "color": "sage" }, ... ]
}
```

---

## Which app function uses which endpoint

| App (today) | Endpoint |
|---|---|
| `startSignUp` | `POST /api/auth/signup` |
| `finishSignUp` | `POST /api/auth/verify-email` |
| `resendCode` | `POST /api/auth/resend-code` |
| `logIn` / `logOut` | `POST /api/auth/login` / `POST /api/auth/logout` |
| restore session at start-up | `GET /api/auth/me` |
| `startPasswordReset` / `verifyResetCode` / `resetPassword` | `forgot-password` / `verify-reset-code` / `reset-password` |
| `updateName` | `PATCH /api/account` |
| `checkPassword` | `POST /api/account/verify-password` |
| `sendChangeCode` / `verifyChangeCode` / `changePassword` | `password/send-code` / `password/verify-code` / `PUT /api/account/password` |
| `pin` (exists?) | `GET /api/account/pin` |
| `savePin` (first PIN) | `POST /api/account/pin` |
| `checkPin` | `POST /api/account/pin/verify` |
| `changePin` | `PUT /api/account/pin` |
| PinModal "Forgot PIN?" (`checkPassword` + `savePin`) | `POST /api/account/pin/reset` |
| `loadChildren` | `GET /api/children` |
| `addChild` / `updateChild` / `deleteChild` | `POST` / `PATCH` / `DELETE /api/children/...` |
| `enterChildMode` | `POST /api/children/:childId/select` |
| `addReadingResult` | `POST /api/children/:childId/sessions` |
| `reportStruggleWord` / `state.english.struggleWords` | `POST` / `GET /api/children/:childId/struggle-words` |
| `saveCustomTopic` / `selectAllTopics` | `POST /api/children/:childId/topics` / `GET /api/reading/topics?childId=` |
| `childOptions.js`, `AVATARS`, `RELATIONS`, `LEVELS` | `GET /api/options` |

`childMode`, `topicId`, `level`, the language toggle, the intro flag and the phone's
camera and microphone permissions stay **on the phone**. They are not stored on the server.
