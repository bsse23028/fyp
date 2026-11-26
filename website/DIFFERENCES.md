# KidBuddy – mobile app vs website differences

Compared **2026-11-24** against the Expo mobile app (`App.js`, `src/`) and the web app (`website/frontend`).

**Summary:** Almost every built screen and flow exists on both sides (auth, parent mode, Child Mode groups, English activities, AAC Talk, Explore/preview, activity gating, ChildSetup, areas of support). The website is **not** a visual clone of the phone. Gaps fall into three buckets: **same feature, weaker behaviour**, **same feature, different shell/look**, and **intentional platform differences**.

---

## 1. What already matches (no gap)

| Area | Both have |
|---|---|
| Auth | Sign up, email code, log in, forgot / reset password (6-digit code) |
| Onboarding | Splash/Welcome, multi-step intro, last step “Try KidBuddy first” → Explore without account |
| Therapist CTA on Welcome | “Coming soon” |
| First steps | Permissions, create child (all activities **off** by default), optional ChildSetup (support / activities / stories) |
| Parent | Home/Dashboard, Plan, Progress, Settings/Me, account, change password, PIN, children list, edit profile, personalize stories, struggle words |
| Explore | Preview demo child “Buddy”, nothing saved, preview guide sentences, exit with PIN when logged in |
| Child Mode | Profile picker, Child Home (6 FYP groups, activity gating), LearningGroup, My Buddy (11 avatars), 🔒 Parent PIN lock |
| English (Modules 1–5) | Hub, activities pages, Alphabets + 7-step lesson, Trace, Bubble Pop, Match Pairs, Letter stories, Spelling + sentence, Read Along (topics → level → along → your turn → summary) |
| Talk | AAC board: sentence strip, quick words, 48 core (Big/All), 13 topics, ARASAAC pics, EN/UR |
| Shared rules | EN/Urdu + RTL, sound master switch, ABC music on English pages, stars/streaks/Read Along from shared API |
| Coming soon (same) | Reading Assist, Phonics tile, Numbers / Feelings / Speech Sounds / My Day, therapist invite/share, daily time limit, badges, social stories, routine builder, etc. |

Data and accounts are shared through `fyp/backend` (phone: Bearer token; website: cookie gateway on `:5050`).

---

## 2. Behaviour gaps (same feature, phone is stricter / richer)

**Closed on 2026-11-25** (the website now follows the app's rules; the Figma look stays). What was fixed:

### 2.1 Letter lesson (`LetterLessonPage` now follows `LetterLessonScreen`)

| Behaviour | Now on the website |
|---|---|
| Look first demo | Plays once by itself (after ~4 s) and does **not** finish the page; the child must tap |
| Silent hints | “Tap the letter!” is only shown in the bubble; other hints are spoken |
| Speaker (🔊) | Above the forward arrow; repeats the last thing the page said |
| Pages | Mount once and stay mounted (hidden); only the current page is active, so going back never re-runs a demo |
| Play swipe guard | On Play a touch swipe only turns the page from the bottom 90 px strip |
| Listen | “A for apple!” on arrival, then “Tap the picture!”; tap = “A says … like apple.” |
| Say | Mic plays the sound 3× → a thumbs-up appears → tapping it finishes the page (was: finished by itself) |
| Play | Picture round with `examples[0]`; 7 bubbles (3 right, glow after 8 s idle); Big & small with 2 targets; app's instructions and success lines; errorless help “Let's try again” → glow “Look at the glowing one.” → “Here, let me help.”; “You did it!” card |
| Star Check | **One try** per question (miss = the choice fades, the right one glows, “Good try! It was this one.”); after the 5th a star waits and the arrow opens Result; stars saved when the check ends |
| Result | Play again · Next letter (big) · All letters; with 1 star “Play again” is highlighted |
| Buddy | Walks in, then hop / think / cheer / wave moods (CSS) |

### 2.2 Spelling (`SpellingPages` now follows `SpellingBoard` / `SentenceBoard`)

| Behaviour | Now on the website |
|---|---|
| Intro | “Let's spell this word!” then the word (skipped if a letter is already picked up) |
| Hold letter | Holding a letter plays its sound and repeats it (700 ms gap, max 8); letting go stops it |
| Wrong place | Boing + wiggle, no voice; 2 misses = slot glows; 3 = “Here, let me help.” |
| End of word | Letter parade (hop + name) → picture pops out + tada → word read → word turns one colour, picture sits on it → 2 bounces + bell + “Yaaay!” → sentence after 1.5 s |
| Sentence | “Now finish the sentence!”; picking a word up says it (again after 1.5 s held); hint/help like the letters; end = sentence read, bounce, bell, “Yaaay!”, then the buttons |
| End buttons | Play again · Next word (hidden when there is no other word) · All words |
| Drag feel / no-art word | Still pointer drag + magnet pad / emoji (platform difference, §4) |

Also brought in line (same audit): **Bubble pop** (7 bubbles that come back, 4 pops per round, letter sound on pop, glow resets after each find, 3 letters, Play again / Back, no fake stars), **Match pairs** (2.6 s peek, “Find the pairs!”, pair = chime + letter sound, miss turns back after 1.3 s, 3 misses in a row = a pair glows + “Let's look again”), **Trace** (intro then stroke cue in order, letter sound + popper per letter, “Say it again” / “Start again” while tracing, Play again · Next · All letters), **Letter stories** (tap the video = pause / play, no player bar).

### 2.3 Characters & feedback (across Child Mode)

| Behaviour | Mobile | Website |
|---|---|---|
| Buddy | Walk in, wave, moods, drag-home, spoken bubbles | Image + bob; tap speaks a line |
| Picture friends | `TalkingObject` (eyes, arms, dance) | Emoji / simple CSS dance |
| Celebrations | Lottie when files exist, else confetti | CSS confetti burst |
| Letter sounds | Recorded Phonicademy MP3s (+ TTS fallback) | Browser TTS only (licence; see §4) |

### 2.4 Smaller interaction notes

| Topic | Mobile | Website |
|---|---|---|
| English hub greeting | Bubble silent (`messageSilent`) | Text bubble (no auto-speak) — OK |
| Child Home greeting card | Removed; bubble tap only reads greeting | Figma left greeting panel (look difference, not a missing flow) |
| Alphabet stars / A–a case | Phone `AsyncStorage` | Browser `localStorage` — same idea, **not** shared across devices |
| Parent “Sound and motion” | Switches exist in code; no full settings UI for them | Settings → Sound and motion (website has **more** control) |

---

## 3. Shell / look differences (same jobs, different UI)

Kept on purpose for the Figma web design. **Not** required for functionality-only parity.

| Topic | Mobile | Website |
|---|---|---|
| Design system | KidBuddy palette (lavender mist, coral buttons, purple headings), Sheet, PastelTile | Figma tokens (indigo actions, cream Child Mode, Inter parent / Nunito child) |
| Parent navigation | Bottom tabs: Home · Plan · Progress · Me | Sidebar: Open Child Mode, Dashboard, My Children, Plan (+ Struggle words), Progress, Settings |
| Parent Home | Open Child Mode card + child list on one sheet | Dashboard layout + side column; children also under **My Children** |
| Child Mode chrome | Fixed header: logo, home, 🔒 Parent | Figma top bar: Back · Home pills, logo, sound, language, 🔒 Parent Exit |
| Child Home layout | Buddy + pastel module tiles on Sheet | Left greeting/buddy · right module grid |
| Entry / auth | SoftShapes, deep-purple buttons, buddy peek | Sofa / split value panel + form card |
| English hubs | PastelTile grid | White / KidTile cards (Figma child palette) |

---

## 4. Intentional platform differences (do not “fix” unless product changes)

From [`website/README.md`](README.md) §11, still accurate:

| Topic | Why different |
|---|---|
| No Google / social login | Shared API is email + password only |
| No recorded phonics on the web | Licence forbids publishing clips as standalone web files |
| Permissions page | Browser getUserMedia vs phone Settings |
| Spelling missing art → emoji | Clearer on a large screen; app uses buddy |
| Urdu voice quality | Depends on OS/browser voices |
| Struggle word on “Your turn” | Web already posts glowing word via `POST /struggle-words`; app’s speech check is still future |

Also: website gateway adds httpOnly cookie session, CSRF, rate limits; phone uses Bearer JWT. Same business API underneath.

---

## 5. Screen map (quick)

| Mobile screen | Website route / page |
|---|---|
| Splash / Welcome | `/` (`LandingPage`) |
| Onboarding | `/onboarding` |
| LogIn … ResetPassword | `/login` … `/reset-password` |
| Permissions | `/permissions` |
| CreateChildProfile | `/children/new`, `/parent/children/new` |
| ChildSetup | `/parent/children/:id/setup` |
| ParentHome | `/parent` |
| ParentPlan / Progress / Settings | `/parent/plan` · `progress` · `settings` |
| EditProfile / EditChildSection / PersonalizeStories | `/parent/children/:id` (+ `/:section`, `/stories`) |
| StruggleWords | `/parent/struggle-words` (+ Plan link) |
| ProfilePicker | `/who` |
| ChildHome | `/child` |
| LearningGroup | `/child/group/:groupId` |
| EditAvatar (My Buddy) | `/child/buddy` |
| AACBoard | `/child/talk` |
| EnglishHub … Spelling / Read Along / Trace / Games / Stories | `/child/english/*` |

No major **missing** built screen on either side for the features above. Unbuilt modules stay “Coming soon” on both.

---

## 6. Suggested fix order (functionality only)

If closing behaviour gaps while **keeping the Figma look**:

1. ~~Letter lesson~~ done 2026-11-25  
2. ~~Spelling~~ done 2026-11-25  
3. Leave §3 (look/shell) and §4 (intentional) alone unless product asks  

See also the parity plan in Cursor plans (`website_function_parity`).

---

## 7. Sources

- Mobile context: [`context.md`](../context.md)  
- Website overview + intentional diffs: [`README.md`](README.md)  
- Routes: [`frontend/src/App.jsx`](frontend/src/App.jsx), [`frontend/src/pages/english/EnglishRoutes.jsx`](frontend/src/pages/english/EnglishRoutes.jsx)  
- Mobile screens: `src/screens/*/index.js`, `src/modules/english/index.js`, `src/modules/talk/index.js`
