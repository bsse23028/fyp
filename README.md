# KidBuddy – Phase 2.2: modules · Redux Toolkit · reading topics with 3 levels · struggle words

React Native + Expo, plain JavaScript (`.js`). Frontend only: everything is saved on the
phone with AsyncStorage until the backend exists.

---------------------------------------------------------------------------
## 1. Set up (once)

```bash
npx create-expo-app@latest KidBuddy --template blank
cd KidBuddy
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-font expo-status-bar @react-native-async-storage/async-storage @expo-google-fonts/nunito @expo-google-fonts/inter expo-camera expo-speech @reduxjs/toolkit react-redux
```

NEW in this version: `@reduxjs/toolkit` and `react-redux` (the Redux store). If your project already
exists, just run `npx expo install @reduxjs/toolkit react-redux`. Always use `npx expo install`, not `npm install`.

Copy from this zip into your project: `App.js` (replace), the whole `src/` folder
(**delete the old `src` first** - the folders were reorganised, so old files would be left over) and the whole `assets/images/` folder. **Do not delete the
`assets/icon.png`, `splash-icon.png` ... files that Expo created** – copy only the
`images` folder *into* `assets/`.

## 2. Run

```bash
npx expo start -c
```
Phone and computer on the same Wi-Fi, scan the QR code with Expo Go. (`--tunnel` if it can't connect.)
**The old version saved accounts in a different format: if the app behaves strangely, clear Expo Go's
storage once (or uninstall/reinstall Expo Go).**

---------------------------------------------------------------------------
## 2b. What changed in Phase 2.2

| # | Update | Where to look |
|---|---|---|
| 1 | **Modules.** Everything about English is now ONE folder. Numbers, Feelings ... will get their own folders next to it | `src/modules/english/`, `src/modules/index.js` |
| 2 | **Redux Toolkit** holds the child profiles and the English module's data. **AuthContext** still holds the logged-in parent (see section 5c) | `src/app/store/`, `src/modules/english/store/englishSlice.js` |
| 3 | **Reading topics with 3 levels.** Read Along now asks: topic -> level (Easy / Medium / Hard) -> sentences. The topics are stored in a JSON file (5 topics, 45 sentences) | `src/modules/english/data/readingTopics.json` |
| 4 | **Struggle words** screen in Parent -> Plan (sample words for now; ready to be filled automatically) | `src/modules/english/screens/StruggleWordsScreen.js` |
| 5 | The old 3 hard-coded sentences are now **Animals -> Medium** (nothing was lost) | `readingTopics.json` |

Screens, components and coding style are the same as before - only folders moved and the import paths changed.

---------------------------------------------------------------------------
## 3. What changed in Phase 2.1 (8 updates)

| # | Update | Where to look |
|---|---|---|
| 1 | **Password rules**: 8+ characters, uppercase, lowercase, number, special character, no spaces, with a live ✓ checklist | `src/utils/validation.js` (`PASSWORD_RULES`), `components/PasswordRules.js` (used by Sign Up, Reset Password, Change Password) |
| 2 | **Parent account**: edit name, change password (old password + email code), PIN is **Create PIN** the first time and **Update PIN** afterwards (old PIN + email code) | `screens/account/` (ParentProfile, ChangePassword, UpdatePin), `components/CodeStep.js`, `AuthContext.js` |
| 3 | **Status bar** kept visible (dark icons on white) | `App.js`, `components/Screen.js`, `navigation/AppNavigator.js` + see section 7 |
| 4 | **Header separator**: thin line + soft shadow under the header | `components/AppHeader.js` |
| 5 | **No bottom bars.** 🏠 Home button is in the header. Back arrows inside screens stay | `AppHeader.js`, `Screen.js` (deleted `ChildNav.js`, `ParentTabs.js`) |
| 6 | **Child profile = 1 step.** Areas of support and activities moved to Edit profile, each with its own screen and Save. "About my child" became the new **Personalize stories** form | `screens/child/CreateChildProfileScreen.js`, `screens/profile/EditProfileScreen.js` (hub) + `EditChildSectionScreen.js`, `utils/childOptions.js` |
| 7 | **Switching child needs the Parent PIN.** Child Mode has no way back to "Who is learning?" except 🔒 Parent → PIN → Parent Home → Open Child Mode | `navigation/helpers.js` (`goToChildHome`), `Screen.js` |
| 8 | **English / اردو really switches the content** (see section 6) | `src/shared/i18n/ur.json`, `shared/components/AppText.js` |

## 4. The flow

```
Splash → Welcome → Onboarding → Create Parent Account → Verify email → Permissions (once)
→ Create Child Profile (ONE step) → PARENT HOME
PARENT HOME:  greeting · Open Child Mode (hero card) · children list (tap = choose, ⋯ = View progress / Edit / Delete) · Add another child · Explore KidBuddy
☰ (header, Parent Home only) → drawer: Plan · Progress · Settings · Log out
Settings → My account → edit name · Change password · Create/Update PIN          Settings → Log Out
Edit (child card) → Edit profile → Basics · Areas of support · Activities · Personalize stories · Delete profile
Open Child Mode → "Who is learning?" → Continue as Zara → CHILD HOME → English → Alphabets (letter → Learn · Play · Star Check) | Sentences → Read Along → Pick a topic → Pick a level → Your turn (per sentence) → Nice reading!
CHILD MODE header:  logo (tap = My Buddy) · 🏠 Home · 🔒 Parent (PIN) · English | اردو
```
The app always opens in Parent Mode. Child Mode is never saved.

## 5. Structure

```
App.js
assets/images/avatars/         mascot-<name>.png + logo-<name>.png (rabbit, wolf, bear, panda)
src/
  app/                         THE SHELL - things the whole app needs
    navigation/                AppNavigator.js · helpers.js
    store/                     store.js · childSlice.js · useChild.js · ChildLoader.js   (Redux Toolkit)
    context/                   AuthContext · LanguageContext · DeviceContext
  shared/                      THE TOOLBOX - used by every screen and every module
    components/                Screen · AppHeader · AppText · Chip · SpeakButton · Mascot ...
    theme/  utils/  i18n/      theme.js · storage.js · progress.js ... · ur.json + translate.js
    config.js
  screens/                     app screens that do not belong to one module
    onboarding/ auth/ permissions/ child/ account/ parent/ profile/ home/ (Child Home)
  modules/                     LEARNING MODULES - one folder each
    index.js                   the list of modules (add new ones here)
    english/                   Read Along: topics, levels, struggle words  (see its README.md)
```
Style rules are unchanged: a comment block at the top of every file, styles at the bottom, colours/fonts from `theme.js`.

## 5b. Personalize my child's stories (Edit profile → Personalize stories)
A 5-step, fully optional form (every step has **Skip**, nothing is required, "Save and close" works at any time):
People · Favourite things · Hobbies and interests · Everyday world · Special instructions.
- **One field per fact** (mother, father, each sibling, each other person + relationship ...), never "family, pets" in one box.
- **Input types:** text boxes, tap-to-pick chips with "type your own" (`components/ChoiceField.js`), colour circles
  (`components/ColorChoice.js`), a multi-line box with tap-to-add ideas, and a sample sentence preview.
- **To add or change choices:** edit the lists in `src/shared/utils/storyOptions.js` (and add the Urdu in `src/shared/i18n/ur.json`).
- **Saved as** `child.story` (see the top of `storyOptions.js`), always in English words so a story writer
  (backend phase) gets consistent values. Profiles from the earlier version keep their hobbies and hometown.

## 5c. Redux Toolkit, the backend and the contexts (the rule used in this project)
- **The backend is the source of truth** for accounts, the Parent PIN (stored as a hash) and the child profiles.
  The app talks to it only through `src/shared/api/client.js` (endpoints: `backend/docs/API.md`).
- **Redux Toolkit keeps what came from the server**: `app/store/authSlice.js` (who is logged in, `hasPin`),
  `app/store/childSlice.js` (children, active child, Parent/Child mode, the choice lists), `app/store/previewSlice.js`
  (Explore KidBuddy switch) and one slice per module (`modules/english/store/englishSlice.js`).
  The server calls are `createAsyncThunk`s inside those slices. New shared state goes into a slice from now on.
- **Screens use small hooks**, never the slices directly: `useAuth()` (`app/context/AuthContext.js` is now only a thin
  wrapper over authSlice), `useChild()`, `useChildOptions()`, `usePreview()`.
- **LanguageContext / DeviceContext / HeaderContext** stay React contexts: phone settings and the fixed header, not server data.
- Add a field: `initialState` + a reducer (or a thunk) in the slice, then expose it through the hook a screen already uses.

## 5d. Read Along: topics and levels
Flow: Words -> Read Along -> **Pick a topic** -> **Pick a level** -> sentences (Reading Time -> Your turn, repeated) -> Nice reading!
- **Add / change a topic:** edit `src/modules/english/data/readingTopics.json`. Copy a topic block and change the words.
  Each topic has `easy`, `medium`, `hard` lists of sentences (`words`, `focus`, and the Urdu `ur`). The tiles follow the file.
- **Add its Urdu title:** one line in `src/modules/english/i18n/ur.json` (`"Weather": "موسم"`).
- **Later, personalised stories:** generate a topic in the same shape and call `dispatch(saveCustomTopic(topic))`
  (`englishSlice.js`). It is saved on the phone and appears in the topic list by itself.

## 5e. Struggle words (Parent -> Plan -> Struggle words)
- Shows the words saved for the child (`state.english.struggleWords`). While there are none, it shows sample words from
  `data/sampleStruggleWords.json` with a "Sample words" note.
- **Later, automatic:** when the speech check finds a word the child could not read, call
  `dispatch(reportStruggleWord(child.id, 'lightning', 'Weather'))`. The word is counted, saved, and the screen updates.
  The screen itself does not need to change.

## 5f. Adding a new module (Numbers, Feelings ...)
1. Copy `src/modules/english` to `src/modules/numbers` and replace its content (screens, data, slice, `index.js`).
2. In `src/modules/index.js` add `import numbers from './numbers';` and put `numbers` in the `MODULES` list.
3. Make the Child Home button open the module's first screen (`screen: 'NumbersHub'` in `ChildHomeScreen.js`).

The navigator, the Redux store and the Urdu words pick the module up from the list. When you want help with one module,
send only its folder (e.g. `src/modules/numbers`) - its README lists what it may import from the rest of the app.

## 5g. Preview mode (Explore KidBuddy) and the new Parent Home
- **Preview mode:** Parent Home → *Explore KidBuddy* opens Child Mode with the demo child **Buddy**
  (`src/shared/utils/demoChild.js`, never saved, never in the child list). Every built activity is open, the English
  module uses the built-in `data/readingTopics.json`, unbuilt tiles show "Coming soon".
- **One switch:** `state.preview.active` (`app/store/previewSlice.js`, hook `usePreview()`). It is checked in three places only:
  `useChild()` (demo child + every save becomes a no-op), the `condition: notInPreview` of every child-data thunk
  (sessions, select child, children CRUD, reading content, custom topics, struggle words), and the English selectors.
  Not stored on the phone, so it is always off after a restart; logout / expired login and opening Parent Home also switch it off.
- **Leaving:** the yellow banner under the header ("Preview mode - nothing is saved") has *Exit preview* (and 🔒 Parent does the same).
  With a Parent PIN the PIN pop-up is asked first; without one it exits straight to Parent Home.
- **Parent Home** is split into `src/screens/parent/components/`: `ParentGreeting`, `OpenChildModeCard`, `ChildList`,
  `ChildActionsMenu`, `ExploreCard`, `ParentDrawer`. The ☰ button is added by `<Screen onMenuPress={...}>` (HeaderContext keeps the handler),
  so no other header changes.
- **New look:** tokens `CALM`, `CALM_RADIUS`, `CALM_SPACING`, `CALM_SIZES`, `CALM_SHADOW` in `theme.js` (old tokens untouched).
  Animations live in `src/shared/utils/motion.js` (`ANIMATIONS_ENABLED` / `setAnimationsEnabled` turns them all off) with
  `AnimatedPressable`, `FadeInView`, `SoftButton`, `SoftShapes`, `ComingSoonModal` in `shared/components`.

## 5h. English → Alphabets (letters A-Z, made for toddlers 2-5)
- **Flow:** Child Home → English (**EnglishHub**: Alphabets · Words *coming soon* · Sentences = the existing Read Along)
  → **AlphabetList** (26 tiles, stars per letter, next letter glows, all open) → **LetterLesson**.
- **The lesson is ONE swipe pager** (`shared/components/SwipePager.js`) of 7 pages: Look · Listen (picture 1) · Listen (picture 2)
  · Say · Play · Star Check · Result. Swipe left = next, right = back (or tap the round icon arrows). Forward opens only when the
  page's small job is done; a locked swipe stretches and the buddy gives a spoken hint. Back is always open except in Star Check
  after the first answer and on Result. When forward opens, a 👉 slides to the arrow 3 times (repeats after ~6 s, max 3 more).
  No "Next" buttons and almost no written text: the buddy says everything. Top: 5 icon dots (eye · ear · mic · game · star).
- **Pages:** Look (the letter jumps, turns once and lands on its shadow, says its name, then 3 hops with the sound; also plays once
  as a demo) · Listen (one big toddler object, "A for apple", tap = dance + "A says ah, like apple") · Say (mic button, then thumbs-up)
  · Play (drag letter to picture · pop the letter bubbles · big and small, errorless hints) · Star Check (5 questions, stars from
  first-try answers: 4-5 = 3, 2-3 = 2, 0-1 = 1) · Result (stars pop in, icon buttons: next letter · play again · letter grid).
- **Case toggle** (top right, "A" / "a"): changes only how letters are drawn in the whole lesson; "Big and small" and the
  capital/small question swap roles in small-letter mode. The voice always says the letter name. Saved as `kidbuddy_alphabet_case`
  (not in Preview). Code: `modules/english/components/alphabet/LetterCase.js` + `CaseToggle.js`.
- **Progress:** `modules/english/store/alphabetSlice.js` keeps the best stars per child and letter on the phone
  (`kidbuddy_alphabet_progress`). `recordLetterResult(childId, letter, stars)` is the only save (replace its body for the backend);
  it never lowers a score and does nothing in Preview mode.
- **Letters / pictures:** `modules/english/data/alphabetData.js` (toddler emoji, Unicode 12 or older; `image: null` / `audio: null`
  are the slots for real art and recorded sounds; weak pictures are marked `WEAK`).
- **Sounds:** `shared/utils/sounds.js` (`playSound('pop')`, expo-audio). Files in `assets/sounds/` (pop, whoosh, boing, sparkle,
  tada, cheer-bell) are GENERATED by `node scripts/makeSounds.js`; replace them with real recordings of the same name. There is no
  "wrong" sound anywhere. `cheer()` in `shared/utils/speech.js` says a happy phrase ("Yay!", "Hooray!" ...) with a higher voice.
- **Confetti:** `shared/components/Confetti.js` (party popper from the bottom corners, max 24 pieces, never blocks touches) on
  Look / Say finished, every Play round and the Result page.
- **Buddy:** `shared/components/BuddyCharacter.js` (idle sway, tap = bubble + voice, drag and spring home, moods hop/happy/think/cheer/dance).
- **Switches:** animations `shared/utils/motion.js` (`ANIMATIONS_ENABLED`: off = pages change instantly, confetti = one still ✨);
  sound `shared/utils/sounds.js` (`SOUND_ENABLED`: off = effects AND voice silent); voice only `speech.js` (`SPEECH_ENABLED`).

## 5i. Living characters and celebrations
- **Talking pictures** (`src/shared/components/TalkingObject.js`): the Listen pictures (and, calmer, the Play and Star Check
  pictures) get blinking eyes that glance at the last touch, a smile that talks while the voice speaks, noodle arms with
  mitten hands, oval feet and a floor shadow. Moods: idle · wave · dance · jump · happy. Only the page on screen moves.
- **`talkingObjectConfig.js`** (same folder) holds every number: eye height / gap / size, mouth, arm length and thickness,
  hand and foot size, colours, blink and talk speed, and `OVERRIDES` per emoji (animals that already have a face only get
  arms and feet). Example: the eyes of the apple sit too low -> in `OVERRIDES` change `'🍎': { eyeY: 0.5, ... }` to `eyeY: 0.44`.
- **The buddy** (`src/shared/components/BuddyCharacter.js`) walks in from the left when a lesson opens, waves and says "Hi!",
  waddles back home after a drag, does a small "think" tilt after ~8 s without a touch, and on the Result page walks to the
  middle, cheers and waves. `walkTo(x, y, onArrive)` and `wave()` can be called through a ref.
- **`buddyConfig.js`** (same folder) has one block per avatar (rabbit, wolf, bear, panda): where the waving arm starts
  (`shoulder`) and where the mitten starts (`hand`), as fractions of the picture, hand size and colours, optional drawn feet,
  shadow width and whether to mirror the picture when walking left. `BUDDY_MOTION` holds the speeds and angles.
  Example: the bear's waving hand should start a little higher -> `bear.hand.y: 0.46` -> `0.42`.
- **Celebrations** (`src/shared/components/Celebration.js`): small wins play the "popper", the Result page "confetti" + "stars".
  They use free Lottie files that you add yourself: put `confetti.json`, `party-popper.json`, `stars.json`, `balloons.json` in
  `assets/lottie/` (see the README there, check each licence), then remove the `//` in front of the file's line in
  `src/shared/components/lottieFiles.js` and restart with `npx expo start -c`. Without a file the built-in confetti plays, so
  the app always works.

## 6. How English / Urdu works (beginner guide)
1. Every `<Text>` in the app is `import Text from '.../components/AppText'`. It looks the English text up in **`src/shared/i18n/ur.json`** (and the module lists) and shows the Urdu when اردو is selected. Text that is not in the file simply stays English.
2. **Add a new text:** write it in English in your screen, then add one line to `ur.json` (shared, or the module's own):
   `"Save my buddy": "میرا ساتھی محفوظ کریں"`
3. Text with a changing part uses `{name}` in the key: `"Delete {name}?": "{name} کو حذف کریں؟"`.
4. For things that are not `<Text>` (pop-up alerts, placeholders) use `translate('Cancel')` from `src/shared/i18n/translate.js`
   (placeholders on `TextField` are translated automatically).
5. Read Along sentences have an Urdu version inside `modules/english/data/readingTopics.json` (`ur: { words, focus }`).
   Words that belong to ONE module go in that module's own file (`modules/english/i18n/ur.json`); the app merges the lists.
6. Urdu text gets right-to-left writing and extra line height automatically.

**Not done yet:** the whole layout does not mirror to right-to-left (buttons keep their left/right places), and Urdu speech needs an Urdu voice installed on the phone.
The Urdu wording was written by Claude. Please have a native speaker review it before release.

## 7. Phone status bar
Three things keep it visible: `StatusBar` in `App.js`, one in every `Screen`, and `statusBarStyle` in the navigator.
If it is STILL missing on your phone, check **your project's `app.json`** (it is not part of this zip):
- there must be no `"androidStatusBar": { "hidden": true }`
- add `"userInterfaceStyle": "light"` so a dark-mode phone cannot turn the icons white on the white bar
See `app.json.example` next to this README. Then restart with `npx expo start -c`.

## 8. Good to know
- **Saved data:** accounts, PINs, children, sessions, stars, custom topics and struggle words are on the **backend** (loaded into Redux).
  AsyncStorage on the phone only keeps the login token, the language, "intro seen" and the camera/microphone answer (keys start with `kidbuddy_`).
- **Backend address:** `API_BASE_URL` in `src/shared/config.js` (your computer's Wi-Fi IP, port 4000). The app shows Retry when it cannot reach it.
- **Demo mode** (`DEMO_MODE` in `src/shared/config.js`): no real emails yet; the 6-digit code is printed in the backend terminal and a pop-up
  reminds you. If the choice lists or reading content cannot be loaded, the built-in lists / `readingTopics.json` are used.
- **Parent PIN** is checked and stored (hashed) by the backend; it never leaves the server.
- **Still "Coming soon":** English → Words, Plan sub-screens (except Struggle words), Numbers, Feelings, Talk, My Day, Sounds, Notifications, Export report, Therapist accounts.
- **Read Along** does not score the child's voice yet.
- The logos for wolf / bear / panda are temporary (head cut from the mascot + the KidBuddy name).
