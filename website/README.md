# KidBuddy – website

The web version of the KidBuddy mobile app: the same parent account, the same child profiles and the
same progress, in a browser on a desktop, laptop, tablet or phone. The mobile app (`fyp/` root:
`App.js`, `src/`, `assets/`) and its backend (`fyp/backend`) are **unchanged**; everything for the website
lives in this folder.

```
               ┌──────────────────────┐
  phone app ───┤                      │
 (Expo, Bearer │  shared KidBuddy API │──► MySQL / MariaDB (01_schema.sql + 02_seed.sql)
  token)       │  fyp/backend  :4000  │    accounts · children · progress · PIN · topics
               └──────────▲───────────┘
                          │ Bearer token (added by the gateway)
               ┌──────────┴───────────┐
  browser ─────┤ website backend      │  httpOnly cookie session · CSRF · rate limits ·
  (React)      │ website/backend :5050│  security headers · serves the built website
               └──────────────────────┘
```

## 1. Architecture

**Why a gateway and not a second API?** The shared API already holds all the business rules (password
rules, 6-digit email codes, PIN lockout, child ownership, idempotent reading sessions …) and is used by
the phone. Copying those rules would let the two drift apart, so the website backend **reuses the shared
API** and adds what a browser needs on top:

- the login lives in an **httpOnly cookie** (`kb_session`) instead of JavaScript, so page scripts can never
  read it; the 15-minute password-reset token gets its own httpOnly cookie
- **CSRF protection** (double-submit token + Origin check), **rate limits** and **security headers** (CSP …)
- an **allow-list** of API paths, request shape checks and the same `{ error }` answers as the API
- web logins are recorded with `platform: "web"`, so they show up as web sessions in `user_sessions`
- in production it **serves the built website** (one origin, no CORS needed)

Details and every endpoint: [`backend/docs/API.md`](backend/docs/API.md) (and `GET /web-api/docs`, OpenAPI).

**Frontend:** React 18 + React Router 6, built with Vite, **plain JavaScript** like the app. State lives in
four small React contexts that mirror the app's Redux slices and hooks, so the pages use the same functions
as the app's screens (`useAuth().logIn`, `useChild().addChild`, `enterChildMode`, `addReadingResult` …):

| Website | Mobile app equivalent |
|---|---|
| `context/AuthContext.jsx` | `app/store/authSlice.js` + `app/context/AuthContext.js` |
| `context/ChildContext.jsx` | `childSlice` + `useChild` + `useChildOptions` + `previewSlice` + `englishSlice` + `alphabetSlice` |
| `context/LanguageContext.jsx` + `i18n/` | `LanguageContext` + `shared/i18n` (the app's Urdu, merged, + website words) |
| `context/UIContext.jsx` | `Alert.alert` (pop-ups, confirm, toasts) |
| `services/api.js` | `shared/api/client.js` (cookies + CSRF instead of a token) |
| `services/audio.js` | `speech.js`, `sounds.js`, `backgroundMusic.js` (Web Speech API + the app's sound files) |
| `styles/tokens.css` | `shared/theme/theme.js` `COLORS` / `CALM` / `CALM_ACCENTS` / `RADIUS` / `SIZES` |
| `layouts/Layouts.jsx` | `FixedHeader` + `AppHeader` + `Screen` + `ParentDrawer` + `ChildHeader` |

## 2. Technologies

| Part | Uses |
|---|---|
| Frontend | React 18, React Router 6, Vite 6, Vitest, `@mdi/js` (the same Material Design icons the app uses) |
| Backend | Node.js ≥ 20, Express 5, helmet, cookie-parser, express-rate-limit, dotenv; Jest + supertest |
| Data | the shared API (`fyp/backend`: Express + MySQL 8 / MariaDB 10.4+) |
| Design | the app's palette, Nunito / Inter / Noto Nastaliq Urdu (Google Fonts), the app's buddy art, letter art, sounds and letter-story videos (`frontend/public/media`) |

## 3. Folder structure

```
website/
├── README.md                   this file
├── backend/                    the web gateway
│   ├── .env.example            every setting (copy to .env)
│   ├── docs/API.md             what the gateway adds + all endpoints
│   ├── src/
│   │   ├── server.js · app.js  start-up · middleware order
│   │   ├── config/             settings from .env
│   │   ├── routes/             authRoutes (login, logout, me, reset) · proxyRoutes (allow-listed forward)
│   │   ├── services/           upstream (calls the shared API) · session (cookies)
│   │   ├── middleware/         csrf · validate · errorHandler
│   │   ├── docs/openapi.js     served at /web-api/docs
│   │   └── utils/HttpError.js
│   └── tests/gateway.test.js   16 tests against a fake shared API
└── frontend/
    ├── .env.example · index.html · vite.config.js (dev proxy /api → backend)
    ├── public/media/           avatars, letter + word art, sounds, ABC song, letter videos
    └── src/
        ├── main.jsx · App.jsx  providers · every route + guards
        ├── layouts/            the frames: marketing, auth split, setup, Parent sidebar shell, Child Mode bar
        ├── components/         ui (buttons, fields, cards, tiles …), PinModal, forms, Icon, Modal …
        ├── context/            Auth · Child · Language · UI
        ├── services/           api · audio
        ├── pages/public|auth|parent|child|english/
        ├── data/               the app's data: alphabet, trace strokes, reading topics, story options …
        ├── i18n/               translate.js + ur.json
        ├── utils/              validation, progress, start page, storage helpers
        ├── styles/             tokens, global, layouts, pages, english
        └── logic.test.js       14 tests of the shared rules
```

## 4. Look: the Figma design ("KidBuddy Web App Extension")

The website follows the Figma file the team made for the web app, **except** for anything that the
mobile app does not have (those parts of the Figma are left out on purpose; see the list below).

- **Tokens** (`styles/tokens.css`): indigo `#4F46E5` for actions (hover `#3730A3`, pale `#EEF2FF`),
  ink `#172033`, muted `#667085`, lines `#E6E9EF`, page `#F7F8FC`; the colour-blind-safe category colours
  sky `#0072B2`, gold `#E69F00`, mint `#009E73`, rose `#CC79A7`; the child palette (`--ch-*`: purple, blue,
  sun, leaf, coral, cream `#FFFAF0`). Inter for the parent side, Nunito for the child, Noto Nastaliq Urdu
  for Urdu. 12 px radius on controls, 16 px on cards, 48 px fields and big buttons.
- **Entry flow** (`styles/entry.css`, `components/EntryArt.jsx`): the splash (once per browser), Welcome
  (sofa illustration + "Practise together. Grow every day.", Get Started / Log In, the three promises),
  the 3-step intro with its own illustration per step, Log in and Create account (value panel on the left,
  white card on the right), and the code / forgot / new-password pages as one centred card.
  The illustrations use the real KidBuddy bunny.
- **Parent shell** (`layouts/Layouts.jsx`): 264 px sidebar (Open Child Mode, Dashboard, My Children, Plan
  with Struggle words under it, Progress, Settings; language switch, you, Log Out) and a 72 px top bar
  (breadcrumb, a child switcher that sets the child the Dashboard, Progress and Struggle words show, your
  initials). Under 1024 px the sidebar becomes a slide-in drawer.
- **Dashboard:** stat cards with icon tiles, "Family overview / Your children" cards (streak, activities,
  this week's bars, View progress / Edit profile), "Add another child", and a side column.
- **Settings:** the Figma two-pane layout (section list + one section at a time, `#account`, `#safety` …).
- **Child Mode:** the Figma top bar (Back · Home pills, the buddy logo, sound, language, 🔒 Parent Exit),
  cream background, "Who's playing?" cards (tap a card to start), Child Home with the greeting panel on the
  left and the module tiles + quick start on the right; English hub rows as white cards.

**In the Figma but not in the app, so NOT built:** "Remember me", the terms tick box and confirm-password on
sign-up, demo login hints, a reset *link* (the app uses a 6-digit code), setting the PIN as a sign-up step,
therapist targets / reading material / routine builder / AAC editor pages, recent activity, notifications
bell, text-size and high-contrast settings, the Talk Board and the other child modules (Numbers, Feelings,
Talk, My Day, Sounds stay "Coming soon").

## 5. Pages (every app screen has a web page)

| Area | Pages |
|---|---|
| Public | Splash (once) + Welcome · the 3-step intro · Not found |
| Auth | Log in · Sign up (live password rules) · Verify email (6-digit code, resend) · Forgot password · Reset code · Set a new password · Log out (Settings) |
| First steps | Permissions (browser camera / microphone prompt, asked once per browser) · Create child profile |
| Parent Mode | Dashboard (stats, chosen child + week chart, children with ⋯ View progress / Edit / Delete, next steps, struggle words, Explore = Preview) · Children (a card per child) · Plan · Progress (child picker, sessions / stars / streak / letters, Read Along chart 7 days / 4 weeks, alphabet stars per letter, activities) · Settings (account, children, language, PIN, permissions, sound / animations, log out) · My account (name) · Change password (old password + email code) · Update PIN · Child profile with tabs Overview / Basics / Areas of support / Activities / Stories (5 steps) and Delete profile · Struggle words |
| Child Mode | Who's playing? · Child Home (greeting, stars today, quick start, 6 modules) · My Buddy · 🔒 Parent (PIN, Forgot PIN?) · Preview banner |
| English | Hub · Alphabets (26 letters, stars) · Letter lesson (Look · Listen ×2 · Say · Play: drag-to-picture, bubbles, big & small · Star Check · Result) · Trace letters (capital + small, stroke by stroke) · Letter games (Bubble pop, Match pairs) · Letter stories (videos) · Words → Spelling (letters, then the sentence) · Sentences = Read Along (topics → level → Reading Time with word highlighting → Your turn → Nice reading!, saved on the server) |

**Everything shown comes from real data:** children, progress, stars, streaks, struggle words and Read Along
topics come from the shared API; the form choice lists (age bands, languages, buddies, areas of support,
activities, relations) come from `GET /api/options` and a form waits for them (with Try again) instead of
using a built-in copy. The activities a parent switches on for a child decide what that child sees in Child
Mode (`src/utils/modules.js`): a switched-off area or English section is hidden, and a saved link to it goes
back to the hub. Only Preview mode ("Explore KidBuddy") uses the built-in demo child and topics.

**Same rules as the app:** the site always opens in Parent Mode; Child Mode can only be left with the Parent
PIN (it survives a page refresh, and Parent pages redirect back to Child Mode); Preview mode saves nothing;
English / اردو switches every page and flips it right-to-left.

## 6. Install and run (development)

You need **Node.js 20+** and **MySQL 8 or MariaDB 10.4+**.

### 6a. The database and the shared API (once)

```bash
cd fyp/backend
cp .env.example .env        # fill in DB_USER / DB_PASSWORD and a long random JWT_SECRET
```
Import the schema and the seed (phpMyAdmin, or the command line):
```bash
mysql -u root -p < database/01_schema.sql
```
```bash
mysql -u root -p kidbuddy < database/02_seed.sql
```
```bash
npm install && npm run migrate
```

### 6b. Run (three terminals)

```bash
cd fyp/backend && npm start                  # shared API  → http://localhost:4000
```
```bash
cd fyp/website/backend && npm install && cp .env.example .env && npm run dev   # gateway → http://localhost:5050
```
```bash
cd fyp/website/frontend && npm install && npm run dev                          # website → http://localhost:5173
```

Open **http://localhost:5173**. With `EMAIL_MODE=console` (the API's default) the 6-digit codes for sign-up,
password reset and password change are **printed in the shared API's terminal**.

> macOS uses port 5000 for AirPlay, which is why the gateway defaults to **5050**.

## 7. Environment variables

**`website/backend/.env`** (see `.env.example`)

| Name | Default | Meaning |
|---|---|---|
| `PORT` | `5050` | port of the gateway |
| `NODE_ENV` | `development` | `production` = Secure cookies by default + serves `frontend/dist` |
| `KIDBUDDY_API_URL` | `http://127.0.0.1:4000` | the shared API (`fyp/backend`) |
| `UPSTREAM_TIMEOUT_MS` | `15000` | give up on the shared API after this long |
| `ALLOWED_ORIGINS` | `http://localhost:5173,…` | sites allowed to send POST / PUT / PATCH / DELETE |
| `SESSION_COOKIE_NAME` | `kb_session` | name of the login cookie |
| `SESSION_DAYS` | `7` | cookie lifetime (the API's `JWT_EXPIRES_IN` still decides when the login ends) |
| `COOKIE_SECURE` | `true` in production | cookies only over HTTPS; also turns on HSTS + upgrade-insecure-requests |
| `FRONTEND_DIST` | `../frontend/dist` | the built website to serve |
| `TRUST_PROXY` | `0` | set to `1` behind nginx / a hosting proxy, so rate limits see the real IP |

**`website/frontend/.env`** (optional, see `.env.example`)

| Name | Default | Meaning |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:5050` | where the dev server sends `/api` and `/web-api` |
| `VITE_DEMO_CODES` | `false` | set `true` only when the shared API runs with `EMAIL_MODE=console`: then the code screens say the code is printed in its terminal |

**`fyp/backend/.env`** – the shared API's own settings (database, `JWT_SECRET`, `EMAIL_MODE=console|smtp`,
SMTP …), unchanged; see `fyp/backend/.env.example`. No API URL, password or secret is hard-coded in the website.

### 7a. Real emails for the 6-digit codes (SMTP)

The shared API can send the codes for sign-up, forgot password and change password by real email.
Use `EMAIL_MODE=smtp` instead of `console`. Put these lines in `fyp/backend/.env`, or in a private file
outside the repository:

```
EMAIL_MODE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.address@gmail.com
SMTP_PASS=yourapppassword16
EMAIL_FROM="KidBuddy <your.address@gmail.com>"
```

- **Gmail needs an App password, not the normal password.** Turn on 2-Step Verification, open
  https://myaccount.google.com/apppasswords, create one named "KidBuddy" and paste its 16 letters without spaces.
- Quote `EMAIL_FROM` (the `<` would break a shell). Restart the shared API after changing these settings.
- `VITE_DEMO_CODES` is `false` by default, so the website does not say the code is in the terminal.
- Never commit the file that holds `SMTP_PASS`. The repository's root `.gitignore` does not ignore `fyp/backend/.env`.
- If Gmail says `535 Username and Password not accepted`, the password is not an app password, or it has a typo.

## 8. API and database configuration

- The website never talks to the database directly. The shared API does, with its own `.env`.
- Point the gateway at the API with `KIDBUDDY_API_URL`. In development the Vite dev server proxies
  `/api` and `/web-api` to the gateway, so the browser only sees one origin.
- The database is the one in `fyp/backend/database` (`01_schema.sql`, `02_seed.sql`, `migrations/`). The
  website needs **no new tables**: an account made on the website logs in on the phone and the other way round.

## 9. Production

```bash
cd fyp/website/frontend && npm run build          # → website/frontend/dist
```
```bash
cd fyp/website/backend && NODE_ENV=production npm start
```
The gateway then serves the website and the API on one port. Put it behind HTTPS (nginx, Caddy, a hosting
provider) with `TRUST_PROXY=1`, set `ALLOWED_ORIGINS` to your domain, and keep the shared API reachable
only from the gateway / the phone app.

## 10. Testing

```bash
cd fyp/website/backend && npm test        # 16 gateway tests (cookies, CSRF, allow-list, reset token, forwarding)
```
```bash
cd fyp/website/frontend && npm test       # 14 logic tests (validation, Urdu file, progress maths, Star Check …)
```
```bash
cd fyp/backend && npm test                # the shared API's own 90 tests (needs TEST_DB_NAME)
```

**Checked end to end in a browser** (website + gateway + shared API + MariaDB): sign up → wrong / right email
code → permissions → create child (saved in MySQL) · log in (wrong / new password) · log out (protected
pages redirect) · forgot password → code → refuses a reused password → new password · Child Mode (refresh and
`/parent` stay locked) · create PIN, wrong PIN ("4 tries left"), exit with PIN · Read Along session saved once
(`activity_sessions`, 3 stars) and shown on Child Home / Parent Home / Progress · "That was tricky" → struggle
word in the database and on the Struggle words page · letter lesson (drag, bubbles, tap-to-move, Star Check →
3 stars) · tracing · both games · spelling + sentence · letter video · edit basics, personalize stories,
change password with email code, update PIN, delete child · Preview mode + exit with PIN · Urdu / RTL on
every page · 375 px phone layout without sideways scrolling · production build served by the gateway.

## 11. Differences from the app, and why

| Topic | Website | Reason |
|---|---|---|
| Google / social sign-in | **not offered** | the app and the shared API only support email + password (+ email codes); adding Google would need a new API endpoint and OAuth credentials. The login page is ready for it if the API adds it. |
| Recorded phonics clips | the browser voice says the letter sounds | the Phonicademy clips' licence forbids publishing them as standalone files, which a website would do. The app also falls back to the voice for a missing clip. |
| Alphabet stars, A / a choice | saved in this browser (`localStorage`) | the app also keeps them only on the phone (`alphabetSlice.recordLetterResult` is the future backend swap point). Reading sessions, stars and streaks ARE shared. |
| Permissions | the browser's own camera / microphone prompt | a website cannot open phone settings |
| "That was tricky" (Your turn) | reports the glowing word as a struggle word | uses the existing `POST /struggle-words` endpoint the app prepared for its future speech check, so the Struggle words page has real data |
| Spelling words without art | show the word's emoji | the app shows the buddy; an emoji is clearer on a big screen (the buddy is used when no emoji exists) |
| Sound and animations switches | Settings → Sound and motion | the app keeps these switches in code; the website lets the parent change them |
| Voice / Urdu voice | depends on the browser's installed voices | the Web Speech API; without an Urdu voice the words still light up on their own timer |

Urdu written for the website (about 250 strings, added to `frontend/src/i18n/ur.json`) needs a
native-speaker review, like the app's Urdu.
