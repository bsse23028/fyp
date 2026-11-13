// MOTION - every animation helper of the new design lives here.
// ANIMATIONS_ENABLED is the ONE switch: false = everything appears instantly and nothing moves.
// setAnimationsEnabled() lets a future "sensory settings" screen change it at runtime.

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const ANIMATIONS_ENABLED = true;

let enabled = ANIMATIONS_ENABLED;

export function setAnimationsEnabled(value) {
  enabled = Boolean(value);
}

export function animationsEnabled() {
  return enabled;
}

export const DURATION = {
  fast: 160,
  normal: 320,
  slow: 520,
};

export const STAGGER = 70;

const PRESS_SCALE = 0.96;

export function pressIn(value) {
  if (!enabled) return;
  Animated.spring(value, { toValue: PRESS_SCALE, friction: 7, tension: 220, useNativeDriver: true }).start();
}

export function pressOut(value) {
  if (!enabled) {
    value.setValue(1);
    return;
  }
  Animated.spring(value, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();
}

// Fade + slide up, started once. `index` staggers cards that appear one after another.
export function useEntrance(index = 0, { distance = 14, duration = DURATION.normal, delay = 0, stagger = STAGGER } = {}) {
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: delay + index * stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, []);

  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  };
}

// Gentle spring "pop" from small to full size (logo / mascot on the splash).
export function useScaleIn(delay = 0) {
  const progress = useRef(new Animated.Value(enabled ? 0 : 1)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(progress, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  return {
    opacity: progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
  };
}

// Slow, small up-and-down "breathing" of the mascot. It stops after `cycles` so nothing moves forever.
export function useIdleBob({ height = 6, duration = 1800, cycles = 6, delay = 600 } = {}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const half = { duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true };
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(progress, { toValue: 1, ...half }),
          Animated.timing(progress, { toValue: 0, ...half }),
        ]),
        { iterations: cycles }
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  return { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) }] };
}

// Animates a 0 -> 1 value when `visible` changes (drawers, sheets, backdrops).
export function animateVisibility(value, visible, onDone) {
  if (!enabled) {
    value.setValue(visible ? 1 : 0);
    if (onDone) onDone();
    return;
  }
  Animated.timing(value, {
    toValue: visible ? 1 : 0,
    duration: visible ? DURATION.normal : DURATION.fast + 60,
    easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    useNativeDriver: true,
  }).start(() => onDone && onDone());
}

// ---------- building blocks for screens and components ----------
// Use these instead of Animated.timing / spring / loop, so the ONE switch above controls everything:
// when animations are off, timings and springs jump to their end value at once and loops never start.

const NOOP_ANIMATION = {
  start: (cb) => cb && cb({ finished: true }),
  stop: () => {},
  reset: () => {},
  _startNativeLoop: () => {},
  _isUsingNativeDriver: () => false,
};

export const motion = {
  timing(value, toValue, { duration = DURATION.normal, delay = 0, easing = Easing.out(Easing.cubic) } = {}) {
    return Animated.timing(value, {
      toValue,
      duration: enabled ? duration : 0,
      delay: enabled ? delay : 0,
      easing,
      useNativeDriver: true,
    });
  },
  spring(value, toValue, config = {}) {
    if (!enabled) return Animated.timing(value, { toValue, duration: 0, useNativeDriver: true });
    return Animated.spring(value, { toValue, friction: 6, tension: 120, useNativeDriver: true, ...config });
  },
  delay(ms) {
    return Animated.delay(enabled ? ms : 0);
  },
  sequence: (list) => Animated.sequence(list),
  parallel: (list) => Animated.parallel(list),
  loop(animation, iterations = -1) {
    return enabled ? Animated.loop(animation, { iterations }) : NOOP_ANIMATION;
  },
  // A step that only runs `fn` (e.g. a landing sound) at that moment of a sequence.
  call(fn) {
    return {
      ...NOOP_ANIMATION,
      start: (cb) => {
        if (fn) fn();
        if (cb) cb({ finished: true });
      },
    };
  },
};

// Endless slow sway around a fixed spot (background bubbles). Each bubble gets its own timing.
export function useDrift({ dx = 8, dy = 10, duration = 8000, delay = 0 } = {}) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const quarter = duration / 4;
    const swing = (value, amount, time) =>
      motion.sequence([
        motion.timing(value, amount, { duration: time, easing: ease }),
        motion.timing(value, -amount, { duration: time * 2, easing: ease }),
        motion.timing(value, 0, { duration: time, easing: ease }),
      ]);
    const animation = motion.sequence([
      motion.delay(delay),
      motion.loop(motion.parallel([swing(x, dx, quarter * 1.3), swing(y, dy, quarter)])),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  return { transform: [{ translateX: x }, { translateY: y }] };
}

// A 0 -> 1 -> 0 pulse that repeats while `active` (soft glows on hints and the next letter).
export function usePulse(active, { duration = 1200 } = {}) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      value.setValue(0);
      return undefined;
    }
    const ease = Easing.inOut(Easing.sin);
    const animation = motion.loop(
      motion.sequence([
        motion.timing(value, 1, { duration, easing: ease }),
        motion.timing(value, 0, { duration, easing: ease }),
      ])
    );
    if (!enabled) value.setValue(0.6);
    animation.start();
    return () => animation.stop();
  }, [active]);

  return value;
}

// The buddy's resting life: a slow small bob and a tiny sway (endless, very calm).
export function useIdleSway({ height = 4, degrees = 2, duration = 2500 } = {}) {
  const bob = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const half = duration / 2;
    const animation = motion.parallel([
      motion.loop(
        motion.sequence([
          motion.timing(bob, 1, { duration: half, easing: ease }),
          motion.timing(bob, 0, { duration: half, easing: ease }),
        ])
      ),
      motion.loop(
        motion.sequence([
          motion.timing(sway, 1, { duration: duration * 0.7, easing: ease }),
          motion.timing(sway, -1, { duration: duration * 1.4, easing: ease }),
          motion.timing(sway, 0, { duration: duration * 0.7, easing: ease }),
        ])
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  return {
    transform: [
      { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -height] }) },
      { rotate: sway.interpolate({ inputRange: [-1, 1], outputRange: [`-${degrees}deg`, `${degrees}deg`] }) },
    ],
  };
}

// A short happy wiggle on any 0-based value (rotate it with wiggleRotate).
export function wiggle(value, { swings = 4, duration = 90 } = {}) {
  const steps = [];
  for (let i = 0; i < swings; i++) steps.push(motion.timing(value, i % 2 === 0 ? 1 : -1, { duration }));
  steps.push(motion.timing(value, 0, { duration }));
  return motion.sequence(steps);
}

export function wiggleRotate(value, degrees = 7) {
  return value.interpolate({ inputRange: [-1, 1], outputRange: [`-${degrees}deg`, `${degrees}deg`] });
}

// One hop: up, down, a little squash on landing. `hopValue` is in points (translateY), `squashValue` a scale.
export function hop(hopValue, squashValue, height = 14) {
  return motion.sequence([
    motion.timing(hopValue, -height, { duration: 190, easing: Easing.out(Easing.quad) }),
    motion.timing(hopValue, 0, { duration: 210, easing: Easing.in(Easing.quad) }),
    motion.timing(squashValue, 0.9, { duration: 80 }),
    motion.spring(squashValue, 1, { friction: 4, tension: 160 }),
  ]);
}

// Quick "flip" (scale down and back up, ~250 ms) every time `trigger` changes after the first render.
export function useFlip(trigger) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    motion
      .sequence([
        motion.timing(scale, 0.55, { duration: 110, easing: Easing.in(Easing.quad) }),
        motion.timing(scale, 1, { duration: 140, easing: Easing.out(Easing.back(1.6)) }),
      ])
      .start();
  }, [trigger]);

  return { transform: [{ scale }] };
}
