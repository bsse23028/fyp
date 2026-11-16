---
name: kidbuddy-animation
description: Implementation guide for animation and interaction in KidBuddy (Expo SDK 58, React Native 0.88) — Rive animations and state machines / data binding, React Native Reanimated 4, React Native Gesture Handler 3, drag-and-drop learning games, animated cartoon characters with sound and speech, and Expo Go vs development-build compatibility. Use before adding or changing any animation, gesture, drag-and-drop game, Rive file, talking character, or animation-related package.
---

# KidBuddy animation, gestures and characters

Practical notes for building calm, toddler-friendly motion in KidBuddy.
Checked against the official docs on 2026-11-15:
[Rive](https://rive.app/docs) · [Reanimated](https://docs.swmansion.com/react-native-reanimated/) ·
[Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/).
Libraries change every release, so **verify the real API in `node_modules/<pkg>/lib/typescript/**/*.d.ts`
(or `build/*.d.ts`) before writing code.**

---

## 0. Project rules that win over everything below

Read `context.md` first. The rules from it that affect animation work:

- **The app is plain JavaScript.** The examples below are in TypeScript (types help explain the APIs).
  In this repo, write `.js` files and **delete the type annotations** (`: number`, `<View>`, `type X = …`).
  Do not add `.ts`/`.tsx` files unless the user asks.
- **Every animation goes through `src/shared/utils/motion.js`** (`ANIMATIONS_ENABLED` switch).
  Today it wraps React Native's `Animated` (`useNativeDriver: true`, transform/opacity only).
  If Reanimated is added, it must obey the same switch (see §2.6).
- **Only the screen in front may run loops.** Pass an `active` prop and stop loops when it is false.
- **Sounds and voice** go through `src/shared/utils/sounds.js` (`playSound`, `SOUND_ENABLED`) and
  `src/shared/utils/speech.js` (`speak`, `speakAsync`, `cheer`). There is never a "wrong" sound.
- **Packages:** only with `npx expo install <pkg>`, only when really needed, and tell the user which and why.
  Never install as a side effect of a task that did not ask for it.
- Tweakable numbers (sizes, speeds, offsets) go in ONE config file per feature, with a comment on each number.
- Calm design: soft springs, no flashing, no fast shaking, no harsh red, tap targets ≥ 56.

---

## 1. Expo Go vs development build (check this FIRST)

The user tests in **Expo Go**. Expo Go can only run native code that is already inside it.

### How to check if a package works in Expo Go

1. Look it up in the SDK's pinned list:
   ```bash
   grep '"react-native-reanimated"' node_modules/expo/bundledNativeModules.json
   ```
   Listed → it ships inside Expo Go for this SDK (install it with `npx expo install` so the version matches).
2. Not listed and it has native code (`android/`, `ios/`, `*.podspec`, Nitro/TurboModule) → it needs a
   **development build**. It will crash in Expo Go with "native module not found / cannot find TurboModule".
3. Pure JS packages always work.

### Status for SDK 58 (from `bundledNativeModules.json`, 2026-11-15)

| Package | Pinned version | Expo Go? | Installed now? |
|---|---|---|---|
| `react-native-reanimated` | 4.7.1 | Yes | No |
| `react-native-worklets` (needed by Reanimated 4) | 0.13.0 | Yes | No |
| `react-native-gesture-handler` | ~3.3.0 | Yes | No |
| `lottie-react-native` | ~7.5.0 | Yes | Yes |
| `expo-audio` | ~58.0.11 | Yes | Yes |
| `expo-haptics` | ~58.0.7 | Yes | No |
| `@rive-app/react-native` + `react-native-nitro-modules` | not listed | **No – dev build only** | No |

Reanimated 4 needs the **New Architecture** (on by default in SDK 58; Reanimated 3 is unmaintained).

### Installing (only when the user approved it)

```bash
npx expo install react-native-reanimated react-native-worklets react-native-gesture-handler
```

Expo's `babel-preset-expo` already adds the worklets Babel plugin when `react-native-worklets` is installed.
Only if the project has a custom `babel.config.js` with its own plugin list, `'react-native-worklets/plugin'`
must be the **last** plugin. Then restart with a clean cache: `npx expo start -c`.

### Development build (needed for Rive)

```bash
npx expo install expo-dev-client
npx expo install @rive-app/react-native react-native-nitro-modules
npx eas build --profile development --platform android   # or: npx expo run:android (needs Android Studio)
```

After this the user opens the app with the **dev client** (not Expo Go). Tell the user this before
recommending Rive: it changes how they test every day.

### Detect Expo Go at runtime (to fall back safely)

```ts
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
```

---

## 2. React Native Reanimated 4

Animations run on the UI thread, so drag-and-drop and characters stay smooth even when JS is busy.

### 2.1 Basics

```tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withRepeat, withDelay, Easing, cancelAnimation,
} from 'react-native-reanimated';

export function BouncyLetter({ active }: { active: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!active) { cancelAnimation(scale); scale.value = 1; return; }
    // gentle "breathing" loop: -1 = forever, true = reverse each time
    scale.value = withRepeat(withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(scale);
  }, [active]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.Text style={[styles.letter, style]}>A</Animated.Text>;
}
```

- `useSharedValue` = a value both threads can read. Change it with `.value = …` (or `.set()` / `.get()`).
- `useAnimatedStyle` runs on the UI thread. Animate **transform and opacity** where you can.
- `withSequence(a, b, c)` plays steps in order; `withDelay(ms, anim)` waits first.
- Calm springs for toddlers: `withSpring(v, { damping: 14, stiffness: 120 })` (little overshoot).

### 2.2 A "hop" (jump + land) like `motion.hop`

```ts
const y = useSharedValue(0);
const hop = () => {
  y.value = withSequence(
    withTiming(-40, { duration: 220, easing: Easing.out(Easing.quad) }),
    withSpring(0, { damping: 12, stiffness: 180 }),
  );
};
```

### 2.3 Calling JS from the UI thread (sounds, Redux, speech)

Worklets cannot call normal JS functions directly. Use `scheduleOnRN` from `react-native-worklets`
(it replaces the older `runOnJS`, which still works but is deprecated). Check the `.d.ts` of the installed version.

```ts
import { scheduleOnRN } from 'react-native-worklets';
import { playSound } from '../shared/utils/sounds';

scale.value = withSpring(1.2, {}, (finished) => {
  'worklet';
  if (finished) scheduleOnRN(playSound, 'pop');
});
```

### 2.4 Entering / exiting (layout animations)

```tsx
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

{showStar && (
  <Animated.View entering={ZoomIn.springify().damping(14)} exiting={FadeOut.duration(250)}>
    <Star />
  </Animated.View>
)}
```

### 2.5 CSS-style animations and transitions (Reanimated 4)

For simple "state A → state B" changes, v4 has CSS transitions on `Animated` components — no shared values:

```tsx
<Animated.View
  style={{
    opacity: done ? 1 : 0.4,
    transform: [{ scale: done ? 1 : 0.9 }],
    transitionProperty: ['opacity', 'transform'],
    transitionDuration: 300,
  }}
/>
```

Use shared values for anything driven by a gesture; use CSS transitions for prop-driven changes.

### 2.6 Obey KidBuddy's animation switch and Reduce Motion

```ts
import { ReduceMotion } from 'react-native-reanimated';
import { ANIMATIONS_ENABLED } from '../shared/utils/motion';

// helper idea for a future motion.js addition: instant when animations are off
export const rTiming = (to: number, config = {}) =>
  ANIMATIONS_ENABLED()
    ? withTiming(to, { ...config, reduceMotion: ReduceMotion.System })
    : to; // assigning a plain number = jump instantly
```

`useReducedMotion()` returns the phone's Reduce Motion setting. Check how `ANIMATIONS_ENABLED` is exported
in `motion.js` (value or getter) before copying this. Never start `withRepeat(…, -1)` loops when off.

### 2.7 Mixing with the existing `Animated` code

Reanimated and RN `Animated` can live side by side. Do **not** rewrite working `motion.js` hooks just to
switch libraries; use Reanimated for new gesture-driven features (drag-and-drop, follow-the-finger).

---

## 3. React Native Gesture Handler 3

SDK 58 pins **3.3.x**. v3's main API is **hooks** (`usePanGesture`, `useTapGesture`, …) used with
`GestureDetector`. The v2 builder (`Gesture.Pan()`) is the older style; don't mix styles in one file.

### 3.1 Root view (once, in `App.js`)

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Redux Provider > Language > ... > Navigation */}
    </GestureHandlerRootView>
  );
}
```

Gestures outside it are ignored. On Android a `<Modal>` needs its **own** `GestureHandlerRootView` inside it.
Adding this to `App.js` changes an existing file — ask first.

### 3.2 Drag a view (pan)

```tsx
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function Draggable({ children }: { children: React.ReactNode }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = usePanGesture({
    onUpdate: (e) => { x.value = e.translationX; y.value = e.translationY; },
    onDeactivate: () => { x.value = withSpring(0); y.value = withSpring(0); },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  );
}
```

- Callbacks written **inline in the hook config** are made into worklets automatically. A callback defined
  elsewhere (or in `useCallback`) needs `'worklet';` as its first line.
- `runOnJS: true` in the config makes all callbacks run on the JS thread (simpler, less smooth).
- Callback order: `onBegin → onActivate → onUpdate… → onDeactivate → onFinalize`
  (`onDeactivate`/`onFinalize` get `canceled`).
- Pan event fields: `translationX/Y` (since start), `changeX/Y` (since last event), `velocityX/Y`,
  `x/y` (in the view), `absoluteX/absoluteY` (on screen — use these for hit testing when the view moves).
- Useful config: `minDistance`, `activeOffsetX/Y`, `failOffsetX/Y`, `enabled`, `hitSlop`.
  Positive `hitSlop` (bigger area) only works on Android; on iOS make the view itself big (≥ 56).

### 3.3 Tap

```tsx
const tap = useTapGesture({ onActivate: () => { scale.value = withSequence(withTiming(1.15), withSpring(1)); } });
```

For plain buttons keep using `Pressable` — Gesture Handler is for drags and custom touch.

### 3.4 Living with the lesson `SwipePager`

The Play page only allows page swipes from the 90px bottom strip. With RNGH, also give drags
`activeOffsetX`/`activeOffsetY` small values (e.g. `[-8, 8]`) so a drag wins quickly, and never put a
horizontal pan on the same view as the pager.

---

## 4. Drag-and-drop learning games

Pattern used by `DragMatchRound` (letter → picture). Keep KidBuddy's **errorless** rules:
1st miss glides back + "Let's try again", 2nd miss a glow hint on the right target, 3rd the buddy places it.

### 4.1 Measure drop targets in screen coordinates

```tsx
type Rect = { id: string; x: number; y: number; w: number; h: number };

const targets = useSharedValue<Rect[]>([]);

function DropTarget({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<View>(null);
  const onLayout = () => {
    ref.current?.measureInWindow((x, y, w, h) => {
      targets.value = [...targets.value.filter((t) => t.id !== id), { id, x, y, w, h }];
    });
  };
  return <View ref={ref} onLayout={onLayout} style={styles.target}>{children}</View>;
}
```

Re-measure when the page becomes `active` (pages in `SwipePager` move sideways, so old numbers go stale).

### 4.2 Drop check on release

```ts
const SNAP_PADDING = 24; // config file: extra forgiving area around each target, in px

function hitTest(px: number, py: number, list: Rect[]) {
  'worklet';
  return list.find((t) =>
    px > t.x - SNAP_PADDING && px < t.x + t.w + SNAP_PADDING &&
    py > t.y - SNAP_PADDING && py < t.y + t.h + SNAP_PADDING)?.id ?? null;
}

const pan = usePanGesture({
  onBegin: () => { lifted.value = withSpring(1.1); },          // pick-up feedback
  onUpdate: (e) => { x.value = e.translationX; y.value = e.translationY; },
  onDeactivate: (e) => {
    const hit = hitTest(e.absoluteX, e.absoluteY, targets.value);
    if (hit === correctId) {
      // snap into the target centre, then tell JS (sound, voice, Redux)
      scheduleOnRN(onCorrect, hit);
    } else {
      x.value = withSpring(0, { damping: 15 });                   // calm glide home
      y.value = withSpring(0, { damping: 15 });
      scheduleOnRN(onMiss, hit);                                  // JS counts misses → hint / buddy help
    }
    lifted.value = withSpring(1);
  },
});
```

Tips:
- Keep game logic (miss count, which round) in React state or Redux on the JS side; keep only positions
  in shared values.
- To snap to the centre, store the target centre minus the item's start position and spring there.
- Raise the dragged item: `zIndex` (and `elevation` on Android) while lifted.
- Big items (≥ 80 px), big targets, forgiving `SNAP_PADDING`. No timers, no score loss, no buzzers.
- Lock other items while one is dragging (`enabled` config with a shared value).

---

## 5. Rive animations and state machines

Rive = vector animation with a built-in **state machine** (idle → talk → happy) controlled from code.
Great for the buddy and talking objects, but **needs a dev build** (§1). Until the user switches,
keep using the existing `Animated`/Lottie characters.

### 5.1 Package (2026)

- Current runtime: **`@rive-app/react-native`** (Nitro-based) + `react-native-nitro-modules`.
  Replaces the legacy `rive-react-native` (`<Rive resourceName=… />`, `setInputState`, `fireState`).
- Needs RN 0.78+ / Expo SDK 53+, iOS 15.1+, Android SDK 24+.
- From **0.5.0**, the old ref methods (`setInputState`, `fireState`, `setNumberInputValue`,
  `setBooleanInputValue`, `triggerInput`, `onEventListener`) **throw**. Use **data binding** (view models).
  Ask the Rive file's designer to expose view-model properties (e.g. `isTalking`, `mood`, `wave`).

### 5.2 Bundle `.riv` files

`.riv` is not a known asset type. Create `metro.config.js` (new file) with `npx expo customize metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('riv');
module.exports = config;
```

Put files in `assets/rive/` (e.g. `assets/rive/buddy.riv`).

### 5.3 Show a file and drive its state machine

```tsx
import {
  RiveView, Fit, useRive, useRiveFile, useViewModelInstance,
  useRiveNumber, useRiveTrigger,
} from '@rive-app/react-native';

export function RiveBuddy({ talking, mood }: { talking: boolean; mood: number }) {
  const { riveFile, isLoading, error } = useRiveFile(require('../../assets/rive/buddy.riv'));
  const { riveViewRef, setHybridRef } = useRive();
  const { instance: vm } = useViewModelInstance(riveFile, { async: true });

  const { setValue: setMood } = useRiveNumber('mood', vm);        // 0 idle, 1 happy, 2 think
  const { trigger: wave } = useRiveTrigger('wave', vm);

  useEffect(() => { setMood?.(mood); riveViewRef?.playIfNeeded(); }, [mood]);

  if (isLoading || error || !riveFile) return <BuddyCharacter />;   // existing fallback

  return (
    <RiveView
      file={riveFile}
      dataBind={vm}
      stateMachineName="Buddy"
      autoPlay
      fit={Fit.Contain}
      hybridRef={setHybridRef}
      style={{ width: 160, height: 160 }}
    />
  );
}
```

- Ref methods: `play()`, `pause()`, `playIfNeeded()`, `awaitViewReady()`. `reset()` does nothing on 0.5+;
  to restart, change the component's `key`.
- Pause (`pause()`) when the page is not `active`; respect `ANIMATIONS_ENABLED`.
- A boolean property hook (likely `useRiveBoolean`) and new-runtime events were **not confirmed** in the docs —
  check the installed `.d.ts` before using them.
- Legacy `rive-react-native` only: `onRiveEventReceived={(e) => …}` for events, `ref.current.setInputState('Buddy', 'talking', true)`,
  `ref.current.fireState('Buddy', 'wave')`.

### 5.4 Safe fallback so Expo Go never crashes

Never `import` Rive at the top of a shared file while the app still runs in Expo Go.
Load it behind a check:

```ts
import { IS_EXPO_GO } from './runtime';

let RiveModule: typeof import('@rive-app/react-native') | null = null;
if (!IS_EXPO_GO) {
  try { RiveModule = require('@rive-app/react-native'); } catch { RiveModule = null; }
}
export const RIVE_AVAILABLE = RiveModule !== null;
```

Then render `RiveBuddy` only when `RIVE_AVAILABLE`, else the current `BuddyCharacter`.

---

## 6. Animated cartoon characters + sound

KidBuddy already has `BuddyCharacter` and `TalkingObject` (see `context.md` §8). New characters should copy
their patterns: one config file for positions, moods as a small set of names, `active` and `calm` props.

### 6.1 Talking mouth synced to speech

`expo-speech` has no word timing, so "talk" while speaking, then stop:

```ts
import { speakAsync } from '../shared/utils/speech';

async function say(text: string) {
  setMood('talk');               // RN Animated / Reanimated loop, or Rive `mood` = talk
  try { await speakAsync(text); } finally { setMood('idle'); }
}
```

Use `useLessonSequence` for lesson scripts so only one voice + motion runs at a time.

### 6.2 Sound effects at the right animation moment

```ts
import { playSound } from '../shared/utils/sounds';

// RN Animated (motion.js): play in the completion callback
motion.sequence([...]).start(() => playSound('tada'));

// Reanimated: from the worklet callback via scheduleOnRN (§2.3)
```

- Start the sound at the **start** of a hop/pop (it feels in sync), not after it lands.
- One effect at a time (`sounds.js` already stops the previous one). Keep volume soft.
- Optional tactile feedback: `expo-haptics` `Haptics.selectionAsync()` on a correct drop (works in Expo Go;
  needs `npx expo install expo-haptics` and the user's OK).

### 6.3 Character checklist

- Idle motion is slow and small (sway/breathing ≥ 1 s per cycle); big moves only as feedback.
- Eyes blink at random 2–5 s intervals; never stare or flash.
- Characters never show anger or sadness at a wrong answer; they "think" then help.
- Every character reacts to touch (wave / giggle) — toddlers tap everything.
- Pause all loops when the screen or page is not `active`.

---

## 7. Before you finish an animation task

1. Package needed? → checked `bundledNativeModules.json`, told the user, got approval, used `npx expo install`.
2. Works in **Expo Go**? If not, there is a fallback and the user knows a dev build is needed.
3. Obeys `ANIMATIONS_ENABLED` / `SOUND_ENABLED`; loops stop when not `active`.
4. Numbers live in a config file; text goes through `AppText`/`translate()` with Urdu added; RTL checked.
5. Bundle check: `npx expo export --platform android --output-dir <scratchpad>/bundle`.
6. Update `context.md` (changed sections + one Work log line), then stop and explain how to test in Expo Go.
