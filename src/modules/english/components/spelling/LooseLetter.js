// LOOSE LETTER - one piece the child picks up and drags: a letter of the word, or a whole word of the
// sentence. It feels like soft rubber (jelly):
//   pick-up   pops bigger with a spring and lifts a little above the finger; its shadow gets bigger and lighter
//   held      "breathes": fatter + shorter, then thinner + taller, with a soft wobble left and right
//   moving    stretches along the finger's speed and trails a little behind the finger
//   magnet    near its CORRECT placeholder it calms down: no jelly, no tilt, exactly the placeholder's size
//   let go    the board decides: landOn() (slides in with an overshoot + one squash) or goHome() (boing + wiggle)
// With animations off there is no breathing, wobble or stretch (the loops never start).
// Its box is the touch area (the piece's shape plus a little extra, see touchBox in wordLayout.js).
//
// Props:  shape { width, height }   the size of the piece's own shape
//         renderArt(tint)           draws the piece (tint = undefined for its real colours, or one colour)
//         box, tilt (lean while lying on the page), disabled, eyes (may show eyes), active (false = no blinking)
//         start { dx, dy, solid }   only after the screen changed size: the piece is ALREADY in its place
//         findMagnet(dx, dy) -> slot index or null     (asked while dragging; dx, dy = distance from home)
//         onGrab(), onHoldLong(), onMagnet(slot or null), onDrop(dx, dy, magnetSlot)
// Ref:    landOn(dx, dy, done), goHome({ wiggle }), hop(done, height), turnSolid()
//         (turnSolid = the finished word: the letter fades to the one word colour, SPELLING.WORD_SOLID_COLOR)

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, PanResponder, StyleSheet } from 'react-native';
import LetterEyes from './LetterEyes';
import { animationsEnabled, hop, motion, wiggle } from '../../../../shared/utils/motion';
import { SPELLING } from './spellingConfig';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// One endless swing of a value: 0 -> 1 -> -1 -> 0 (smooth, like a pendulum). `time` = one full swing side to side.
function swing(value, time) {
  return motion.loop(
    motion.sequence([
      motion.timing(value, 1, { duration: time / 2, easing: Easing.out(Easing.sin) }),
      motion.timing(value, -1, { duration: time, easing: Easing.inOut(Easing.sin) }),
      motion.timing(value, 0, { duration: time / 2, easing: Easing.in(Easing.sin) }),
    ])
  );
}

const LooseLetter = forwardRef(function LooseLetter(
  { shape, renderArt, box, tilt = 0, start, disabled, eyes, active = true, findMagnet, onGrab, onHoldLong, onMagnet, onDrop },
  ref
) {
  const pos = useRef(new Animated.ValueXY(start ? { x: start.dx, y: start.dy } : undefined)).current; // where the piece is (0, 0 = home)
  const held = useRef(new Animated.Value(0)).current; // 0 = on the page, 1 = in the hand (lifts it above the finger)
  const grow = useRef(new Animated.Value(1)).current; // pick-up size
  const lean = useRef(new Animated.Value(start ? 0 : tilt)).current; // resting tilt, in degrees
  const breath = useRef(new Animated.Value(0)).current; // jelly: -1 thin + tall ... 1 fat + short
  const sway = useRef(new Animated.Value(0)).current; // wobble: -1 left ... 1 right
  const stretch = useRef(new Animated.Value(0)).current; // speed stretch: -1 tall ... 1 wide (also the landing squash)
  const wild = useRef(new Animated.Value(1)).current; // 1 = jelly is free, 0 = calm (inside the magnet)
  const size = useRef(new Animated.Value(1)).current; // pop / hop squash
  const bob = useRef(new Animated.Value(0)).current; // hop height
  const shade = useRef(new Animated.Value(start ? 0 : 1)).current; // shadow: 1 = lying down, 0.5 = lifted, 0 = in the word
  const solid = useRef(new Animated.Value(start && start.solid ? 1 : 0)).current; // 0 = its own colours, 1 = the one colour of the finished word

  const loops = useRef(null);
  const stretchMove = useRef(null);
  const holdTimer = useRef(null);
  const magnet = useRef(null);
  const latest = useRef({});
  latest.current = { disabled, findMagnet, onGrab, onHoldLong, onMagnet, onDrop };

  const letterWidth = shape.width;
  const letterHeight = shape.height;

  function stopJelly() {
    clearTimeout(holdTimer.current);
    if (loops.current) loops.current.stop();
    if (stretchMove.current) stretchMove.current.stop();
    loops.current = null;
    motion.parallel([motion.spring(breath, 0), motion.spring(sway, 0), motion.spring(stretch, 0)]).start();
  }

  // Leaving the screen: stop the timer and the loops.
  useEffect(() => {
    return () => {
      clearTimeout(holdTimer.current);
      if (loops.current) loops.current.stop();
    };
  }, []);

  function setMagnet(slot) {
    if (magnet.current === slot) return;
    magnet.current = slot;
    const calm = slot !== null;
    motion
      .parallel([
        motion.spring(grow, calm ? 1 : SPELLING.HOLD_SCALE, { friction: 7 }),
        motion.timing(wild, calm ? 0 : 1, { duration: SPELLING.MAGNET_CALM_TIME }),
      ])
      .start();
    if (latest.current.onMagnet) latest.current.onMagnet(slot);
  }

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        pos.stopAnimation();
        pos.setValue({ x: 0, y: 0 });
        wild.setValue(1);
        magnet.current = null;
        motion
          .parallel([
            motion.spring(held, 1, { friction: 6 }),
            motion.spring(grow, SPELLING.HOLD_SCALE, { friction: 4, tension: 140 }),
            motion.spring(lean, 0, { friction: 6 }),
            motion.timing(shade, 0.5, { duration: 180 }),
          ])
          .start();
        loops.current = motion.parallel([swing(breath, SPELLING.JELLY_SWING), swing(sway, SPELLING.WOBBLE_SWING)]);
        loops.current.start();
        holdTimer.current = setTimeout(() => latest.current.onHoldLong && latest.current.onHoldLong(), SPELLING.HOLD_REPEAT_SOUND);
        if (latest.current.onGrab) latest.current.onGrab();
      },
      onPanResponderMove: (_, g) => {
        // Follow the finger with a soft spring, so the letter trails a little behind it.
        motion.spring(pos, { x: g.dx, y: g.dy }, { friction: SPELLING.FOLLOW_FRICTION, tension: SPELLING.FOLLOW_TENSION }).start();

        // Stretch along the finger's speed: wide when moving sideways, tall when moving up or down.
        if (animationsEnabled()) {
          const target = clamp((Math.abs(g.vx) - Math.abs(g.vy)) * SPELLING.STRETCH_PER_SPEED, -1, 1);
          if (stretchMove.current) stretchMove.current.stop();
          stretchMove.current = motion.sequence([
            motion.timing(stretch, target, { duration: 90 }),
            motion.spring(stretch, 0, { friction: 5 }),
          ]);
          stretchMove.current.start();
        }

        // The letter is drawn a little above the finger, so that is the point used for the magnet.
        const slot = latest.current.findMagnet ? latest.current.findMagnet(g.dx, g.dy - SPELLING.LIFT_ABOVE) : null;
        setMagnet(slot);
      },
      onPanResponderRelease: (_, g) => release(g),
      onPanResponderTerminate: (_, g) => release(g),
    })
  ).current;

  function release(g) {
    const slot = magnet.current;
    magnet.current = null;
    stopJelly();
    if (latest.current.onMagnet) latest.current.onMagnet(null);
    if (latest.current.onDrop) latest.current.onDrop(g.dx, g.dy - SPELLING.LIFT_ABOVE, slot);
  }

  useImperativeHandle(ref, () => ({
    // Slide to the placeholder (dx, dy from home) with a spring overshoot, then one squash on landing.
    landOn(dx, dy, done) {
      stopJelly();
      wild.setValue(1);
      motion
        .parallel([
          motion.spring(pos, { x: dx, y: dy }, { friction: SPELLING.LAND_FRICTION, tension: SPELLING.LAND_TENSION }),
          motion.spring(held, 0, { friction: 7 }),
          motion.spring(grow, 1, { friction: 7 }),
          motion.spring(lean, 0, { friction: 7 }),
          motion.timing(shade, 0, { duration: 200 }),
        ])
        .start(() => {
          motion
            .sequence([motion.timing(stretch, SPELLING.LAND_SQUASH, { duration: 90 }), motion.spring(stretch, 0, { friction: 4, tension: 160 })])
            .start();
          if (done) done();
        });
    },
    // Glide back home with a little boing; `wiggle` adds a soft "not there" wiggle.
    goHome({ wiggle: withWiggle = false } = {}) {
      stopJelly();
      wild.setValue(1);
      motion
        .parallel([
          motion.spring(pos, { x: 0, y: 0 }, { friction: SPELLING.HOME_FRICTION, tension: SPELLING.HOME_TENSION }),
          motion.spring(held, 0, { friction: 7 }),
          motion.spring(grow, 1, { friction: 5 }),
          motion.spring(lean, tilt, { friction: 6 }),
          motion.timing(shade, 1, { duration: 220 }),
        ])
        .start();
      if (withWiggle) wiggle(sway, { swings: 3, duration: 120 }).start();
    },
    // One hop. `height` = a part of the letter's height (a small one after landing, a big one at the end).
    hop(done, height = SPELLING.HOP_HEIGHT) {
      hop(bob, size, letterHeight * height).start(() => done && done());
    },
    turnSolid() {
      motion.timing(solid, 1, { duration: SPELLING.SOLID_TIME }).start();
    },
  }));

  // ----- put all the little movements together -----
  const jelly = Animated.multiply(breath, wild);
  const pull = Animated.multiply(stretch, wild);
  const wobble = Animated.multiply(Animated.multiply(sway, wild), SPELLING.WOBBLE_ANGLE);
  const rotate = Animated.add(lean, wobble).interpolate({ inputRange: [-90, 90], outputRange: ['-90deg', '90deg'] });
  const base = Animated.multiply(grow, size);
  const range = [-1, 0, 1];
  const scaleX = Animated.multiply(
    base,
    Animated.multiply(
      jelly.interpolate({ inputRange: range, outputRange: [SPELLING.JELLY_MIN, 1, SPELLING.JELLY_MAX] }),
      pull.interpolate({ inputRange: range, outputRange: [SPELLING.STRETCH_MIN, 1, SPELLING.STRETCH_MAX] })
    )
  );
  const scaleY = Animated.multiply(
    base,
    Animated.multiply(
      jelly.interpolate({ inputRange: range, outputRange: [SPELLING.JELLY_MAX, 1, SPELLING.JELLY_MIN] }),
      pull.interpolate({ inputRange: range, outputRange: [SPELLING.STRETCH_MAX, 1, SPELLING.STRETCH_MIN] })
    )
  );
  const lift = Animated.add(bob, Animated.multiply(held, -SPELLING.LIFT_ABOVE));

  const shadowWidth = letterWidth * SPELLING.SHADOW_WIDTH;
  const shadowHeight = Math.max(6, letterHeight * SPELLING.SHADOW_HEIGHT);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{
        width: box.width,
        height: box.height,
        paddingHorizontal: box.padX,
        paddingVertical: box.padY,
        transform: [{ translateX: pos.x }, { translateY: pos.y }],
      }}
    >
      {/* the shadow stays on the page under the letter: it does not lift, wobble or stretch */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shadow,
          {
            left: box.padX + (letterWidth - shadowWidth) / 2,
            top: box.padY + letterHeight - shadowHeight * 0.55,
            width: shadowWidth,
            height: shadowHeight,
            borderRadius: shadowHeight / 2,
            backgroundColor: SPELLING.SHADOW_COLOR,
            opacity: shade.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.55, 1] }),
            transform: [{ scale: shade.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, SPELLING.SHADOW_HELD_SCALE, 1] }) }],
          },
        ]}
      />
      <Animated.View pointerEvents="none" style={{ transform: [{ translateY: lift }, { rotate }, { scaleX }, { scaleY }] }}>
        {renderArt()}
        <Animated.View style={[styles.solid, { opacity: solid }]}>{renderArt(SPELLING.WORD_SOLID_COLOR)}</Animated.View>
        {SPELLING.SHOW_EYES && eyes ? <LetterEyes width={letterWidth} height={letterHeight} active={active} /> : null}
      </Animated.View>
    </Animated.View>
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
