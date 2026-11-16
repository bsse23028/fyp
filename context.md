# KidBuddy – project context for Claude

> **Claude: read this whole file at the start of every session, before touching code.**
> Keep it up to date: at the end of every task, add a line to the **Work log** (bottom) and fix any
> section that is no longer true. Last full update: **2026-11-15**.

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
- **Work on branch `local`. NEVER commit or push**: the user commits themself.
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

## 3. Tech stack (package.json, 2026-11-15)
- **Expo SDK 58** (`expo ~58.0.0`), React Native 0.88.1, React 19.3. Runs in **Expo Go** on a real phone.
- Navigation: `@react-navigation/native` + `native-stack` (NOT Expo Router).
- State: `@reduxjs/toolkit` + `react-redux`.
- Gestures / UI-thread animation (added 2026-11-16, only used by the Spelling game's `LooseLetter`):
  `react-native-gesture-handler ~3.3.0` (v3 HOOKS api: `usePanGesture` + `GestureDetector`; events are flat, `e.translationX`),
  `react-native-reanimated 4.7.1`, `react-native-worklets 0.13.0` (`scheduleOnRN`). No babel.config.js (the Expo preset adds
  the worklets plugin). `App.js` root = `GestureHandlerRootView`. Everything else still uses RN `Animated` via motion.js.
- Storage: `@react-native-async-storage/async-storage` (keys start with `kidbuddy_`, listed in `src/shared/utils/storage.js`).
- Voice: `expo-speech`. Sound effects: `expo-audio` (I added it). Icons: `@expo/vector-icons` (Ionicons; I added it,
  because SDK 58 does not bundle it). Lottie: `lottie-react-native` (I added it). Camera/mic: `expo-camera`.
- Fonts: Nunito (kids' screens), Inter (forms), Noto Nastaliq Urdu.
- Entry: `index.ts` → `App.js`. `tsconfig.json` exists but the app is JS.
- Backend address: `API_BASE_URL` in `src/shared/config.js` (the PC's Wi-Fi IP, port 4000). `DEMO_MODE = true`
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
assets/images/avatars/       mascot-<rabbit|wolf|bear|panda>.png + logo-*.png
assets/sounds/               6 generated WAVs (pop, whoosh, boing, sparkle, tada, cheer-bell)
assets/lottie/               README.md only; the user will add Lottie JSON files (none yet)
scripts/makeSounds.js        generates the WAVs: `node scripts/makeSounds.js`
```

## 5. Core architecture (how things fit)
- **Redux** is the direction for ALL new shared state (the user said so). Screens use hooks, not slices:
  `useAuth()`, `useChild()`, `useChildOptions()`, `usePreview()`.
- **Modules plug in** via `src/modules/index.js`: the store picks up `reducer` (+ optional `reducers` map for extra
  slices, e.g. `englishAlphabet`) and `load`; the navigator picks up `screens` (optional `options`, e.g. `{ animation: 'fade' }`).
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
- **Calm design tokens** in `theme.js`: `CALM`, `CALM_RADIUS`, `CALM_SPACING`, `CALM_SIZES`, `CALM_SHADOW`, `CALM_ACCENTS`
  (letter colours), `CALM_SUCCESS`. The old tokens (`COLORS` …) stay for older screens. Warm off-white background, soft teal,
  no harsh red, tap targets ≥ 56.
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

## 6. Parent side (redesigned)
- **ParentHome** = greeting + week stats, `OpenChildModeCard` (the hero card → ProfilePicker with the chosen child preselected),
  `ChildList` (tap = choose, ⋯ = `ChildActionsMenu`: progress / edit / delete), "Add another child", `ExploreCard` (starts Preview).
  ☰ → `ParentDrawer` (Plan, Progress, Settings, Log out at the bottom). Components are in `src/screens/parent/components/`.
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
  - Mascot notes: rabbit, bear = arm already raised; wolf = suit, paws down; panda = holds backpack straps.
    The bear PNG has a faint "pngtree" watermark (licence to check).

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
- Recorded letter sounds and real pictures should replace TTS phonics and emoji (`audio`/`image` slots).
- The Urdu wording (written by Claude) needs a native-speaker review. Some keys are duplicated in the shared and
  module `ur.json` files (harmless).
- The language toggle still saves to AsyncStorage during Preview (a phone setting, which I left on purpose).
- Not built yet: Words activities other than Spelling and Read Along, Sentences redesign, Numbers/Feelings/Talk/My Day/Sounds modules, therapist accounts,
  a sensory settings screen (to connect `setAnimationsEnabled` / `setSoundEnabled`), placement/locking of letters.
- Tune on a real phone: `talkingObjectConfig.js` OVERRIDES, `buddyConfig.js` hand positions, `FIRST_DEMO_DELAY` / `FIRST_HINT_DELAY`.

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
