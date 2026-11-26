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
| Design | the app's palette, Nunito / Inter / Noto Nastaliq Urdu (Google Fonts), the Cuddle Pals buddy art (11 soft round buddies, same ids as the app), letter art, sounds and letter-story videos (`frontend/public/media`) |

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
- **Parent Mode design tokens and shell** (`styles/tokens.css`, `layouts/Layouts.jsx`, `App.jsx`): Inter only at 400 / 600 / 700 (that is all that is
  loaded), secondary text 14.5px and small print 13px (nothing smaller), one colour per measure everywhere (Sessions indigo, Stars green,
  Streak amber, Letters blue), card shadow `--shadow-card` and menu shadow `--shadow-menu`, 44px tap targets (sidebar language switch, breadcrumb,
  text links get a 44px tap area). The top-bar child switcher shows only on pages about one child (a profile, Progress, Struggle words) and always
  shows the child of that page; choosing another child opens the same page for them. Every Parent Mode page sets its own tab title
  ("Zara · Activities · KidBuddy"). The sidebar account button shows your email.
- **Parent Dashboard, My Children, child profile (Parents module batch 2)**: the Dashboard answers "how is my child doing, what next?": a child
  chooser (2+ children), the week card ("Zara practised on 5 of the last 7 days", last practised, streak, Open Child Mode / View progress, the 7
  days with names), three numbers for the chosen child, Next steps, a short "Your children" list, "Words to practise", and a slim dismissible
  "New here?" bar at the bottom (Letters learned lives on Progress only). My Children cards all have the same three parts (who, this week in one
  line, Open Child Mode + Progress + Edit profile). On phones a child's profile shows a section picker instead of the five tabs, and the
  Overview cards read as one list.
- **Progress, Plan, Struggle words, Settings, Account, Add a child (Parents module batch 3)**: Progress has one child chooser, three numbers
  (Sessions, Stars, Day streak), the Read Along calendar, "Activities {name} can use" (the built ones), a Letters card marked "This device only"
  (the 26-letter grid only when something is saved in this browser) and one "On the way" line (unfinished activities, badges, a therapist report).
  Plan shows Struggle words as one row with a count and folds the unfinished tools into "{n} more planning tools are on the way". Struggle words
  has a labelled "Say it" button. Settings: the Account pane also has the Parent PIN (Update / Create), the Therapist section and the
  time-limit / reminders rows are one grey "on the way" line; My account has the PIN row too. Add a child: "Choose a buddy" as an even grid of six.
  Form inputs get a 4px focus ring and Parent Mode form actions sit at the end (Cancel, then the main action).
- **Parent Mode compact scale** (end of `styles/pages.css`): from 641px up, Parent Mode and the first-child setup are a step smaller (body 15px, secondary
  13.5px, small 12px, page title 24px, buttons 38px, inputs 42px, sidebar 240px, top bar 60px, radius 10 / 14). Phones keep the larger touch sizes.
  Child Mode, Welcome, intro and Log in are not touched.
- **Child Mode calm scale** (Child audit C1, C4, C5, C6, C7): top bar 72px with 48px controls; the Preview banner is #6B4700 on #FFF3D6 with a 44px "Exit preview"; child text sizes `--k-sm` 15px and `--k-base` 18px and Nunito 700/800 only (no 900, no font loaded for it); the sky backdrop (clouds, sun) is a still picture; A / a switch 56x44, "That was tricky" a 56px button, the Talk sentence strip at least 56px, Read to me 48px, alphabet stars filled vs hollow in darker colours; "Nice reading!" says "You tried every sentence. Great job." and has Read again + Finish. Also built (C3; C2 was undone, Home and the hubs keep their Soon tiles): Reading Time has a bigger passage (up to 60px, calm yellow word with a gold underline), "Sentence n of m", and a Next sentence button (Finish on the last one) beside the microphone; Your turn has I said it and That was tricky side by side.
- **Child Mode compact scale** (end of `styles/english.css`): from 641px up, Child Mode is a step smaller (text 14 / 16 / 20 / 24 / 34px, top bar 64px, controls 44px, smaller tiles and passage). Phones keep the larger touch sizes.
- **Entry flow** (`styles/entry.css`, `components/EntryShell.jsx`, `index.html`): everything before the account exists
  is ONE layout, the Login's: a brand panel on one side and one calm column on the other (a band on top under 1100px).
  No splash screen: the branded loader (logo + thin progress bar, text after 1 s) is in `index.html`, so it paints before
  any script, and `BootScreen` shows the same while the saved login is checked (or a branded "We can't reach KidBuddy" card
  with Try again). Welcome (bunny and kitty, Get started / Log in, therapist "Coming soon" line), the 4-step intro (each step has
  its own panel colour, shapes and picture; the bunny is on every step; Skip jumps to step 4, which has Create my account, Explore
  KidBuddy first, Log in and Back), Log in and Create account (switch on top), the code / forgot / reset pages (same panel, no
  switch) and "page not found" all use it. Every page before sign-up sets its own browser-tab title; the favicon is the new logo mark.
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
| Public | Welcome (+ "Are you a therapist? Coming soon") · the 4-step intro (the last step, "Try KidBuddy first", opens Explore KidBuddy **without an account**) · Not found |
| Auth | Log in · Sign up (one screen with a **Log in \| Create account** switch: a brand panel with the bunny and kitty on the left, the form on the right, no card; below 1100px the panel becomes a band on top; password rules open as you type, "Show" / "Hide" in words, "Logging in…" while it works) · Verify email (6-digit code, resend) · Forgot password · Reset code · Set a new password · Log out (Settings) |
| First steps | Permissions (browser camera / microphone prompt, asked once per browser) · Create child profile (a new child starts with **all activities off**) → **Setup**: "{name}'s profile is ready!" with three optional cards (Areas of support, Activities, Personalize stories) and Skip for now / Finish |
| Parent Mode | Dashboard ("New here?" Explore card until tried or hidden, stats, children cards, next steps, struggle words) · Children · Plan (Therapist targets, Reading material, Struggle words, Routine builder, Talk board pictures, Social stories) · Progress (only what the child is enrolled in: Read Along practice calendar when Read-Along is on, alphabet when Phonics is on, "No activities yet" + Choose activities) · Settings (Account, Children, Language, Parent PIN and privacy incl. Daily time limit, Therapist: Invite / Share (Soon), Sound and motion, Session + credits) · My account (name, password) · Change password · Update PIN · Child profile tabs: Basics · **Areas of support** (3 groups, tick + drop-down of activities, diagnosis guide, offer to switch on matching activities) · **Activities** (Recommended for {name} first) · Stories · Struggle words |
| Child Mode | Who's playing? · Child Home (greeting, stars today, **6 groups** from the FYP proposal: Reading & Writing, Speech Sounds, Feelings & Stories, Numbers, Talk, My Day; only groups with an activity switched on) · group page (Coming soon modules) · My Buddy (11 buddies) · 🔒 Parent (PIN, Forgot PIN?) · Preview banner with a guide sentence for parents |
| Reading & Writing (English) | Hub = proposal Modules 1-5 (Read-Along · Reading Assist: Coming soon · Words & Phonics → Alphabets · Spelling & Letter Sounds → Spelling, Bubble Pop, Match Pairs, Letter stories · Handwriting → Trace letters), each shown only when switched on · Alphabets (26 letters, stars) · Letter lesson (Look · Listen ×2 · Say · Play · Star Check · Result) · Trace letters · Letter stories (videos) · Spelling (letters, then the sentence) · Sentences = Read Along (topics → level → Reading Time → Your turn → Nice reading!, saved on the server) |
| Talk (AAC board) | Sentence strip (Speak, delete last, clear) · 6 quick words · 48 core words that never move (Big: 3 pages of 16, or All: 6 × 8) · 13 topic folders · 202 ARASAAC pictures · English + Urdu voice |

**Same rules as the app (checked against the app's `context.md` and `README.md`, 2026-11-24):** Child Mode shows only the activities switched on in the profile (`src/utils/modules.js`); there is no quick-start bar, every activity has one way in; the app's 11 buddies (the server's `002_rebrand_avatars` migration must be applied: `cd backend && npm run migrate`). The letter lesson, spelling, Bubble pop, Match pairs, Trace and Letter stories follow the app's step-by-step rules (see `DIFFERENCES.md` §2).

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
