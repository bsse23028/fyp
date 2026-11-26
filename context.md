# KidBuddy – project context for Claude

> **Claude: read this whole file at the start of every session, before touching code.**
> Keep it up to date: at the end of every task, add a line to the **Work log** (bottom) and fix any
> section that is no longer true. Last full update: **2026-11-16**.

---

## 1. What KidBuddy is
- A final-year university project (FYP): a React Native + Expo mobile app for **autistic children
  (toddlers, about 2–5) and their parents**. Calm, predictable, friendly; English + Urdu (RTL).
- Two sides:
  - **Parent Mode** (always opens first after login): children list, progress, plan, settings, PIN.
  - **Child Mode**: Child Home → learning modules (English now; Numbers, Feelings, Talk, My Day,
    Sounds are "Coming soon").
- **Preview mode ("Explore KidBuddy")**: the parent tries Child Mode with a demo child "Buddy". Nothing is saved.
- **Backend** lives in `backend/` (Node, Postgres: `01_schema.sql`, `02_seed.sql`). Auth, children, PIN,
  reading sessions, struggle words and custom topics all come from the backend through Redux.

## 2. The user and how they want me to work (ALWAYS follow)
- The user is a **beginner**. Write simple, beginner-friendly code. Explain in plain words.
- **IGNORE `AGENTS.md`**. It describes TypeScript + Expo Router, which this project does NOT use.
- **Plain JavaScript (.js) only.** React Navigation (native stack), Redux Toolkit. No TypeScript files.
- **Work on the branch the user has checked out (`zunaira` on 2026-11-26). NEVER commit or push**: the user commits themself.
  A merge also creates a commit: only with the user's OK, using `git merge --no-ff --no-commit <branch>`.
- The repo also holds the **website** (`website/`). For anything like "make the app match the website", follow section 2b.
- **Frontend only** unless told otherwise: never touch `backend/`, `01_schema.sql`, `02_seed.sql`, and add no new API calls.
- **Don't disturb working code.** Prefer ADDING files/tokens/components; change old files only where the task needs it.
  Keep Read Along, Parent Mode, Preview mode and the Alphabets lesson working.
- **Comments:** a short plain-words comment block at the top of each file; few comments inside. Styles at the bottom of the file.
  Colours/fonts come from the theme.
- **Tweakable numbers** (sizes, positions, angles, speeds) go in ONE named config file with a comment on each number.
- **All visible text** goes through AppText / `translate()`, with Urdu added to the right `ur.json`. RTL must keep working.
- **All animation** goes through `src/shared/utils/motion.js` (one on/off switch). Use `useNativeDriver: true`
  (transform/opacity only). Only the page on screen may run loops.
- **Packages:** only with `npx expo install <pkg>`, only if really needed, and say which and why.
- **Tasks come in STEPS.** After each step: STOP, list created/changed files, say how to test in **Expo Go**,
  and wait for the user to reply "continue". When everything is done: list all files, update README, and
  say what I was unsure about.
- For a new task: read the relevant files first, then give a SHORT plan, then start.
- The user writes prompts in long structured blocks ("STEP 1 …", "BEFORE CODING …", "WHEN DONE …"), sometimes with typos. Follow them literally.

## 2b. Website ↔ app guide (READ for "reflect the website changes on my app")
The website is Eashal's work (branch `Eashal`, merged into `zunaira` on 2026-11-26). It is React web (`.jsx` + CSS):
its code never runs in the app. Changes are **re-built by hand** in React Native.

**Where things live**
| What | Folder |
|---|---|
| Mobile app (Expo) | `App.js`, `src/`, `assets/`, root `package.json` |
| Website pages and design | `website/frontend/` (its own `package.json`) |
| Website's own server (gateway) | `website/backend/` |
| Shared API + database (both use it) | `backend/` |

Website notes: `website/README.md` (design and pages), `website/DIFFERENCES.md` (written 2026-11-24/25, BEFORE most of the
redesigns, so check the code; its "leave the look different" advice is about the website, not a rule for the app).
In section 11, the log lines that say "website" describe each website change: read them.

**Sync state (update after every port)**
- Last website commit applied to the app: **none yet**. Newest website commit at the merge: `a541921`.
- Ported so far: buddies + header logos (2026-11-26, art of `a541921`). (When porting buddies again, only compare the art and `avatars.js`.) (The website copied the app's flows and logic up to `f97d0e7`, then changed its own design and some behaviour.)

| Area | Status |
|---|---|
| Buddies + header logos ("Cuddle Pals") | ported 2026-11-26 (committed by the user) |
| Child screens and behaviour | partly. Approved: 1-3 Read Along (DONE 2026-11-26; summary says "Nice work. Great job.", not the website's "You tried every sentence", because Next sentence can skip turns) and 4-6 Talk board button sizes, "Good night" greeting 8 pm-5 am, 44pt Preview exit + outline empty alphabet stars (DONE 2026-11-26). 9 instructions in a buddy speech bubble, 10 faded "Coming soon" tiles (user chose: NOT moved to the end), 11 still sun and clouds (all DONE 2026-11-26). NOT decided yet: 7 "Read to me" button, 8 hold-to-mute sound switch, 12 "That was tricky" (new server request from the app) |
| Welcome / intro / login look + new logo | not ported |
| Parent screens | not ported |
| Colours and fonts | not decided: ask the user |

**Steps for a "reflect the website" request**
1. Run `git fetch`. If `origin/Eashal` has commits this branch lacks (`git log HEAD..origin/Eashal`), say so; merge only with the user's OK (rule in section 2).
2. Find what is new. With a commit recorded above: `git diff <that commit> HEAD -- website/`, plus uncommitted edits in `website/`.
   With "none yet": compare the whole website with the app. Also include every area above that is not ported.
3. List the changes in plain words, sorted into copy / adapt / skip, and WAIT for approval. Then port in steps (section 2 rules).
4. Afterwards update the table. Move "Last website commit applied" forward only when every change up to that commit is ported or
   the user chose to skip it (note the skips here), so nothing gets lost.

**Rules while porting:** app rules still apply (plain JS, React Native components, translate all text with Urdu + RTL,
animation through `motion.js`, packages only with `npx expo install`, numbers in config files, no `backend/` or API changes
without asking). Never copy `.jsx` or CSS into `src/`, and never import from `website/` (Metro ignores it): copy art into `assets/`.
Never lose an app feature just because the website lacks it.

**File map** (website paths start at `website/frontend/`, app paths at `src/` unless they start with `assets/`)
| Website | App |
|---|---|
| `public/media/avatars/mascot-*.png`, `logo-*.png` | `assets/images/avatars/` |
| `src/data/avatars.js` | `shared/theme/avatars.js` (`MASCOT_SCALE` = size of every buddy) |
| `public/media/auth/` (logo, bunny, panel art, favicon) | new files in `assets/images/`; used by `shared/components/BrandLogo.js` and the onboarding / auth screens |
| `src/styles/tokens.css` | `shared/theme/theme.js`, `screenColors.js`, `designConfig.js`, `fonts.js` |
| `src/styles/global.css`, `pages.css`, `english.css`, `talk.css`, `entry.css`, `layouts.css` | the styles at the bottom of the matching screen / component |
| `src/components/EntryShell.jsx`, `pages/public/LandingPage.jsx`, `OnboardingPage.jsx` | `screens/onboarding/` |
| `src/pages/auth/` | `screens/auth/` |
| `src/layouts/Layouts.jsx` | `shared/components/FixedHeader.js`, `AppHeader.js`, `ChildHeader.js`, `ParentTabBar.js`, `Screen.js` |
| `src/components/ui.jsx`, `rows.jsx`, `forms.jsx` | `shared/components/` (Button, TextField, ProgressCard, StatTile, AvatarPicker, ChoiceField ...) |
| `src/pages/parent/ParentHomePage.jsx`, `ChildrenPage.jsx` | `screens/parent/ParentHomeScreen.js` + `components/` (the app has no separate Children screen) |
| `src/pages/parent/ParentPlanPage.jsx`, `ParentProgressPage.jsx`, `ParentSettingsPage.jsx` | `screens/parent/` |
| `src/pages/parent/AccountPage.jsx`, `ChangePasswordPage.jsx`, `UpdatePinPage.jsx` | `screens/account/` |
| `src/pages/parent/EditProfilePage.jsx`, `EditSectionPage.jsx`, `PersonalizeStoriesPage.jsx`, `ProfileTabs.jsx` | `screens/profile/` |
| `src/pages/parent/CreateChildPage.jsx`, `ChildSetupPage.jsx`, `pages/child/ProfilePickerPage.jsx`, `MyBuddyPage.jsx` | `screens/child/` |
| `src/pages/parent/StruggleWordsPage.jsx` | `modules/english/screens/StruggleWordsScreen.js` |
| `src/pages/parent/PermissionsPage.jsx` | `screens/permissions/` |
| `src/pages/child/ChildHomePage.jsx`, `LearningGroupPage.jsx` | `screens/home/` |
| `src/pages/english/<Name>Page(s).jsx` | `modules/english/screens/` + `modules/english/components/` |
| `src/pages/talk/TalkBoardPage.jsx` | `modules/talk/` |
| `src/utils/misc.js` (greeting) | `shared/utils/greeting.js` |
| `src/utils/modules.js`, `previewGuides.js` | `screens/home/learningGroups.js` + `shared/utils/childActivities.js`; `app/navigation/previewGuides.js` |
| `src/data/*` (alphabet, spelling, trace, reading, AAC, support guide, story options) | the same names in `modules/*/data/`, `screens/profile/supportGuide.js`, `shared/utils/storyOptions.js` |
| `src/services/audio.js` | `shared/utils/speech.js`, `sounds.js`, `letterAudio.js`, `backgroundMusic.js` |
| `src/i18n/ur.json` | `shared/i18n/ur.json` or the module's `i18n/ur.json` |

**Skip (browser-only):** the sidebar, drawer, breadcrumbs, top-bar child switcher, desktop / tablet layouts and compact scales,
browser tab titles, favicon, HTML boot loader, "page not found", cookies / CSRF (`services/api.js`, `website/backend`),
browser permission prompts, browser-voice workarounds. **Adapt:** use the website's PHONE layout (640px and narrower) as the guide.

**Buddy art:** copy `public/media/avatars/*.png` over `assets/images/avatars/`, then update `ratio` / `logoRatio` from the new
pixel sizes. The app draws mascots at `MASCOT_SCALE` (0.85) because they are wide; ids and names match the server.
The website's auth `panel-art.png` and `logo.png` are cut-outs from a flat picture: ask Eashal for the original art.

## 3. Tech stack (package.json, 2026-11-15)
- **Expo SDK 58** (`expo ~58.0.0`), React Native 0.88.1, React 19.3. Runs in **Expo Go** on a real phone.
- Navigation: `@react-navigation/native` + `native-stack` (NOT Expo Router).
- State: `@reduxjs/toolkit` + `react-redux`.
- Gestures / UI-thread animation (added 2026-11-16, only used by the Spelling game's `LooseLetter`):
  `react-native-gesture-handler ~3.3.0` (v3 HOOKS api: `usePanGesture` + `GestureDetector`; events are flat, `e.translationX`),
  `react-native-reanimated 4.7.1`, `react-native-worklets 0.13.0` (`scheduleOnRN`). No babel.config.js (the Expo preset adds
  the worklets plugin). `App.js` root = `GestureHandlerRootView`. Everything else still uses RN `Animated` via motion.js.
- Video: `expo-video ~58.0.14` (in Expo Go) for the letter stories; `react-native-svg 15.16.0` for tracing.
- Child Home glass look: `expo-blur ~58.0.6`, `expo-linear-gradient ~58.0.4` (both work in Expo Go).
- Storage: `@react-native-async-storage/async-storage` (keys start with `kidbuddy_`, listed in `src/shared/utils/storage.js`).
- Voice: `expo-speech`. Sound effects: `expo-audio` (I added it). Icons: `@expo/vector-icons` (Ionicons; I added it,
  because SDK 58 does not bundle it). Lottie: `lottie-react-native` (I added it). Camera/mic: `expo-camera`.
- Fonts: Nunito (kids' screens), Inter (forms), Noto Nastaliq Urdu.
- Entry: `index.ts` → `App.js`. `tsconfig.json` exists but the app is JS.
- Backend address: `API_BASE_URL` in `src/shared/config.js` is now FOUND AUTOMATICALLY from Expo's
  `Constants.expoConfig.hostUri` (the PC's IP that Expo Go loads from) + `API_PORT` 4000; `USE_FIXED_ADDRESS` /
  `FIXED_ADDRESS` = manual override / fallback. Package: `expo-constants ~58.0.16` (added 2026-11-21). `DEMO_MODE = true`
  (the email code is printed in the backend terminal).

## 4. Folder map
```
App.js                       fonts + providers (GestureHandlerRootView > SafeArea > Redux Provider > Language > Device > Auth > Header > Navigation)
src/app/
  navigation/                AppNavigator.js (all screens; module screens added from src/modules), helpers.js
                             (goToParentHome, goToChildHome, goToProfilePicker(nav, childId), goToProgress ...)
  store/                     store.js, authSlice, childSlice, previewSlice (+usePreview), useChild, useChildOptions, ChildLoader
  context/                   AuthContext (useAuth = thin wrapper over authSlice), LanguageContext, DeviceContext, HeaderContext
src/screens/                 onboarding (Splash, Welcome+WelcomeAlt, Onboarding), auth, permissions, child (ProfilePicker,
                             CreateChildProfile, EditAvatar), home (ChildHome), parent (ParentHome + components/, Plan,
                             Progress, Settings), profile, account
src/modules/                 learning modules; index.js lists them (name, reducer, reducers, load, screens[{name,component,options}], translations)
  english/                   the English module (see section 7); has its own README.md and i18n/ur.json
src/shared/                  components/, theme/ (theme.js, avatars.js, fonts.js), utils/, i18n/ (ur.json + translate.js), api/client.js, config.js
assets/images/avatars/       mascot-<id>.png + logo-<id>.png for the 11 buddies in shared/theme/avatars.js
assets/sounds/               6 generated WAVs (pop, whoosh, boing, sparkle, tada, cheer-bell)
assets/lottie/               README.md only; the user will add Lottie JSON files (none yet)
scripts/makeSounds.js        generates the WAVs: `node scripts/makeSounds.js`
```

## 5. Core architecture (how things fit)
- **Redux** is the direction for ALL new shared state (the user said so). Screens use hooks, not slices:
  `useAuth()`, `useChild()`, `useChildOptions()`, `usePreview()`.
- **Modules plug in** via `src/modules/index.js`: the store picks up `reducer` (+ optional `reducers` map for extra
  slices, e.g. `englishAlphabet`) and `load`; the navigator picks up `screens` (optional `options`, e.g. `{ animation: 'fade' }`).
  PUBLIC DOOR (2026-11-21): `entry` (one screen Child Home opens), `progress(state, childId)` -> { title, done, total, text },
  `parentTools` (Plan cards). App code uses ONLY `moduleEntry` / `selectModuleProgress` (+ `sameProgress` for useSelector) /
  `MODULE_PARENT_TOOLS` and never imports from inside a module folder (checked: no such import left).
- **App areas** (2026-11-21): `src/screens/<area>/index.js` lists that area's screens (`SCREENS`); `src/screens/index.js` =
  `APP_SCREENS`; AppNavigator registers APP_SCREENS + MODULE_SCREENS and imports no screen itself. New screen = one line in its area index.
- **Header:** ONE `FixedHeader` above the navigator. `<Screen mode="child|parent" onMenuPress background>` tells it what to show.
  Child Mode header: logo (tap = My Buddy), 🏠, 🔒 Parent (PIN). Parent Home has a ☰ (HeaderContext keeps the handler in a ref).
- **Translations:** `AppText` translates its string children; `translate(text, params)` for non-Text; `{name}` patterns.
  Module strings go in the module's `i18n/ur.json`. `getCurrentLanguage()` exists in translate.js.
- **RTL:** `useDirection()` gives `directionStyle`; set again inside Modals. Lesson rows that must stay LTR use `direction: 'ltr'`.
- **Preview mode** (`app/store/previewSlice.js`, `usePreview()`): ONE switch, checked in 3 places:
  1. `useChild()`: the demo child (`shared/utils/demoChild.js`) becomes the active child, and every save is a no-op that reports success;
  2. `condition: notInPreview` on every child-data thunk (no network);
  3. the English selectors use the built-in `readingTopics.json`.
  Not persisted; switched off by logout, an expired login, and focusing Parent Home. The yellow `PreviewBanner` has
  "Exit preview" (asks the PIN when the parent has one).
- **Colours (rebrand 2026-11-20):** `PALETTE` in `theme.js` = the user's KidBuddy palette (Lavender Mist bg, Blush Peach,
  Soft Pink, KidBuddy Purple #8A33CF, Coral, Mint, Sunny, pastels, Deep Plum text). EVERY other token (`COLORS`, `CALM`,
  `CALM_ACCENTS`, `CALM_SUCCESS`, `GLASS`, shadows) points at PALETTE. `BUTTON` = filled main buttons (Coral Deep, because white
  on light coral is hard to read). `COLORS.background` = page bg (Screen.js + AppNavigator); `COLORS.white` = cards/header.
  RULE from the user: backgrounds are NEVER dark; one background per screen; at most 2-3 pastel tiles in view.
  Step 2 done: KidScene skies use PALETTE (day/lesson = lavender + mint hills, spelling = blush peach, sunset = soft
  pink/peach), Child Home shapes mint/peach/yellow, games, spelling, tracing, header lines, toggle. Left on purpose:
  `storyOptions.js` colour choices (real named colours), letter PNG art, eye whites.
  Step 3: `shared/theme/screenColors.js` = ONE list: route name -> { page, header } (Lavender Mist main, Blush Peach
  log-in/welcome-back/ProfilePicker, Soft Pink top bar on detail screens, scene screens: the bar = the sky top).
  Screen.js uses `page` unless a `background` prop is given; FixedHeader/AppHeader + the Android status bar use `header`.
  `COLORS.heading` / `CALM.heading` = purple for big titles (globalStyles.heading uses it). SoftShapes = mint/peach/pink.
- **Calm design tokens** in `theme.js`: `CALM`, `CALM_RADIUS`, `CALM_SPACING`, `CALM_SIZES`, `CALM_SHADOW`, `CALM_ACCENTS`
  (letter colours), `CALM_SUCCESS`. The old tokens (`COLORS` …) stay for older screens. Tap targets ≥ 56.
- **Motion** `shared/utils/motion.js`: `ANIMATIONS_ENABLED` / `setAnimationsEnabled`; `motion.timing/spring/loop/sequence/parallel/delay/call`
  (off = instant, loops never start); hooks `useEntrance`, `useScaleIn`, `useIdleBob`, `useIdleSway`, `useDrift({active})`,
  `usePulse(active)`, `useFlip(trigger)`; helpers `hop`, `wiggle`, `wiggleRotate`, `pressIn/pressOut`, `animateVisibility`.
  A future parent "sensory settings" screen should connect to these switches.
- **Speech** `shared/utils/speech.js`: `speak` (English teaching voice, slow), `speakUi` (selected language),
  `speakAsync` (a promise with a fallback timer), `cheer()` (a random happy phrase, pitch 1.5, never the same twice in a row),
  `stopSpeaking`, `SPEECH_ENABLED`. It also obeys the sound master switch.
- **Sounds** `shared/utils/sounds.js`: `playSound(name)`, `SOUND_ENABLED` (the master switch: it mutes effects AND the voice),
  `SOUND_FILES` list. A new effect stops the previous one. There is no "wrong" sound, ever.
- **Letter sounds** `shared/utils/letterAudio.js` (expo-audio): RECORDED phonics clips (Phonicademy pack, `assets/audio/*.mp3`,
  mapped in `modules/english/data/letterAudio.js`; a.mp3 ... z.mp3, q uses qu.mp3; c.mp3 and k.mp3 are the same recording). `playLetterSound(letter, onDone)`
  (onDone always fires once), `playLetterSoundAsync`, `stopLetterSound`, `startHoldSound` / `stopHoldSound` (token-guarded repeats),
  `preloadLetterSounds`, `releaseLetterSounds`. One clip at a time, stops the voice first, respects sound-off, falls back to
  expo-speech (`soundSpeech`) for a `null` / broken clip. The module registers its files with `configureLetterAudio()` in
  `modules/english/index.js`. Letter NAMES stay TTS. A DELETED mp3 breaks the bundle (static require): test the fallback with `a: null`.
  Used by: Look (3 hops), Listen ("A says" + clip + "like apple."), Say (3x, `sound` helper of useLessonSequence), Spelling
  (hold-repeat, `HOLD_*` in spellingConfig; `SPELLING_DROP_AUDIO`). Play / Star Check only use letter names. Licence: the clips
  must not be published as standalone files (public repo). Credits line in Parent Settings.
- **Background music**: a module may declare `music: { file, volume, quietVolume, screens, quietScreens }` (English:
  `data/englishMusic.js`, the ABC song in `assets/sounds/`). `app/navigation/ModuleMusic.js` (mounted in App.js) watches the
  current route and calls `shared/utils/backgroundMusic.js` (`playMusic` / `stopMusic`; loop, sound-off, pauses in background).
- **Character voices** `shared/utils/voiceConfig.js`: presets (pitch + rate) teacher/human/cartoon/bunny/bear/wolf/panda/tiny/big;
  `BUDDY_VOICES` (rabbit=bunny, bear=bear ...) used by BuddyCharacter's spoken bubbles; `PICTURE_VOICES` per emoji (default cartoon)
  used by ListenPage's "A for apple!" and LetterTrace's friend. Letter names / phonics stay the teacher voice.
- **Cartoon sounds** (generated by makeSounds.js, which now only writes MISSING files; `--all` rewrites): bubble (Play bubbles),
  squeak, giggle (buddy tap), whistleUp (Look jump, picture jump), whistleDown, xylophone (picture dance), twinkle (trace hint),
  thump (buddy arrives), tick (A/a toggle), chime (trace stroke done).
- **Kid backgrounds:** `<Screen scene="day|lesson|spelling|sunset">` draws the animated `KidScene` behind a screen (pauses off
  screen via useIsFocused). Used by: EnglishHub, AlphabetList, WordsHub, ReadingTopics, ReadingLevel (day); LessonLayout,
  ReadingAlong, ReadingYourTurn, ReadingSummary (lesson = calm, no sun/flowers); SpellingWords (sunset); SpellingGame (spelling).
  TraceList / LetterTrace wrap KidScene themselves. Screens without `scene` are unchanged.
- **Celebrations** `shared/components/Celebration.js` (+ `lottieFiles.js`, all `null` until the user adds files): it plays
  Lottie, and falls back to the built-in `Confetti.js`. One at a time. Types: popper (small wins), confetti + stars (Result).

## 5b. Child Home (glass redesign, 2026-11-16)
- `src/screens/home/ChildHomeScreen.js` only assembles `./components/*`; every number/switch is in `./homeConfig.js`
  (`USE_BLUR`, `BLUR_INTENSITY`, `NAV_POSITION` 'top'|'bottom', `BUDDY_SIZE`, `HOME_SHAPES`, `QUICK_START`).
- `HomeBackground` (expo-linear-gradient + drifting shapes via `useDrift({active})`; it is the expo-blur `BlurTargetView`
  and provides its ref through `GlassContext`), `Glass` (BlurView `blurTarget` + `blurMethod="dimezisBlurView"`, or the
  plain translucent layer), `GlassBar` (Alphabets → `AlphabetList`, Words → `WordsHub`, Sentences → `ReadingTopics`;
  pop sound + icon hop + delayed navigate; yellow glow pulse when 0 < letters done < 26), `BuddyHero` (BuddyCharacter 150,
  walks in + waves, glass greeting bubble 'Good morning, {name}!' spoken once per mount; bubble tap = greeting card),
  `StarsChip`, `PopCard`, `ModuleGrid` + `ModuleCard` (2-column glass cards: `useEntrance` stagger, icon bob loop only
  while focused, press squash + icon hop; tap = buddy says the name via BuddyHero `message`, navigate after
  `CARD_NAV_DELAY`; not built = shy wobble + buddy says "Coming soon!" (no alert); Preview keeps the label).
  Icons: `moduleIcons.js` (`image: null` = big emoji). Cards are not blurred by default (`BLUR_CARDS`).
- New theme tokens: `GLASS` (theme.js). BuddyCharacter got `enterFromRight` (RTL), `enterGreeting` (null = no bubble) and
  `active` (pauses the idle sway; `useIdleSway({ active })` in motion.js).
- Packages added: `expo-blur ~58.0.6`, `expo-linear-gradient ~58.0.4` (both in Expo Go).

## 5c. Inspo look (2026-11-21, the user's "Nudge-like" inspo: purple title + buddy, pale sheet, pastel tiles)
- Sizes in `shared/theme/designConfig.js` (`DESIGN`). Shared pieces in `shared/components/`: `PageTitle` (eyebrow + big
  purple title + bobbing buddy, optional `tag`), `Sheet` (rounded pale-lilac panel to the phone edges), `PastelTile`
  (grid tile, half width), `StatTile` (big number), `ProgressCard` (white card + optional `ProgressBar`), `ProgressBar`,
  `Tag` (pill), `ProgressRing` (svg arc, open at the bottom). `SegmentedControl` = inspo pill tabs (white pill on lilac).
- The user chose: a bottom tab bar in PARENT MODE ONLY. Child Mode keeps no bar. Built (step 2):
  `shared/components/ParentTabBar.js` (under the navigator in AppNavigator.js; shows only on the screens in
  `app/navigation/parentTabs.js`: ParentHome, ParentPlan, ParentProgress, ParentSettings = "Me"). Home = navigate back,
  tab -> tab = StackActions.replace. Screen.js drops its bottom safe-area edge on those screens. The ☰ drawer was REMOVED (2026-11-21, ParentDrawer.js deleted); Log out is only in Settings.
- Steps: 1 pieces + Parent Home (done) · 2 parent tab bar + Plan + Settings · 3 detail screens (Progress like "Reading"/
  "Atomic Habits") · 4 Child Home + English hubs · 5 onboarding + login.

## 6. Parent side (redesigned)
- **ParentHome** = greeting + week stats, `OpenChildModeCard` (the hero card → ProfilePicker with the chosen child preselected),
  `ChildList` (tap = choose, ⋯ = `ChildActionsMenu`: progress / edit / delete), "Add another child", `ExploreCard` (starts Preview).
  (The ☰ ParentDrawer was removed 2026-11-21: Plan/Progress/Me are in the bottom bar, Log out in Settings.) Components are in `src/screens/parent/components/`.
- Splash/Welcome use `SoftShapes` (calm drifting bubbles). Welcome has a "Sign up / Log in as Therapist" button → `ComingSoonModal` (not built yet).

## 7. English module → Alphabets (the main current work)
- Flow: Child Home → **EnglishHub** (Alphabets · Words → `WordsHub` · Sentences = the old Read Along `ReadingTopics`)
  → **AlphabetList** (26 tiles, stars, next letter glows) → **LetterLesson** `{ letter }`.
- **LetterLessonScreen = ONE `SwipePager` of 7 pages**: Look · Listen 1 · Listen 2 · Say · Play · Star Check · Result.
  - Forward unlocks only when the page's job is done; a locked swipe stretches and the buddy gives a hint.
    Back is closed in Star Check after the first answer, and on Result.
  - Pages mount when first reached and then stay mounted. Each page gets `active` (= the page on screen).
  - The Play page only allows page swipes from the 90px bottom strip (to protect drag-and-drop).
  - The frame is `LessonLayout`: back + `CaseToggle` (A/a) top; `LessonProgress` icons (eye, ear, mic, game, star);
    the buddy bottom-left; the small back arrow beside it; 🔊 above the big forward `ArrowButton` (with a 👉 hint).
    No text "Next" buttons and almost no written text.
- **Learn:** `LookPage` (the letter jumps/turns/lands on a shadow, says the name, then 3 hops with the sound; a demo runs once
  after `FIRST_DEMO_DELAY`), `ListenPage` + `ListenPicture` (a `TalkingObject` that waves and talks "A for apple!", and dances
  when tapped), `SayPage` (mic button → sound ×3 → thumbs-up). `useLessonSequence` runs one voice+motion script at a time.
- **Play:** `PlayStage` with `DragMatchRound` (letter → picture; big ↔ small) and `PopBubblesRound`. Errorless help:
  1st miss glides back + "Let's try again", 2nd a glow hint, 3rd the buddy places it.
- **Star Check:** `buildQuestions` (5 questions, no hints, look-alikes, sound-alike names kept apart), `QuestionView`,
  `AnswerOption`. Stars from first-try answers: 4–5 → 3, 2–3 → 2, 0–1 → 1. `ResultView` = icon buttons (next letter / replay / grid).
- **Case toggle:** `LetterCase.js` context (`useLetterCase`, `LessonLetter` flips on change); saved as `kidbuddy_alphabet_case`
  (not in Preview, where it uses `previewCase`). The voice always says the capital letter name.
- **Progress:** `store/alphabetSlice.js` (`state.englishAlphabet`): best stars per child+letter in AsyncStorage
  (`kidbuddy_alphabet_progress`). **`recordLetterResult(childId, letter, stars)` is the ONLY save** (the future backend swap point);
  it never lowers a score and does nothing in Preview.
- **Data:** `data/alphabetData.js`: 26 letters (nameSpeech, soundSpeech, 2 toddler emoji examples, `image: null`, `audio: null`,
  accent). Emoji are Unicode ≤ 12. WEAK pictures: I, N, Q, U, X (ends with x, `endsWith: true`), Y, Z.
- **Words → Spelling game** (`WordsHub` Spelling tile → `SpellingWords` → `SpellingGame { wordId }`). Redesigned 2026-11-15/16
  (Endless-Reader-like feel, original art). All three words are on: umbrella, cake, Faiqa.
  - Art (made by the user, never crop/rescale one letter alone): `assets/letters/lower|upper/*.png` (52, 512x512, same
    canvas/font/baseline), `assets/words/cake.png`, `umbrella.png`, and **`assets/manifest.json`** (NOT in letters/):
    `{ canvas, font, baseline_y, colours, letters: [{ letter, case, file, texture, colour, main_colour, light_colour,
    bbox: [left, top, right, bottom] }], words }`. Static require map: `data/letterImages.js` (`LETTER_ART[char]`, `WORD_ART`).
  - `data/spellingWords.js`: cake / umbrella / Faiqa (capital F; no picture, the buddy avatar will pop out). `ready: false`
    hides a word from the list. A word without `image` shows the child's buddy mascot (`getAvatar(displayAvatar)`). `SPELLING.ALL_CAPS` switches everything to capitals.
  - `components/spelling/`: `SpellingBoard` (game logic; ONE game area, all positions computed once by `wordLayout.js`:
    `layoutWord` = bbox widths + gap, whole word scaled to the width; `scatterLetters` = bands above/below the word;
    `touchBox` = bbox + 20%), `LetterArt` (PNG shifted inside a bbox-sized view, optional `tint`), `LooseLetter`
    (letter + code-drawn ellipse shadow; dances while held), `LetterSlot` (grey silhouette placeholder, yellow hint glow),
    `spellingConfig.js` (every number; `SHOW_EYES` flag not built yet).
  - `LooseLetter` = the drag, on the UI THREAD (Gesture Handler `usePanGesture` + Reanimated shared values; no
    PanResponder, no DraggableCard). Position = finger 1:1 (no spring / trailing, constant `LIFT_ABOVE`); only size and
    tilt animate (jelly breath, wobble, speed stretch + lean). The magnet is checked in the worklet against the `targets`
    prop ([{ slot, dx, dy, reach }] from the board's `magnetTargets`); JS is called only for grab / magnet change / drop
    (`scheduleOnRN`). It reads `animationsEnabled()` at render (off = no jelly). Ref: `landOn(dx, dy, done)`,
    `goHome({ wiggle })`, `hop(done, height)`, `turnSolid()`. Spring numbers are `*_STIFFNESS` / `*_DAMPING` in the config.
  - Correct drop = `landOn` (overshoot + squash) + small hop + `SlotBurst` (drawn above the letters: colour flash in
    the letter's light colour, growing ring, sparkles) + `sparkle` sound (used as the chime) + letter NAME.
    Wrong placeholder = boing + wiggle home, no voice; 2 misses = slot pulses, 3 = "Here, let me help." + auto-place.
  - Done = letter parade; picture pops OUT of the word (big, above it) + `tada` + poppers + the word is said; then
    `turnSolid()` (letters fade to `WORD_SOLID_COLOR`), the picture shrinks onto the word's top edge, the word bounces
    twice + `cheerBell` + poppers + "Yaaay!", then Again/Next/All. No progress is saved yet.
  - `SHOW_EYES` (default false): `LetterEyes.js` = two blinking eyes on every loose letter, same look as TalkingObject's
    eyes (its `Eye` is not exported, so the drawing is copied; colours + blink timing come from talkingObjectConfig.js).
    Simple first version: one position for all letters (`EYES_Y`, `EYE_SIZE`, `EYE_GAP`), no looking at touches.
  - SENTENCE PART (`SENTENCE_ON`): each word has `sentence: { text, drag: [2 words], sayAs? }` in spellingWords.js.
    After the word's ending the whole word layer shrinks to the top (`headerStep`) and `SentenceBoard` fills the rest:
    the sentence drawn with `WordArt` (wraps to max 2 rows, `layoutSentence`), 2 grey word placeholders, 2 loose WORDS
    below. Words reuse the letter pieces: `LooseLetter`, `LetterSlot`, `SlotBurst` now take `shape` + `renderArt(tint)`
    instead of a char, so they draw a letter or a whole word. `PieceSpot` = a piece's place. onFinished fires after
    the sentence (or after the word when there is no sentence).
  - SIZE CHANGES / ORIENTATION: both boards work out their `plan` again when their size changes (`plan.key` remounts
    the pieces; placed ones start in place via the `start` prop). Wide, low area = the word is limited by
    `WORD_MAX_HEIGHT` and the loose letters go left/right of it (`scatterPieces`). app.json is still
    `"orientation": "portrait"` (app-wide, not changed), so the phone does not rotate yet.
  - Open: the repeated letter sound after 1.5 s is not softer (speech.js has no volume option); no recorded chime /
    yay sound. On a 360-wide phone umbrella's letters are small (about 39 points tall; touch areas stay 56+).
    The landscape layout is untested (needs the app.json change).
- **Tracing** (2026-11-16): EnglishHub tile "Trace letters" -> `TraceList` (26 tiles with the user's letter PNGs) -> `LetterTrace { letter }`
  (capital, then small, then the picture TalkingObject says "A for apple!" + big celebration + icon buttons). Strokes for all 52 letters
  in `data/traceStrokes.js` (grid 100 x 115, `arc()` helper, `dot: true`); `components/trace/TraceCanvas.js` (react-native-svg road +
  dashed guide + arrows + numbered badges; the ink only grows ALONG the road, never "wrong"; 👆 hint hand), `traceMath.js`,
  `traceConfig.js` (every number). Nothing saved. Background = `shared/components/KidScene.js` (+ `kidSceneConfig.js`: sky gradient,
  breathing sun, slow clouds, hills, flowers; `active` stops loops). Package added: `react-native-svg 15.16.0` (in Expo Go).
- **Letter games** (2026-11-16): EnglishHub tile "Letter games" -> `LetterGames` (2 tiles) -> `BubblePopGame` (letter bubbles
  float up slowly and return when missed; "Find A!" + letter sound; right = plop + sparkles, wrong = wobble only; right ones glow
  after 5 s; 3 rounds; follows the A/a choice) and `MatchPairsGame` (memory cards, capital <-> small, 4 pairs; faces peek first,
  then flip; miss = turn back softly; help glow after 3 misses). Components in `components/games/` (`RisingBubble`, `MemoryCard`,
  `gamesConfig.js` = every number). Nothing saved.
- **Letter stories** (2026-11-16): EnglishHub tile -> `StoryList` (▶ badge = has a video) -> `LetterStory { letter }` (expo-video
  `useVideoPlayer` + `VideoView`, `useEventListener(player, 'playToEnd')`; pauses off focus; muted when sound is off; the ABC song
  stops because LetterStory is not in englishMusic screens). Videos: `assets/videos/<l>.mp4`, listed in `data/letterVideos.js`,
  which is WRITTEN by `video/scripts/renderAll.mjs` (never require a missing mp4). Remotion project = `video/` (separate npm
  project, JS/JSX, entry `src/index.js`, composition `LetterStory` 720x720 30fps 7 s, imports the app's alphabetData + manifest;
  `npm run assets` copies letters/audio/sounds into video/public). Only A is rendered so far. `metro.config.js` blocks `video/`.
- The Sentences section of the new design is NOT built yet (Sentences just opens the old Read Along).

## 8. Characters
- **TalkingObject** (`shared/components/TalkingObject.js` + `talkingObjectConfig.js`): eyes (blink, look at the last touch via
  `utils/touchPoint.js`; `LessonLayout` reports touches), talking mouth, noodle arms that pivot at the shoulder, feet, shadow.
  Moods: idle/wave/dance/jump/happy. Props: `active`, `calm` (blink only, used in Play/Star Check), `onPress`, `hitSlop`.
  `OVERRIDES` per emoji (animals use `ownFace: true`).
- **BuddyCharacter** (`shared/components/BuddyCharacter.js` + `buddyConfig.js`): the child's avatar mascot (rabbit in Preview).
  - Idle sway. A tap says "Hey! I am your buddy!" the first time, then friendly lines. Drag → waddles home.
  - Moods: hop, happy, think, cheer, dance, wave, walk. A ref gives `walkTo(x, y, onArrive)`, `walkToCenter`, `wave`.
  - In lessons: walks in from the left + "Hi!", idle "think" after 8s (at most twice), and on Result walks to the centre → cheer → wave.
  - Mascots ("Cuddle Pals" from the website, 2026-11-26, 11 buddies): rabbit (Bunny), bear, panda, dino, elephant, fox,
    kitty, koala, lion, penguin, puppy. NO wolf (old 'wolf' children fall back to the rabbit). 1000 px high, own widths,
    two side arms, floor shadow drawn in the art (the code draws no shadow, arm or feet). A wave = the body rocks.
    Logos are 840 tall with different widths: `logoRatio` per avatar; the header caps them at `HEADER_LOGO_MAX_WIDTH`.
    The server's avatar list (backend seed) still has only panda/rabbit/wolf/bear, so the 8 new ones stay hidden in the
    picker until the backend adds them (frontend can't). Source art: Downloads\KidBuddy_Mascots (also has *_Head.png).

## 9. How I work in this repo (practical notes)
- **Check that it builds** before reporting:
  `npx expo export --platform android --output-dir <scratchpad>/bundle`
  (look for "android bundles (1)"), plus my import-check script, which verifies named imports exist.
  There is no ESLint config, so I don't run `npx expo lint` (it would add a config).
- Windows + Git Bash. `core.autocrlf=true` (LF/CRLF warnings are harmless). Bash heredocs with quotes/backslashes break:
  write Python/JS edit scripts with the Write tool into the scratchpad, then run them.
- Python's `print` crashes on some Unicode on Windows (cp1252): write logs to a file instead.
- To add Urdu safely, append to `ur.json` with a script and validate it with `node -e "JSON.parse(...)"`.
- `expo-audio` API: `createAudioPlayer`, `player.play/pause/seekTo`, `setAudioModeAsync({ playsInSilentMode, interruptionMode: 'mixWithOthers' })`.
- Expo changes every SDK: check `node_modules/<pkg>/build/*.d.ts` for the real API before using a package.

## 10. Open items / things to remember
- Lottie files are missing (confetti.json, party-popper.json, stars.json, balloons.json). Uncomment their lines in
  `lottieFiles.js` after adding them.
- Recorded letter sounds are DONE (assets/audio, letterAudio.js). Real pictures should still replace the emoji (`image` slots).
- The Urdu wording (written by Claude) needs a native-speaker review. Some keys are duplicated in the shared and
  module `ur.json` files (harmless).
- The language toggle still saves to AsyncStorage during Preview (a phone setting, which I left on purpose).
- Not built yet: Words activities other than Spelling and Read Along, Sentences redesign, Numbers/Feelings/Talk/My Day/Sounds modules, therapist accounts,
  a sensory settings screen (to connect `setAnimationsEnabled` / `setSoundEnabled`), placement/locking of letters.
- Tune on a real phone: `talkingObjectConfig.js` OVERRIDES, `MASCOT_SCALE` + the new buddy sizes, `FIRST_DEMO_DELAY` / `FIRST_HINT_DELAY`.

## 11. Work log (newest last; add one line per task)
- 2026-11-13: Calm redesign (Splash, Welcome + therapist "coming soon", Parent Home with drawer), Preview mode, README fixes.
- 2026-11-13: Alphabets section v1 (EnglishHub, AlphabetList, LetterLesson Learn/Play/Star Check, alphabetSlice, BuddyCharacter, speech.js).
- 2026-11-13: Toddler pass: back-arrow fix (Ionicons), case toggle, SwipePager lesson (7 pages), big Learn animations, sounds + makeSounds.js, confetti.
- 2026-11-13: Characters: TalkingObject, buddy wave/walk (buddyConfig), Celebration + Lottie fallback. User committed as "friday final improvements".
- 2026-11-15: Created this context.md and CLAUDE.md so the project is remembered across sessions.
- 2026-11-15: Added project skill `.claude/skills/kidbuddy-animation/SKILL.md` (Rive, Reanimated 4, Gesture Handler 3, drag-and-drop, characters + sound, Expo Go compatibility). No packages installed, no app files changed.
- 2026-11-15: Spelling game (Words > Spelling): SpellingWords + SpellingGame screens, components/spelling/*, data/spellingWords.js; EnglishHub Words → WordsHub; DraggableCard snapTo `keep` option. No packages.
- 2026-11-15: Spelling fix: grabbing a letter during the opening line no longer makes the voice say the word over the letter sound.
- 2026-11-15: Spelling redesign steps 1-3 (CAKE only): PNG letter art (`data/letterImages.js`), silhouette placeholder word in the middle, loose letters in bands above/below (`wordLayout.js`, `LetterArt`, `LooseLetter`); removed the 3D tiles and drawn pictures. No packages.
- 2026-11-16: Spelling: jelly dragging + magnet in `LooseLetter` (own PanResponder, no DraggableCard), wrong drop = boing + wiggle, ending = poppers twice + word bounce + bell + "Yaaay!". All numbers in `spellingConfig.js`. No packages.
- 2026-11-16: Spelling: drop polish (`SlotBurst`: colour flash + ring + sparkles, small hop) and the final sequence (picture pops out of the word, word turns one colour, picture sits on the word).
- 2026-11-16: Spelling: umbrella + Faiqa switched on; a word without a picture uses the child's buddy mascot (word list + pop-out); magnet has a 56-point minimum reach.
- 2026-11-16: Spelling: `SHOW_EYES` flag built (`LetterEyes.js`, off by default).
- 2026-11-16: Spelling: sentence part (`SentenceBoard`, `WordArt`, `PieceSpot`, `layoutSentence`; pieces generalised to letters or words) and re-layout on size change / wide screens. app.json orientation NOT changed.
- 2026-11-16: Recorded phonics sounds (Part 1): `shared/utils/letterAudio.js` + `data/letterAudio.js`; Look/Listen/Say pages and Spelling use the clips; hold-and-repeat in Spelling; Credits in Parent Settings; README note. No packages. Part 2 (Reanimated drag) waits for "continue".
- 2026-11-16: Spelling Part 2: installed gesture-handler 3.3 / reanimated 4.7.1 / worklets 0.13 (`npx expo install`), `GestureHandlerRootView` in App.js, `LooseLetter` drag rebuilt on the UI thread (1:1 position, magnet in the worklet). README 5j. Untested on a device.
- 2026-11-16: ABC song as English background music (`backgroundMusic.js`, `ModuleMusic.js`, `englishMusic.js`); `q: null` in letterAudio.js because qu.mp3 was deleted and there is no q.mp3.
- 2026-11-16: Buddy bubbles can be silent (`messageSilent` on BuddyCharacter): the English hub greeting and the lesson hint "Tap the letter!" (`SILENT_HINTS` in LetterLessonScreen) are shown but not spoken; the speaker buttons still say them.
- 2026-11-16: Letter sounds going silent (e.g. C, K): the lesson and the spelling board called `releaseLetterSounds()` without letters, so no player was ever freed and they piled up; now they pass their letters (no list = free all). `playLetterSound` no longer waits forever for seekTo and falls back to the voice when a clip does not start within 0.9 s. Clips measured: all similar loudness, 0.6-2.0 s. Buddy "Hi!" is silent (`wave(text, silent)`). Spelling words are now umbrella, cake + cat, dog, sun, ball, fish, apple, hat, bus, milk, tree (no Faiqa; only cake / umbrella have pictures, the others show the buddy).
- 2026-11-16: Child Home redesign STEP 1: components in `screens/home/components`, `homeConfig.js`, glass tokens, quick-start GlassBar, BuddyHero, StarsChip; installed expo-blur + expo-linear-gradient. Step 2 (alive module cards) waits for "continue".
- 2026-11-16: Child Home redesign STEP 2: `ModuleCard` glass cards (grid), `moduleIcons.js`, buddy says module names / "Coming soon!", buddy idle pauses off-focus, README 5k. Untested on a device.
- 2026-11-16: Checked the user's commits "wrords" + "theme change": context matches; qu.mp3 is back and `q` maps to it again (the earlier `q: null` note is outdated); added expo-blur / linear-gradient to the stack list.
- 2026-11-16: Big alphabet upgrade plan (1 tracing, 2 kid themes, 3 character voices + sounds, 4 games, 5 optional Remotion videos). STEP 1 done: tracing for A-Z/a-z (TraceList, LetterTrace, TraceCanvas, traceStrokes, KidScene); installed react-native-svg. All 52 letters verified traceable by a Node simulation. Step 2 waits for "continue".
- 2026-11-16: Alphabet upgrade STEP 2: `scene` prop on Screen (KidScene behind it) on 11 English screens; new scenes `lesson` + `spelling`; WordsHub tiles springy + entrance + bobbing icons; EnglishHub icons bob. No packages. Step 3 (voices + sounds) waits for "continue".
- 2026-11-16: Alphabet upgrade STEP 3: character voices (voiceConfig.js) + 10 generated cartoon sounds wired to buddy, picture friends, Look, bubbles, toggle, tracing. No packages. Step 4 (games) waits for "continue".
- 2026-11-16: Alphabet upgrade STEP 4: Letter games (LetterGames, BubblePopGame, MatchPairsGame, RisingBubble, MemoryCard, gamesConfig). No packages. Step 5 (optional Remotion letter videos) waits for "continue".
- 2026-11-16: Alphabet upgrade STEP 5: Remotion project `video/` (LetterStory), rendered A, `expo-video` installed, StoryList + LetterStory screens, metro.config.js ignores video/, README 5l. All 5 steps of the upgrade done.
- 2026-11-20: Fix "Unable to resolve react-native-worklets": the copy in node_modules was broken (`src/` had 1 file, `src/index.ts` missing). Deleted `node_modules/react-native-worklets` + `npm install` (same version 0.13.0). No code or package.json changes. If it happens again, do the same.
- 2026-11-20: Rebrand mascots + logos: 11 new buddies in assets/images/avatars (wolf removed), avatars.js (ratio + logoRatio + colours), BrandLogo per-avatar ratio + header max width, buddyConfig `shape()` template, voices, Urdu names. Needs the backend avatar list updated for the 8 new ids. Untested on a device.
- 2026-11-20: New colour palette STEP 1: `PALETTE` + `BUTTON` in theme.js, all theme tokens remapped, lavender page background (Screen.js, AppNavigator), Button/SoftButton coral, brown shadows -> plum. Step 2 (hard-coded colours: KidScene skies, games, trace) + step 3 (arrange screens like the user's inspo, e.g. peach login) wait for "continue" / the user's inspo.
- 2026-11-20: Palette STEP 2: hard-coded colours moved to the palette in ~20 files (kidSceneConfig imports PALETTE; homeConfig, games, spellingConfig, trace, AppHeader, Toggle, OtpInput, TextField, StarRow, ParentPlan cards ...). Step 3 (arrange screens like the inspo) waits for the user's inspo.
- 2026-11-20: Palette STEP 3, batch A (all screens' backgrounds + onboarding/auth): `screenColors.js` (every route), Screen/FixedHeader/AppHeader/AppNavigator use it, heading tokens, Splash/Welcome/Onboarding/Login tweaks, SoftShapes. Batches B (parent), C (child/profile/account), D (English module) wait for "continue".
- 2026-11-20: Palette STEP 3 batch B (parent): purple headings on Parent Home/Plan/Progress/Settings, Explore card mint, streak badge peach, Plan hero pastel lilac (no full purple block), Plan icon tiles = category pastels, Progress chart Sunny Yellow bars, white cards. Batches C + D wait for "continue".
- 2026-11-20: Palette STEP 3 batch C (child/profile/account): new `CATEGORY` tokens in theme.js (reading pink, games yellow, art lilac, learning green, calm mint, music blue); Child Home module cards use them; ProfilePicker/EditAvatar: purple title + selection, coral Continue/Save with white text; purple headings on profile + account screens. Batch D (English module) waits for "continue".
- 2026-11-20: Palette STEP 3 batch D (English module): EnglishHub + LetterGames tiles use `CATEGORY`, WordsHub tiles = palette pastels, purple titles (SectionHeader, hubs, spelling list, reading screens, Struggle Words), reading highlights/dots/wave purple, reading buttons + mic = `BUTTON` coral. README "Colours" section added. The whole palette task (steps 1-3, all screens) is done; untested on a device.
- 2026-11-20: "Can't reach the KidBuddy server" on Sign Up: the PC's Wi-Fi IP changed; `API_BASE_URL` in config.js 10.54.198.119 -> 192.168.1.67 (backend /health answers ok). Check `ipconfig` again whenever this message appears.
- 2026-11-21: Same error at another house ("NoRouteToHostException"): new Wi-Fi IP 192.168.1.21 -> config.js updated; the backend was also NOT running (user must start it: backend/ npm start).
- 2026-11-21: config.js finds the PC's address by itself (expo-constants hostUri), so changing Wi-Fi no longer needs an edit. Installed `expo-constants` with `npx expo install`. Untested on a device.
- 2026-11-21: Inspo redesign STEP 1: designConfig.js + PageTitle, Sheet, PastelTile, StatTile, ProgressCard, ProgressBar, Tag, ProgressRing; SegmentedControl restyled as pill tabs; Parent Home rebuilt (title + buddy, sheet, stat tiles, child cards with letters progress bar, "Add a child" mint + "Explore" peach tiles). ParentGreeting.js / ExploreCard.js are now unused (kept). Urdu strings added. Step 2 waits for "continue".
- 2026-11-21: Inspo STEP 2: parent bottom tab bar (ParentTabBar + parentTabs.js), Plan rebuilt (PageTitle "Psst, What's the plan this week?", mint hero, ProgressCards, "Soon" tags), Settings rebuilt (title + sheet, everything as ProgressCards, pill-tab language). Step 3 (detail screens) waits for "continue".
- 2026-11-21: Inspo STEP 3: `DetailHeader` (tag + big buddy + title + pill + caption, DESIGN.DETAIL_MASCOT), `PINK_DETAIL` in screenColors (ParentProgress, EditProfile, ParentProfile = whole top Soft Pink). Progress rebuilt (header + child chips, Highscores stat tiles, alphabet ProgressRing = letters learned /26, yellow Read Along chart, activity cards, coral share button). Edit Profile + My Account rebuilt with header + sheet + ProgressCards. Forms (ChangePassword, UpdatePin, EditChildSection, PersonalizeStories, StruggleWords) NOT restructured yet. Step 4 (Child Home + English hubs) waits for "continue".
- 2026-11-21: Inspo STEP 4: Child Home: `HOME.SHOW_SHAPES` false (no drifting shapes), `HOME.USE_SHEET` (modules on the Sheet, title "What shall we learn?"), ModuleCard = pastel tile (no glass/gradient, white disc, purple name; logic unchanged). EnglishHub = 2-column PastelTile grid on a Sheet; LetterGames + WordsHub tiles on a Sheet; those 3 hubs no longer use scene="day" (screenColors -> MAIN). PastelTile fix: width now on an outer View (+ `iconNode`, `minHeight` props). Lessons/games/tracing keep their animated scenes. Step 5 (onboarding + login) waits for "continue".
- 2026-11-21: Inspo STEP 5 (last): RADIUS button 20 / input 18, SIZES button 54 / input 52; globalStyles.heading = Nunito Black; TextField label Nunito; `AuthHeading` shows the bobbing buddy on top (`mascot` prop, DESIGN.AUTH_MASCOT) so `footerMascot` was removed from the 5 auth screens; Log In title "Hey there, you're back!"; Welcome v1 = left-aligned "Welcome to KidBuddy / Let's grow together!" + buttons + big buddy peeking up from the bottom (DESIGN.WELCOME_MASCOT*). README "Screen design" section. The whole inspo redesign (steps 1-5) is done; untested on a device.
- 2026-11-21: Welcome v1 changed on the user's request: buddy on the LEFT (DESIGN.WELCOME_MASCOT 0.22 of the height, bobbing) with the text on its right (title 30), buttons + small print at the BOTTOM, "Get Started" = new `PALETTE.deepPurple` #4A1D96 (only on Welcome; other main buttons stay `BUTTON` coral). WELCOME_MASCOT_HIDDEN removed.
- 2026-11-21: Log In like Welcome (user's request): screenColors LogIn -> MAIN (lavender, was peach), `<SoftShapes />` added, Log In button = PALETTE.deepPurple. Forgot/reset password screens are still Blush Peach.
- 2026-11-21: ForgotPassword, PasswordOtp, ResetPassword now match Log In (screenColors MAIN, SoftShapes, deepPurple main button). VerifyCodeScreen is shared, so the sign-up email-code screen (EmailVerification) got the bubbles + purple button too. Blush Peach is now only used by ProfilePicker.
- 2026-11-21: ALL main buttons deep purple: `BUTTON.fill` = PALETTE.deepPurple (pressed = purple). Flat inspo icons instead of emoji: new `shared/components/AppIcon.js` (MaterialCommunityIcons from @expo/vector-icons, no new package); `iconName` prop on PastelTile / StatTile / ProgressCard (+ `iconTint` on ProgressCard); used on Parent Home, Plan, Settings, My account, Progress, Edit profile, ⋯ menu, ☰ drawer, Child Home module cards (`iconName` in MODULES, ModuleCard falls back to emoji), English hub, Letter games, Words hub. Lesson/picture emoji (🍎 ...) are content and unchanged. Tab bar active colour stays coral.
- 2026-11-21: Removed the ☰ parent menu (user's request): ParentDrawer.js deleted, Parent Home no longer passes onMenuPress / drawer state / its own log-out. The ☰ support in AppHeader/HeaderContext stays (unused). Log out = Settings only.
- 2026-11-21: Modular + one-path flows, STEP 1 (flows). The user chose: (1) Child Home has NO quick-start bar (GlassBar.js + QUICK_START + BAR_* deleted), English -> tiles is the only way in; (2) Read Along = English -> Sentences only (removed from WordsHub); (3) child card ⋯ = Edit profile + Delete only, progress = the Progress tab only (goToProgress removed), Settings has no Children list; (4) Parent PIN = Settings -> Safety only (removed from My account). Deleted unreachable/unused: WelcomeAltScreen (+ its route), ExploreCard.js, ParentGreeting.js, BouncyButton.js, MascotSpeech.js. Step 2 (modules: routes file, area screen lists, English public API) waits for 'continue'.
- 2026-11-21: Modular STEP 2: area screen lists (8 x screens/<area>/index.js + screens/index.js), AppNavigator uses them, English public door (entry, progress, parentTools in modules/english/index.js; moduleEntry / selectModuleProgress / sameProgress / MODULE_PARENT_TOOLS in modules/index.js). Child Home, ChildList, Progress (one ring per module) and Plan (module cards) use the door. 43 screens, no duplicates; README sections 'How the app is split' + 'One way into every screen'. Done; untested on a device.
- 2026-11-23: BACKEND (user asked explicitly): `backend/database/migrations/002_rebrand_avatars.sql` upserts the 11 buddies (app order, rabbit = 'Bunny') and sets wolf is_active = 0 (row kept for old children). 02_seed.sql unchanged. Tests updated (reading.test avatar list; children.test wolf -> fox + 'wolf' refused), API.md + backend README. APPLIED 2026-11-23 to the real db (npm run migrate), 91/91 backend tests pass, /api/options returns all 11.
- 2026-11-23: Sign Up fits one screen (user's request): `AuthHeading side` (words left, rabbit right, DESIGN.AUTH_MASCOT_SIDE 96; RTL mirrors), `PasswordRules compact` (2 columns, SHORT_LABELS, Urdu added), smaller gaps in SignUpScreen. Still Screen scroll so the form can scroll ONLY while the keyboard is open. Other auth screens keep the centred buddy.
- 2026-11-23: BUG FIX: RN 0.88 has NO `StyleSheet.absoluteFillObject` (only `absoluteFill`), so 12 overlay styles silently did nothing (ProgressRing text fell below the ring, OtpInput, MemoryCard, RisingBubble, LetterTile, AnswerOption, DropTarget, Confetti, Sparkles, LetterStory, BubblePop, MatchPairs). All replaced with `...StyleSheet.absoluteFill`. NEVER use absoluteFillObject. Progress tab: Read Along bar chart (7D/4W) replaced by `shared/components/PracticeCalendar.js` (month grid, Sunday first, practised days = purple circle, today = ring + dot, ‹ › months, never past this month, 'Practised on {n} days this month'; DESIGN.CAL_DAY_SIZE).
- 2026-11-23: AvatarPicker is now a horizontal ScrollView (11 buddies did not fit; it bleeds to the screen edges with marginHorizontal -24 / paddingHorizontal 24, so it must sit directly on a Screen with the default padding). Used by CreateChildProfile + EditChildSection.
- 2026-11-23: Create child profile: `AuthHeading side avatar={avatar} mascotSize={DESIGN.CHILD_PREVIEW_MASCOT}` (130): words left, the CHOSEN buddy's whole body right, changes live with the picker. AuthHeading got a `mascotSize` prop. AvatarPicker scroller `flexGrow: 0` (it left a big gap).
- 2026-11-23: Onboarding cards: emoji + small rabbit replaced by `screens/onboarding/OnboardingArt.js` (2 soft white circles, a big buddy, 3 white badges with flat AppIcons that bob a few times; numbers in ONBOARDING_ART). Cards: lilac + PANDA (clipboard, home-heart, calendar-heart), yellow + fox (book, puzzle, music), mint + BEAR (shield-check, lock, account-heart) (swapped on the user's request 2026-11-23). Card height max 340 / 40% of the screen.
- 2026-11-23: Onboarding: each card has its own page colours (PAGE_COLORS in OnboardingScreen.js: lavender / pale butter #FDF6D8 / pale mint #E6F6F1, with title + text colours checked for contrast). Page, top bar (new `<Screen headerColor>` -> HeaderContext config -> FixedHeader), Android status bar (navigation.setOptions) and the active dot switch when a swipe is halfway.
- 2026-11-23: Onboarding 'Create Parent Account' button colour follows the card (PAGE_COLORS.button: purple / coralText / mintDeep, white text >= 4.5:1).
- 2026-11-23: Header Home button: 🏠 emoji -> AppIcon 'home-outline' in COLORS.primary (AppHeader.js; the only rendered house). The H-lesson picture ('House' 🏠 in alphabetData) is lesson content and was left as it is.
- 2026-11-23: NEW MODULE `src/modules/talk` = the AAC board (Child Home -> Talk, entry 'AACBoard', registered in modules/index.js, screenColors AACBoard MAIN). 36 Universal Core words (Project Core) in a FIXED 6x6 grid (never reorder: motor planning; grid stays LTR in Urdu), Modified Fitzgerald Key colours (WORD_TYPES in data/aacWords.js), 5 topic pages x 6 words, SentenceStrip (speak / delete last / clear, max 12), speak on tap (AAC.SPEAK_ON_TAP), Urdu in talk/i18n/ur.json (needs native check). Pictures: 66 ARASAAC pictograms downloaded once into assets/aac/ (CC BY-NC-SA, credit line in Parent Settings, ids in assets/aac/README.md; can/not/park/do swapped by hand for the right meaning). Nothing saved yet; parent 'AAC symbol editor' (Plan tab) still Coming soon.
- 2026-11-23: Organising the app by the FYP PROPOSAL (Downloads\Group#02_DrRehanHafiz_KidBuddy_FYP_Proposal.pdf, 74 pages: 11 modules in Table 1.1, FR-01..FR-53, MoSCoW in Table 2.3). User chose: Child Home = 6 GROUPS with the proposal modules inside, unbuilt = 'Coming soon'. STEP 1 done: `screens/home/learningGroups.js` (LEARNING_GROUPS: Reading & Writing [1-5, opens English hub], Speech Sounds [6], Feelings & Stories [7, 10], Numbers [8], Talk [9, opens AAC], My Day [11]; module built = `module:` name resolves via moduleEntry), new `LearningGroupScreen` (route LearningGroup {groupId}, home area), Child Home tiles come from the groups (ModuleCard shows 'Coming soon' when `soon`; moduleIcons key english -> reading). Steps 2 (Reading & Writing hub = modules 1-5), 3 (parent side FRs as Coming soon), 4 (README FR map) wait for 'continue'.
- 2026-11-23: Proposal STEP 2: English hub = proposal Modules 1-5 (`modules/english/data/englishSections.js` ENGLISH_MODULES): 1 Read-Along -> ReadingTopics, 2 Reading Assist = Coming soon, 3 Words & Phonics -> EnglishActivities {moduleNo:3} (Alphabets, Phonics soon), 4 Spelling & Letter Sounds -> EnglishActivities {moduleNo:4} (Spelling, Bubble Pop, Match Pairs, Letter stories), 5 Handwriting -> TraceList. New `EnglishActivitiesScreen` (route EnglishActivities). DELETED WordsHubScreen + LetterGamesScreen (their tiles moved into Modules 3-4; one path each). Hub title 'Reading & Writing'. 44 screens registered, all opened routes exist. Steps 3 (parent FRs) + 4 (README FR map) wait for 'continue'.
- 2026-11-23: Proposal STEP 3 (parent side, all 'Coming soon' with a Soon tag): Settings: 'Daily time limit' (FR-06) + Notifications in Safety, new 'Therapist' section: Invite your therapist (FR-03/04), Share with therapist (FR-12). Plan cards reworded to the FRs: Therapist targets (FR-09/11), Reading material (FR-23), Routine builder (FR-50/51), Talk board pictures (was 'AAC symbol editor', FR-47), NEW Social stories (FR-49). Progress: 'Badges and stickers' row (FR-16). Already built and kept: FR-01, FR-02 (Personalize stories), FR-06 activities on/off per child, FR-07, FR-08, FR-13. Step 4 (README FR map) waits for 'continue'.
- 2026-11-23: Proposal STEP 4 (last): README section 'The FYP proposal in the app' = the 6 groups table + all 53 FRs with MoSCoW priority, status (7 Built, 10 Partly, 24 Coming soon, 12 Later) and where they are. Honest notes: Read-Along highlights while the APP reads (no speech recognition yet, 'Your turn' = 'I said it' button); struggle words exist on the server but are not flagged automatically. Keep this table up to date when a module is built. The proposal-organising task (steps 1-4) is done.
- 2026-11-23: Parent ease STEP 1: Onboarding 4th card 'Try KidBuddy first' (rabbit, pale sky page #EAF3FC, explore: true) with 'Explore KidBuddy' (startPreview + goToChildHome, NO login needed) + secondary 'Create Parent Account'. Leaving a logged-out preview: FixedHeader -> new helper goToIntroAfterPreview (reset to Welcome + Onboarding {startAtLast}) instead of Parent Home; a logged-out preview exits without the PIN. Steps 2 (Explore card more visible on Parent Home for new parents) + 3 (helper texts) wait for 'continue'.
- 2026-11-23: 4th onboarding card: buddy = puppy (blue), and 'Create Parent Account' is now a filled blue button like 'Explore KidBuddy' (both #2E6A8A).
- 2026-11-23: 4th onboarding card: 'Explore KidBuddy' = white button with a blue (#2E6A8A) outline and blue words; 'Create Parent Account' stays filled blue. Button.js got an optional `textColor` prop.
- 2026-11-23: Parent ease STEP 2: `parent/components/ExploreWelcomeCard.js` = big blue 'New here? See what your child will see' card (puppy, Explore KidBuddy + Not now) at the TOP of Parent Home's sheet until the phone has explored once or tapped Not now (new storage key KEYS.explored = 'kidbuddy_explored'; the onboarding card's Explore also sets it). The small Explore tile stays further down. Step 3 (helper texts for parents) waits for 'continue'.
- 2026-11-23: Parent ease STEP 3 (last): new `shared/components/HelpText.js` (an 'i' icon + one plain sentence for parents). Added on Parent Home (weekly numbers, Your children), OpenChildModeCard (hand over + come back with 🔒 Parent + PIN), Plan (Planning tools), Progress (Highscores, Alphabet ring, Read Along calendar), Me (Safety, Therapist = not a replacement), Edit profile. Urdu added. The 'parent ease' task (4th onboarding card, welcome card, helper lines) is done.
- 2026-11-23: The user did NOT like the step-3 helper lines: ALL removed again (HelpText.js deleted, its 10 Urdu texts removed, the 6 screens back as before). Do not add helper lines to the normal parent screens. The user allowed explanations INSIDE the preview (Explore KidBuddy) pages instead.
- 2026-11-23: Preview guide lines (user's choice): while Explore KidBuddy is on, PreviewBanner shows ONE sentence for the parent about the current page (`guide` prop, from `app/navigation/previewGuides.js`: APP_GUIDE for ChildHome / LearningGroup / EditAvatar + MODULE_PREVIEW_GUIDE). Modules add theirs via `previewGuide` in their index.js (English: data/previewGuide.js, 17 screens; Talk: AACBoard). Never shown to a real child. Urdu added (21 lines).
- 2026-11-23: OpenChildModeCard streak badge: 🔥 emoji -> purple AppIcon 'fire' + translate('{n}d') (Urdu '{n} دن'). No 🔥 emoji is drawn anywhere now.
- 2026-11-24: AAC board v2 (user: bigger + more detailed + child-friendly). Design like TD Snap Core First / Proloquo2Go: SentenceStrip, QuickWords row (yes, no, please, thank you, wait, toilet; type 'social'), 48 CORE words (Universal Core 36 + me, my, out, off, eat, drink, play, sleep, come, big, little, again) in 6 colour columns; size switch BIG (CORE_BIG_PAGES: 3 pages x 4x4, 2 colour columns per page, same order) or ALL (6x8), saved in KEYS.aacBig ('kidbuddy_aac_big', default AAC.START_BIG true); 'Core words | Topics' SegmentedControl; 13 TOPICS folders (FolderTile) x up to 12 words. Words have optional `pic`; `symbolFor(item)` (item, not word). New pictures: 136 ARASAAC (total 202, `data/aacSymbols.js` written by a script, ids appended to assets/aac/README.md; wrong meanings fixed: orange swap, dress, hospital = crescent, out, wash hands, shoes = trainers, school bag, cold, line up). TopicTabs.js deleted. 153 Urdu words added (needs a native check; 'orange' fruit + colour share one Urdu word). The ALL mode pictures are small on a phone (~24 pt); BIG is the default.
- 2026-11-24: AAC board scrolls (user's request): Big core pages = horizontal paging ScrollView (swipe, the ‹ › arrows call goToPage + scrollTo, dots follow onMomentumScrollEnd); All words, Topics and folder words = vertical ScrollView with buttons at least AAC.MIN_CELL_RATIO (1.15) x their width tall, so pictures are bigger and the child scrolls down.
- 2026-11-24: (1) Me (ParentSettings) has a 'My children ({n})' section before Language: a card per child (tap = EditProfile, ⋯ = ChildActionsMenu Edit/Delete with the same delete question as Parent Home) + 'Add a child' -> CreateChildProfile (user's request; Parent Home still has its list too). (2) EditChildSection 'support' = 3 groups from new `screens/profile/supportGuide.js` (Learning: Reading/Writing/Numbers; Communication: Speech and language/Social communication; Everyday life: Attention and routine/Daily living), each area a tickable card with a short explanation, and a per-group guide 'Has your child been diagnosed with…' (dyslexia, dysgraphia, dyscalculia, autism, speech/language delay, non-verbal, ADHD, intellectual disability, global developmental delay) with 'We recommend: …' + Choose. Frontend-only text; only the areas are saved. Save offers to switch on the matching activities. (3) 'modules' = 'Recommended for {name}' (from the SAVED areas, each tagged with the areas it helps, 'Switch on all recommended') then 'Other activities'; every activity has a short line (MODULE_ABOUT); with no areas a button goes to the support section. 60 Urdu lines added.
- 2026-11-24: Optional setup at profile creation (user's request): CreateChildProfile 'Create profile' now does navigation.replace('ChildSetup', { childId }) (Explore mode, no id -> Parent Home as before). New `screens/child/ChildSetupScreen.js` (route ChildSetup, MAIN colours): '{name}’s profile is ready!' + info box 'You can skip this and set it up later...' + 3 cards with an Optional/Added tag: Areas of support -> EditChildSection 'support', Activities -> EditChildSection 'modules', Personalize stories -> PersonalizeStories ('helps customise your child’s stories and activities'); each saves and comes back; one button 'Skip for now' (nothing added) / 'Finish' -> Parent Home. PersonalizeStories intro now says it helps customise stories and activities. 12 Urdu lines.
- 2026-11-24: New children start with ALL activities OFF (user's request): CreateChildProfile sends modules: [] unless NEW_CHILD_ACTIVITIES_ON (shared/utils/childOptions.js, false) is true. The backend keeps [] as empty (it only uses on_by_default when modules is left out). ChildSetup Activities card: 'All are off for now...' and 'Added' once at least one is on. Existing children are unchanged.
- 2026-11-24: Diagnosis guide now follows the FYP proposal (user's request): the 7 conditions of Section 1 (Learning: Dyslexia, Dysgraphia, Dyscalculia; Communication: Autism (ASD), Communication disorder; Everyday life: ADHD, Intellectual developmental disability (IDD)); removed speech/language delay, non-verbal, global developmental delay. Each diagnosis has `modules` = exactly Table 1.1 (e.g. ADHD = Routines / Attention, Social Stories, Emotion Trainer, Vowel / Phoneme) shown as 'Activities: …', and `recommend` = the areas those modules belong to. Choose also remembers the diagnosis (not saved); on Save `activitiesToOffer` (supportGuide.js) offers exactly those modules + the activities of areas ticked by hand. Checked by script: all 7 match Table 1.1. 10 Urdu lines.
- 2026-11-24: Areas of support drop-down (user's request): each area card = a tick box (48 pt, chooses the area) + the rest of the card (opens / closes, chevron, 'Show {n} activities'). Open = the activities of that area (MODULES whose supports include it, e.g. Reading -> Read-Along, Reading Assist, Phonics, Spelling) with MODULE_ABOUT line + sensor badge, fading in one by one (AreaActivity, useEntrance from motion.js). One area open at a time (openArea state). 2 Urdu lines.
- 2026-11-24: Fix 'blank white sheet' on Areas of support: AnimatedPressable puts `style` on its INNER Animated.View, so the area card's open part (flex: 1) sat in a Pressable with no width and its text was squeezed to 0 width (very tall empty white cards). Now wrapped in a View areaOpenSlot { flex: 1 }. Rule: to make an AnimatedPressable fill space in a row, give an outer View the flex.
- 2026-11-24: Child Mode shows ONLY the activities switched on in the child's profile (user's request). New `shared/utils/childActivities.js`: ACTIVITY_BY_NO (proposal module no 1-11 -> server activity name, e.g. 9 = 'AAC Talk Board') + activityOn(child, no) (demo child / Explore mode = everything). learningGroups.visibleGroups(child) drops modules that are off and groups with none left; ChildHome tiles come from it (none = 'No activities yet. Ask a grown-up to switch some on.'); LearningGroupScreen and the English hub (EnglishHubScreen) filter their modules the same way. 2 Urdu lines.
- 2026-11-24: Child Home greeting card removed (user's request, the 'Good afternoon! / Ready to learn, {name}?' PopCard with SpeakButton). Tapping the buddy's speech bubble now only reads the greeting aloud (speakUi(greetingKey, { name })). The Stars today card (tap the star chip) stays.
- 2026-11-24: Parent Mode shows only enrolled activities (user's request). Parent Home ChildList cards = the Me page card: subtitle childLine(child) 'age · language · {n} activities on' (exported from ChildList.js, also used by ParentSettings), no letters / progress bar. Progress tab: module rings carry `activityNo` (English Alphabet = 3, Words & Phonics) and show only when that activity is on; Read Along calendar only when Read-Along (1) is on; the Activities list was already child.modules; none on = 'No activities yet' card + 'Choose activities' -> EditChildSection 'modules'. 2 Urdu lines.
- 2026-11-24: Website synced with the app's newest FLOW and LOGIC (no UI/colour changes; the Figma look stays): 11 buddies (art copied, avatars.js, `npm run migrate` applied to the local db); Child Mode = 6 proposal groups + activity gating (utils/modules.js, ACTIVITY_BY_NO, visibleGroups), LearningGroup page, English hub = Modules 1-5 + activities page (old Words / Letter games hubs removed, redirects), no quick-start bar, greeting card removed; Talk module = AAC board (data/aacWords.js, 202 ARASAAC pictures in public/media/aac, credit in Settings); new children start with all activities off + ChildSetup page; Areas of support (3 groups, drop-down, diagnosis guide, offer matching activities) and Activities (recommended first) rebuilt from supportGuide.js; Dashboard Explore welcome card; Progress gated by enrolled activities + practice calendar; Plan cards + Settings (Daily time limit, Therapist section, credits); PIN only in Settings; intro step 4 'Try KidBuddy first' (Explore without an account); therapist button on Welcome; Preview guide sentences. Urdu merged from the app (+ new). 22 frontend tests pass. No app or backend code changed.
- 2026-11-24: Wrote `website/DIFFERENCES.md` — full mobile vs website comparison (matched flows, behaviour gaps in letter lesson/spelling/characters, Figma shell vs phone look, intentional platform diffs, screen map). No code changes.
- 2026-11-25: Website activity behaviour matched to the app (user's request; Figma look kept). Letter lesson rewritten (pages stay mounted, Look demo does not finish the page, silent 'Tap the letter!', 🔊 above the arrow, Play bottom-strip swipe, Say thumbs-up, 7 bubbles + idle glow, 2-target Big & small, one-try Star Check + waiting star, buddy moods); Spelling (hold-to-repeat letter sound via audio.startHoldSound, app end-of-word sequence, sentence intro/hold, fixed a StrictMode bug that stopped the ending); Bubble pop, Match pairs, Trace, Letter stories timings/voice as in the app. useDrag got onGrab/onRelease. DIFFERENCES.md §2 updated. No app or backend code changed.
- 2026-11-25: Website greeting: 8 pm - 5 am now says 'Good night' (was 'Good evening' all night; user's request) in utils/misc.js getGreeting (Child Home + Dashboard), 3 Urdu lines (شب بخیر), greeting test added (23 tests). The app's greeting.js is unchanged.
- 2026-11-25: Website audit Batch A (user-approved R5 + R16, website only): CSS moved onto tokens (font sizes → --t-*/new child scale --k-*, radii → --r-chip/control/panel/pill + child --r-kid-s/--r-kid, elevation shadows → --shadow-raise/pop, media queries → 640/900/1024/1200), 64 legacy alias tokens removed (calm-*, pastel-* …) and their uses replaced; --ink-3 #667085 → #5b6577, failing grey text → --ink-3, eyebrow 12px/0.04em, Talk selected tab + All + hint, alphabet stars readable, nothing under 12px; ProgressRing arc used an undefined --purple (now --lilac). Visual check desktop/tablet/phone, no overflow. Kept: 1100px entry rule (until R9).
- 2026-11-25: Website audit Batch B (user-approved R1, R4, R13, R18): Stat card stacks icon/label/value(+unit)/hint, no ellipsis, new copy (Finished sessions, Stars this week, One for every try); Dashboard: one Open Child Mode (sidebar; header copy only while the sidebar is in the drawer, <1024px), Ready-to-learn card removed, Add child secondary; top-bar initials removed, sidebar 'you' is now an account menu (My account, Log out); child card week = 7 labelled dots (WeekDots, Urdu full day names, own row on phone); plurals: day/days, word/words, sentence/s, activity/ies. 14 Urdu lines. Settings Log Out row is left for Batch C (R2/R22).
- 2026-11-25: Website audit Batch C (user-approved R2, R14, R22): Settings <=900px = grouped list (Family/Safety/About) with current values, a row opens its section as its own screen with '← Settings' (history-friendly), Log out button under the list; wide screens keep two panes without a Log Out row (Log out = sidebar account menu); Session section became 'About and credits'; Account pane shows Name (Edit), Email, Password (Change); Children pane links to My Children. Breadcrumbs from the sidebar tree with the child's name (utils/crumbs.js, 2 tests), 32px link targets. 14 Urdu lines.
- 2026-11-25: Website audit Batch D (user-approved R7, R8, R12 child part): Child sound switch = labelled bell ('Sound on'/'Sound off'); turning OFF needs a 0.6s hold (quick tap shows 'Hold to turn off'), ON is one tap, keyboard toggles; still hidden on phones as before. SpeakButton = 'Read to me' (speech-bubble icon, #5B4FD6, label; compact = icon only). Talk board: strip border, 48px round delete/clear, 64px Say, quick words picture-over-label, Core/Topics 44px/17px, 48px page arrows. Coming-soon tiles (Child Home, hub, group, activities): muted #F6F2EA, grey icon, 'Soon' badge inside, sorted last. Icons bell-off-outline, chat-processing-outline added. 3 Urdu lines.
- 2026-11-25: Website audit last batch (user-approved R9-R11, R12 Share report, R15, R17, R19-R21): entry illustration never hidden (zoomed scene 1200/1024px, a band on top <=900px, centred column), headline balance, therapist button = text row under Log In on phones; auth: one logo when the side panel shows, 20px field rhythm, password rules show an empty circle until met; Plan = light summary per child (Choose activities) + working tools + Soon chips; Share report = secondary + Soon chip; Progress subtitle 'How {name}'s practice is going.'; Create child: 24px groups, compact 64px buddy grid, buddy name in the preview; 404 tracing letters centred and faint; ChildInstruction = buddy speech bubble (8 pages); Inter/Nunito weights trimmed, Urdu font loaded only when Urdu is chosen. 6 Urdu lines. All approved audit items (20) done; R3 and R6 were not approved.
- 2026-11-25: Website Login + Create account redesigned (user-approved Option A, website only). AuthLayout (/login, /signup) = 50/50 split: brand panel from the user's supplied design (bunny and kitty art, speech bubble as translatable text, 'Zara's week' card, promises; Nunito) + form with a Log in | Create account switch, no card, form top edge fixed; <1100px the panel is a band (200px / 120px). Opt-in extras on shared components: TextField icon + showText, Button loadingText, PasswordRules calm (hint -> strength bar + 2-column checklist; passwordStrength() in utils/validation.js, tested). Other auth pages (forgot/reset/code) unchanged. New files public/media/auth/panel-art.png + logo.png are CUT-OUTS from the user's flattened image: replace with the original transparent art when available. The new logo is used in the auth panel only (not the app-wide logo: that would be a separate approved step). 8 Urdu lines (new ones written by Claude, need review). No backend or app change.
- 2026-11-25: Website pre-sign-up audit (loading, splash, welcome, intro 1-4, get started, login, create account) done as AUDIT ONLY, no code changed. 14 findings (1 critical: fixed 1,966 ms splash; 5 high), design system taken from the new Login, mockups + phone storyboard published as a private artifact with per-screen approval boxes (S1-S8, login-side L1-L2). Waiting for the user to approve screens before any change.
- 2026-11-25: Website pre-sign-up redesign IMPLEMENTED (user approved S1-S8, L1-L2; website only, no mobile/backend change). New components/EntryShell.jsx (EntryShell, scenes, BootScreen) + entry.css (.es-*, .kb-boot-*): splash removed (the 1,966 ms hold), branded loader in index.html + BootScreen + branded connection-error card; Welcome and the 4 intro steps on the Login layout (own panel colour/shapes/scene per step, new bunny public/media/auth/bunny.png on each step, orbit circle kept on step 2); intro: progress bars (44px tap), Skip -> step 4, step 4 = Create my account / Explore KidBuddy first / Log in / Back; forgot/reset/verify pages use the Login panel without the switch; Not found on the shell; page titles per route (PageTitle in App.jsx); favicon = new logo mark; 18 new Urdu strings in ur.json (need native review); removed EntryArt.jsx, TracingLetters.jsx and the dead splash/welcome/centred-card CSS. Tested 1440/1280/768/390/320 (no overflow, buttons above the fold), Urdu, keyboard, Skip/Back/Log in/Create/Explore paths; 26 unit tests pass.
- 2026-11-25: Website PARENTS MODULE audit (AUDIT ONLY, no code changed, website only): 19 pages + shell inventoried, tested at 1440/1280/768/390/320 and in Urdu against a local fake API (no real data touched). 21 findings (2 critical: two disagreeing "current child" controls; letters 0/26 is browser-only), proposed redesign mockups + design tokens published as a private artifact with approval boxes M1-M10. Waiting for approval; test tooling lives in the session scratchpad (par/).
- 2026-11-25: Website buddies replaced by the user's "Cuddle Pals" (Downloads/Cuddle Pals.html), website only: the 11 SVG pals were exported to transparent PNGs (public/media/avatars/mascot-<id>.png) and new logo-<id>.png (pal + the old per-buddy "KidBuddy" wordmark); data/avatars.js ratios updated. Mapping: bunny=rabbit, teddy=bear, panda, dino, ellie=elephant, foxy=fox, kitty, koala, leo=lion, pippa=penguin, puppy. Ids and names unchanged (they match the app and the server). Originals backed up in the session scratchpad (pals/backup). Auth panel bunny/kitty art (supplied earlier) and the mobile app are untouched.
- 2026-11-25: Parents module redesign, BATCH 1 of the approved list (M1 shell + M10 tokens; M2-M4, M6-M9 wait; M5 not approved), website only, no backend change. Tokens: --t-xs 13px, --t-sm 14.5px, Inter 400/600/700 only (odd weights 500/650/750/800 removed from the parent side; Google font link now loads Inter 400/600/700), --shadow-card/--shadow-menu, .link has a 44px tap area, sidebar language switch 44px, breadcrumb links and current page share one 44px box (fixes the 5px offset), stat colours fixed per measure (Dashboard + Progress). Shell: top-bar ChildSwitcher only on child pages and it shows the child of the page (profile id in the URL / Progress ?child=), picking another child opens the same page for them (fixes PA1); Progress keeps the current child in step with ?child=; PageTitle in App.jsx gives every Parent Mode page a tab title (Urdu via translate); sidebar shows the email. Tested at 1440/390/320 (no overflow, no console errors), 26 unit tests pass. Not touched on purpose: switches stay 42x24 and area ticks 28x28 (part of M5, not approved).
- 2026-11-25: Parents module BATCH 2 (approved M2 Dashboard, M3 My Children, M4 profile tabs), website only. ParentHomePage rewritten (ChildPicker with age, week card with full day names, 3 stats of the chosen child, Next steps, "Your children" list with Open Child Mode, "Words to practise", slim dismissible Explore bar; the Letters learned tile, the per-child week bars, the ⋯ menu and the second Explore tile are gone: Delete/Edit/Progress remain on My Children and the profile). ChildrenPage cards: same three parts, Open Child Mode full width + Progress/Edit profile side by side. ProfileTabs: SectionPicker on <=640px (tabs hidden), back link "My Children"; Overview cards become one list on phones. WeekDots full prop; ChildPicker showAge; dead kid-tile/explore/add-child CSS removed; 10 new Urdu strings (need native review). Tested 1440/390/320 (no overflow, no console errors), picker/chooser/Open Child Mode/dismiss/empty/no-PIN/Urdu paths. Known trade-off: after "Dismiss" the Dashboard has no Explore KidBuddy entry any more (the onboarding step 4 still has it). Batch 3 (M6 Progress, M7 Plan/Struggle, M8 Settings/Account, M9 Add a child) not started.
- 2026-11-25: Parents module BATCH 3 (approved M6 Progress, M7 Plan + Struggle words, M8 Settings/Account/Password/PIN, M9 Add a child), website only. ParentProgressPage: 3 stats, activities card (built ones), Letters card ("This device only", grid only when saved letters exist), one "On the way" line, Share-report button removed. ParentPlanPage: Struggle words row with a word count (fetches the current child), details "n more planning tools". StruggleWordsPage: "Say it" button (Button + speak), 8px #C2418A meter, Inter word cell. Settings: Therapist section and the time-limit/notification rows replaced by one OnTheWay line, Parent PIN row in the Account pane; AccountPage has a PIN row (Update/Create with PinModal). Forms: 4px focus ring, chips 44px, password rules as solid chips, Parent Mode .form-actions right-aligned (english.css keeps its centred ones). CreateChildPage: "Choose a buddy", 6-column square buddy grid (4 columns <=420px), preview name in Inter. 20+ new Urdu strings (need native review). Tested 1440/390/320 (no overflow, no console errors), letters grid with/without saved stars, child switch, plan details, settings tabs, PIN paths, Urdu progress. All approved batches (M1-M4, M6-M10) are now in; M5 (Areas of support + Activities) was not approved and is untouched.
- 2026-11-25: Parent Mode made a step smaller on request ("everything is very large"), website only: a scoped compact scale for .app and .setup at >=641px (tokens --t-xs 12 / --t-sm 13.5 / --t-base 15 / --t-lg 19 / --t-xl 24, buttons 38 (sm 32, lg 44), inputs 42, sidebar 240, top bar 60, content padding 24/28, radius 10/14, smaller buddy tiles and page title 26px on profiles). Phones keep the larger sizes; Child Mode, Welcome, intro and Login untouched. Trade-off: desktop tap targets are now 32-38px (the approved M10 said 44px); links keep the 44px tap area. No overflow at 1280/1024/768/660 on all 18 parent routes.
- 2026-11-25: Website CHILD MODULE audit (AUDIT ONLY, no code changed, website only): 17 screens inventoried and captured at 1440/1280/768/390/320, tested with the demo child and a logged-in test child against a local fake API (speech recognition, alignment and AAC labels untouched). 10 findings (0 critical, 4 high: no Next on Reading Time, controls under 44px, 4 of 6 Home tiles are dead Soon tiles, unreadable preview banner). Mockups + tokens published as a private artifact with approval ticks C1-C7. Waiting for approval.
- 2026-11-25: Child module BATCH 1 (approved C1, C4, C5, C6, C7; C2 Home and C3 Read Along layout NOT approved, untouched), website only, speech/alignment/AAC logic untouched. tokens --k-sm 15 / --k-base 18, no Nunito 900 (font link drops it); kid-top 72px with 48px controls, preview banner #6B4700 on #FFF3D6 + 44px Exit preview; kid-sun/kid-cloud no longer animate (still backdrop; the Animations switch no longer matters for them); case-toggle 56x44, "That was tricky" is a 56px bordered button (.link-button), AAC strip min 56px, compact speak 48px, alphabet stars #8a5a00 filled / #4f5870 hollow (contrast), phone tap targets 44px (language, A/a, logo); ReadingSummaryPage: "You tried every sentence. Great job." + Read again (to sentence 1 of the same level) + Finish; 2 Urdu strings (need review). Not built: "words to try again soon" on the finish screen (needs the session word list). Preview capture: no overflow, no console errors, alphabet contrast misses 81 -> 0, tiny controls gone on desktop; 26 unit tests pass.
- 2026-11-25: Child module BATCH 2 (approved C2, C3), website only, speech/alignment/AAC logic untouched. ChildHomePage/EnglishHubPage/EnglishActivitiesPage: built tiles only + .quiet-note "More is coming: {list}" (the Soon tiles and the shy/boing tap are no longer reachable from these pages); ReadingPages: nextSentence() (stops the voice, next sentence or done) + .reading-actions, "Sentence n of m" on both pages, Your turn buttons side by side, mascot 64px; english.css: passage clamp(34,5vw,60), line-height 1.6, .lit = #FFE9A8 with 6px #F5B800 underline, progress bars 44x10, instruction 20px. 2 Urdu strings (need review). Tested (Preview, 1440/390/320): no overflow, no console errors, Next sentence / Finish / I said it paths, home shows 2 tiles + one line, Urdu reading screen no overflow; 26 unit tests pass. All approved Child items (C1-C7) are now in.
- 2026-11-25: Child C2 UNDONE on request ("More is coming" line): Child Home, the Reading & Writing hub and the activities pages are back to the earlier layout (all tiles, Soon ones last, with the Soon badge and the buddy reply). C3 (reading screens) stays. The quiet-note CSS and the "More is coming: {list}" Urdu string are now unused.
- 2026-11-25: Child Mode made a step smaller on request, website only: scoped compact scale for .kid-app at >=641px (end of english.css): tokens --k-sm 14 / --k-base 16 / --k-lg 20 / --k-xl 24 / --k-2xl 34, top bar 64px with 44px controls, smaller Home buddy/tiles, hub tiles, titles, reading passage (clamp 30-50px), mic 88px, buttons 48px. Phones keep the larger sizes; Parent Mode, Welcome, intro, Login untouched. Preview capture: no overflow, no console errors, desktop tap targets 44px or more (My Buddy 108x41 and the stars pill 361x39 are the two exceptions).
- 2026-11-26: Merged Eashal's branch (a541921: website/ + her log lines; app code was identical) into zunaira with --no-ff --no-commit (the user commits). metro.config.js now ignores website/ too. Added section 2b 'Website ↔ app guide' (folders, file map, sync state: nothing ported to the app yet) and replaced the 'branch local' rule. No app screens changed.
- 2026-11-26: Ported the website's "Cuddle Pals" buddies (website step 2a): new mascot + logo PNGs, avatars.js ratios + MASCOT_SCALE 0.85, wave = whole-body rock (drawn arm, feet, code shadow and per-avatar buddyConfig removed), smaller TITLE_MASCOT / AUTH_MASCOT_SIDE / CHILD_PREVIEW_MASCOT / HOME.BUDDY_SIZE / onboarding buddy / picker picture. No packages, no server change. Untested on a phone.
- 2026-11-26: Website child port STEP 1 (Read Along): Reading Time got 'Sentence n of m', a Next sentence / Finish button beside the mic, bigger words and wider progress bars; new components/ReadingWord.js (yellow glow + gold line, also on Your turn) + readingConfig.js; Summary: 'Nice work. Great job.', Read again + Finish. 4 Urdu lines (need review). No packages. Step 2 (items 4-6) waits for 'continue'. Untested on a phone.
- 2026-11-26: Website child port STEP 2 (items 4-6): Talk strip 100 high, delete/clear 30 -> 44, Speak 64, page arrows 48 (numbers in aacConfig); greeting.js says 'Good night!' 8 pm-5 am (4 Urdu lines); Preview exit button 44 high; alphabet tiles show unearned stars as dark outlines (StarsRow `outlineEmpty`). README notes. No packages. Approved items 1-6 done; 7-12 wait for the user's choice. Untested on a phone.
- 2026-11-26: Website child port STEP 3 (items 9-11): ChildInstruction = buddy + speech bubble (DESIGN.ASK_MASCOT/ASK_GAP; `avatar` prop, used by My Buddy; the second buddy inside the Your turn card removed; `tint` prop gone); 'Coming soon' tiles are quiet grey with faded icons and keep their places (SOON in theme.js, PastelTile `soon`, ModuleCard); sun + clouds are still (KID_SCENE_MOTION.skyMoves false; flowers still sway). No packages, no new text. 7, 8, 12 undecided. Untested on a phone.
