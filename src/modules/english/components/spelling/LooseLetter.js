// LOOSE LETTER - one piece the child picks up and drags: a letter of the word, or a whole word of the
// sentence. The drag runs on the phone's UI thread (Gesture Handler + Reanimated), so it stays smooth even
// when JavaScript is busy.
//   POSITION  follows the finger exactly, 1 to 1: no spring, no trailing. The piece is only drawn a little
//             above the finger (LIFT_ABOVE) so the finger does not hide it.
//   SIZE and TILT are the only things that are animated while dragging (they never move the piece):
//     pick-up   pops bigger with a spring; its shadow gets bigger and lighter
//     held      "breathes" like jelly: fatter + shorter, then thinner + taller, with a soft wobble
//     moving    stretches and leans a little with the finger's speed
//     magnet    near its CORRECT placeholder it calms down: no jelly, no tilt, exactly the placeholder's size
//   let go    the board decides: landOn() (slides in with an overshoot + one squash) or goHome() (boing + wiggle)
// JavaScript is only told: picked up, the magnet changed (near / not near), and let go. Never every move.
// With animations off there is no jelly, wobble or stretch; the drag still follows the finger.
// Its box is the touch area (the piece's shape plus a little extra, see touchBox in wordLayout.js).
//
// Props:  shape { width, height }   the size of the piece's own shape
//         renderArt(tint)           draws the piece (tint = undefined for its real colours, or one colour)
//         box, tilt (lean while lying on the page), disabled, eyes (may show eyes), active (false = no blinking)
//         start { dx, dy, solid }   only after the screen changed size: the piece is ALREADY in its place
//         targets [{ slot, dx, dy, reach }]   its own free placeholders, as distances from home (the magnet)
//         onGrab(), onHoldLong(), onMagnet(slot or null), onDrop(dx, dy, magnetSlot)
// Ref:    landOn(dx, dy, done), goHome({ wiggle }), hop(done, height), turnSolid()
//         (turnSolid = the finished word: the piece fades to the one word colour, SPELLING.WORD_SOLID_COLOR)

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import LetterEyes from './LetterEyes';
import { animationsEnabled } from '../../../../shared/utils/motion';
import { SPELLING } from './spellingConfig';

// The numbers used on the UI thread (copied out of the config once).
const LIFT = SPELLING.LIFT_ABOVE;
const HOLD_SCALE = SPELLING.HOLD_SCALE;
const JELLY_MIN = SPELLING.JELLY_MIN;
const JELLY_MAX = SPELLING.JELLY_MAX;
const JELLY_SWING = SPELLING.JELLY_SWING;
const WOBBLE_ANGLE = SPELLING.WOBBLE_ANGLE;
const WOBBLE_SWING = SPELLING.WOBBLE_SWING;
const STRETCH_MIN = SPELLING.STRETCH_MIN;
const STRETCH_MAX = SPELLING.STRETCH_MAX;
const STRETCH_PER_SPEED = SPELLING.STRETCH_PER_SPEED;
const LEAN_PER_SPEED = SPELLING.LEAN_PER_SPEED;
const LEAN_MAX = SPELLING.LEAN_MAX;
const CALM_TIME = SPELLING.MAGNET_CALM_TIME;
const LAND_SQUASH = SPELLING.LAND_SQUASH;
const SHADOW_HELD_SCALE = SPELLING.SHADOW_HELD_SCALE;
const POP_SPRING = { mass: 1, stiffness: SPELLING.POP_STIFFNESS, damping: SPELLING.POP_DAMPING };
const LAND_SPRING = { mass: 1, stiffness: SPELLING.LAND_STIFFNESS, damping: SPELLING.LAND_DAMPING };
const HOME_SPRING = { mass: 1, stiffness: SPELLING.HOME_STIFFNESS, damping: SPELLING.HOME_DAMPING };

function clamp(value, min, max) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

// One endless swing: 0 -> 1 -> -1 -> 0 (smooth, like a pendulum). `time` = one swing from side to side.
function swing(time) {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(1, { duration: time / 2, easing: Easing.out(Easing.sin) }),
      withTiming(-1, { duration: time, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: time / 2, easing: Easing.in(Easing.sin) })
    ),
    -1,
    false
  );
}

const LooseLetter = forwardRef(function LooseLetter(
  { shape, renderArt, box, tilt = 0, start, disabled, eyes, active = true, targets, onGrab, onHoldLong, onMagnet, onDrop },
  ref
) {
  const moving = animationsEnabled(); // the ONE animation switch of the app (utils/motion.js)

  const x = useSharedValue(start ? start.dx : 0); // where the piece is (0, 0 = home)
  const y = useSharedValue(start ? start.dy : 0);
  const held = useSharedValue(0); // 0 = on the page, 1 = in the hand (draws it above the finger)
  const grow = useSharedValue(1); // pick-up size
  const lean = useSharedValue(start ? 0 : tilt); // resting tilt, in degrees
  const breath = useSharedValue(0); // jelly: -1 thin + tall ... 1 fat + short
  const sway = useSharedValue(0); // wobble: -1 left ... 1 right (also the "not there" wiggle)
  const stretch = useSharedValue(0); // speed stretch: -1 tall ... 1 wide (also the landing squash)
  const drift = useSharedValue(0); // a little extra lean from the finger's sideways speed, in degrees
  const wild = useSharedValue(1); // 1 = jelly is free, 0 = calm (inside the magnet)
  const size = useSharedValue(1); // hop squash
  const bob = useSharedValue(0); // hop height
  const shade = useSharedValue(start ? 0 : 1); // shadow: 1 = lying down, 0.5 = lifted, 0 = in the word
  const solid = useSharedValue(start && start.solid ? 1 : 0); // 0 = own colours, 1 = the finished word's one colour
  const near = useSharedValue(-1); // the placeholder the piece is close to (-1 = none)
  const magnets = useSharedValue(targets || []); // the piece's own free placeholders

  const holdTimer = useRef(null);
  const landedCallback = useRef(null);
  const latest = useRef({});
  latest.current = { onGrab, onHoldLong, onMagnet, onDrop };

  // The board's list of free placeholders changes when a letter lands: hand the new list to the UI thread.
  const targetsKey = JSON.stringify(targets || []);
  useEffect(() => {
    magnets.value = targets || [];
  }, [targetsKey]);

  useEffect(() => () => clearTimeout(holdTimer.current), []);

  // ----- the only three messages from the UI thread to JavaScript -----
  const grabJS = useCallback(() => {
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => latest.current.onHoldLong && latest.current.onHoldLong(), SPELLING.HOLD_REPEAT_SOUND);
    if (latest.current.onGrab) latest.current.onGrab();
  }, []);

  const magnetJS = useCallback((slot) => {
    if (latest.current.onMagnet) latest.current.onMagnet(slot < 0 ? null : slot);
  }, []);

  const dropJS = useCallback((dx, dy, slot) => {
    clearTimeout(holdTimer.current);
    if (latest.current.onMagnet) latest.current.onMagnet(null);
    if (latest.current.onDrop) latest.current.onDrop(dx, dy, slot < 0 ? null : slot);
  }, []);

  const landedJS = useCallback(() => {
    const done = landedCallback.current;
    landedCallback.current = null;
    if (done) done();
  }, []);

  // ----- the drag (everything inside runs on the UI thread) -----
  const pan = usePanGesture({
    enabled: !disabled,
    minDistance: 0,
    // Touch down = pick-up.
    onBegin: () => {
      cancelAnimation(x);
      cancelAnimation(y);
      x.value = 0;
      y.value = 0;
      near.value = -1;
      wild.value = 1;
      held.value = withTiming(1, { duration: moving ? 90 : 0 });
      grow.value = moving ? withSpring(HOLD_SCALE, POP_SPRING) : HOLD_SCALE;
      lean.value = withTiming(0, { duration: moving ? 150 : 0 });
      shade.value = withTiming(0.5, { duration: moving ? 180 : 0 });
      if (moving) {
        breath.value = swing(JELLY_SWING);
        sway.value = swing(WOBBLE_SWING);
      }
      scheduleOnRN(grabJS);
    },
    onUpdate: (e) => {
      // POSITION: exactly where the finger is.
      x.value = e.translationX;
      y.value = e.translationY;

      // SIZE and TILT from the finger's speed (points per second): wide when moving sideways, tall when
      // moving up or down, leaning a little into the movement.
      if (moving) {
        const pull = ((Math.abs(e.velocityX) - Math.abs(e.velocityY)) / 1000) * STRETCH_PER_SPEED;
        stretch.value = withTiming(clamp(pull, -1, 1), { duration: 120 });
        drift.value = withTiming(clamp((e.velocityX / 1000) * LEAN_PER_SPEED, -LEAN_MAX, LEAN_MAX), { duration: 120 });
      }

      // MAGNET: which of its own free placeholders is the piece close to? (It is drawn above the finger,
      // so that is the point that counts.) JavaScript is told only when the answer CHANGES.
      const px = e.translationX;
      const py = e.translationY - LIFT;
      const list = magnets.value;
      let found = -1;
      let best = 0;
      for (let i = 0; i < list.length; i++) {
        const distance = Math.hypot(px - list[i].dx, py - list[i].dy);
        if (distance <= list[i].reach && (found < 0 || distance < best)) {
          found = list[i].slot;
          best = distance;
        }
      }
      if (found !== near.value) {
        near.value = found;
        const calm = found >= 0;
        grow.value = moving ? withSpring(calm ? 1 : HOLD_SCALE, POP_SPRING) : calm ? 1 : HOLD_SCALE;
        wild.value = withTiming(calm ? 0 : 1, { duration: moving ? CALM_TIME : 0 });
        scheduleOnRN(magnetJS, found);
      }
    },
    // Let go (also when the touch is cancelled): stop the jelly, then ONE call to JavaScript.
    onFinalize: () => {
      const slot = near.value;
      near.value = -1;
      cancelAnimation(breath);
      cancelAnimation(sway);
      breath.value = withTiming(0, { duration: 120 });
      sway.value = withTiming(0, { duration: 120 });
      stretch.value = withTiming(0, { duration: 120 });
      drift.value = withTiming(0, { duration: 120 });
      scheduleOnRN(dropJS, x.value, y.value - LIFT, slot);
    },
  });

  useImperativeHandle(ref, () => ({
    // Slide to the placeholder (dx, dy from home) with a spring overshoot, then one squash on landing.
    landOn(dx, dy, done) {
      landedCallback.current = done;
      wild.value = 1;
      held.value = withTiming(0, { duration: moving ? 160 : 0 });
      lean.value = withTiming(0, { duration: moving ? 160 : 0 });
      shade.value = withTiming(0, { duration: moving ? 200 : 0 });
      if (!moving) {
        grow.value = 1;
        x.value = dx;
        y.value = dy;
        landedJS();
        return;
      }
      grow.value = withSpring(1, POP_SPRING);
      y.value = withSpring(dy, LAND_SPRING);
      x.value = withSpring(dx, LAND_SPRING, () => {
        'worklet';
        stretch.value = withSequence(withTiming(LAND_SQUASH, { duration: 90 }), withSpring(0, POP_SPRING));
        scheduleOnRN(landedJS);
      });
    },
    // Glide back home with a little boing; `wiggle` adds a soft "not there" wiggle.
    goHome({ wiggle = false } = {}) {
      wild.value = 1;
      held.value = withTiming(0, { duration: moving ? 160 : 0 });
      shade.value = withTiming(1, { duration: moving ? 220 : 0 });
      if (!moving) {
        grow.value = 1;
        lean.value = tilt;
        x.value = 0;
        y.value = 0;
        return;
      }
      grow.value = withSpring(1, POP_SPRING);
      lean.value = withSpring(tilt, HOME_SPRING);
      x.value = withSpring(0, HOME_SPRING);
      y.value = withSpring(0, HOME_SPRING);
      if (wiggle) {
        const step = { duration: 120 };
        sway.value = withSequence(withTiming(1, step), withTiming(-1, step), withTiming(1, step), withTiming(0, step));
      }
    },
    // One hop. `height` = a part of the piece's height (a small one after landing, a big one at the end).
    hop(done, height = SPELLING.HOP_HEIGHT) {
      if (!moving) {
        if (done) done();
        return;
      }
      bob.value = withSequence(
        withTiming(-shape.height * height, { duration: 190, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 210, easing: Easing.in(Easing.quad) })
      );
      size.value = withDelay(400, withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, POP_SPRING)));
      if (done) setTimeout(done, 520);
    },
    turnSolid() {
      solid.value = withTiming(1, { duration: moving ? SPELLING.SOLID_TIME : 0 });
    },
  }));

  // ----- the styles (worked out on the UI thread on every frame) -----
  // The outer view only MOVES; the inner view only changes size and tilt around its own centre.
  const moveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const jellyStyle = useAnimatedStyle(() => {
    const jelly = breath.value * wild.value;
    const pull = stretch.value * wild.value;
    // 1 = fat + short, -1 = thin + tall
    const jellyX = jelly >= 0 ? 1 + jelly * (JELLY_MAX - 1) : 1 + jelly * (1 - JELLY_MIN);
    const jellyY = jelly >= 0 ? 1 - jelly * (1 - JELLY_MIN) : 1 - jelly * (JELLY_MAX - 1);
    const pullX = pull >= 0 ? 1 + pull * (STRETCH_MAX - 1) : 1 + pull * (1 - STRETCH_MIN);
    const pullY = pull >= 0 ? 1 - pull * (1 - STRETCH_MIN) : 1 - pull * (STRETCH_MAX - 1);
    const base = grow.value * size.value;
    const angle = lean.value + (sway.value * WOBBLE_ANGLE + drift.value) * wild.value;
    return {
      transform: [
        { translateY: bob.value - held.value * LIFT },
        { rotate: `${angle}deg` },
        { scaleX: base * jellyX * pullX },
        { scaleY: base * jellyY * pullY },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const lifted = 1 - Math.abs(shade.value - 0.5) * 2; // 1 when the piece is in the hand
    return {
      opacity: shade.value <= 0.5 ? shade.value * 1.1 : 0.55 + (shade.value - 0.5) * 0.9,
      transform: [{ scale: 1 + lifted * (SHADOW_HELD_SCALE - 1) }],
    };
  });

  const solidStyle = useAnimatedStyle(() => ({ opacity: solid.value }));

  const shadowWidth = shape.width * SPELLING.SHADOW_WIDTH;
  const shadowHeight = Math.max(6, shape.height * SPELLING.SHADOW_HEIGHT);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[{ width: box.width, height: box.height, paddingHorizontal: box.padX, paddingVertical: box.padY }, moveStyle]}
      >
        {/* the shadow stays on the page under the piece: it does not lift, wobble or stretch */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shadow,
            {
              left: box.padX + (shape.width - shadowWidth) / 2,
              top: box.padY + shape.height - shadowHeight * 0.55,
              width: shadowWidth,
              height: shadowHeight,
              borderRadius: shadowHeight / 2,
              backgroundColor: SPELLING.SHADOW_COLOR,
            },
            shadowStyle,
          ]}
        />
        <Animated.View pointerEvents="none" style={jellyStyle}>
          {renderArt()}
          <Animated.View style={[styles.solid, solidStyle]}>{renderArt(SPELLING.WORD_SOLID_COLOR)}</Animated.View>
          {SPELLING.SHOW_EYES && eyes ? <LetterEyes width={shape.width} height={shape.height} active={active} /> : null}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

export default LooseLetter;

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
  },
  solid: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
