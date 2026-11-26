// ARROW BUTTON - the round icon arrows at the bottom of a lesson page (tap = same as a swipe).
//   direction 'next' (big, bottom-right) | 'back' (smaller, next to the buddy)
//   locked: soft grey (tapping still works: the pager stretches and the buddy gives a hint)
//   hint: forward is open -> a pointing hand slides to the right 3 times and the arrow pulses softly.
//         If the child waits ~6 s it plays again, at most 3 more times. Never endless.
//   hintKey: change it (e.g. the page number) to start the hint again.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { animationsEnabled, motion } from '../../../shared/utils/motion';
import { CALM, CALM_SHADOW } from '../../../shared/theme/theme';

const IDLE_REPEAT_MS = 6000;
const MAX_REPEATS = 3;

function PointingHand({ playKey }) {
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!playKey) return undefined;
    const animation = motion.sequence([
      motion.timing(fade, 1, { duration: 200 }),
      motion.loop(
        motion.sequence([
          motion.timing(slide, 18, { duration: 380 }),
          motion.timing(slide, 0, { duration: 380 }),
        ]),
        3
      ),
      motion.timing(fade, animationsEnabled() ? 0 : 1, { duration: 300 }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [playKey]);

  return (
    <Animated.View pointerEvents="none" style={[styles.hand, { opacity: fade, transform: [{ translateX: slide }] }]}>
      <Text style={styles.handText}>👉</Text>
    </Animated.View>
  );
}

export default function ArrowButton({ direction = 'next', onPress, locked = false, hint = false, hintKey = 0 }) {
  const big = direction === 'next';
  const size = big ? 72 : 52;
  const pulse = useRef(new Animated.Value(0)).current;
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    if (!hint) return undefined;
    setPlayKey((k) => k + 1);
    const timers = [];
    for (let i = 1; i <= MAX_REPEATS; i++) {
      timers.push(setTimeout(() => setPlayKey((k) => k + 1), i * (IDLE_REPEAT_MS + 2400)));
    }
    return () => timers.forEach(clearTimeout);
  }, [hint, hintKey]);

  useEffect(() => {
    if (!playKey || !big) return undefined;
    const animation = motion.loop(
      motion.sequence([motion.timing(pulse, 1, { duration: 400 }), motion.timing(pulse, 0, { duration: 400 })]),
      3
    );
    animation.start();
    return () => animation.stop();
  }, [playKey]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  return (
    <View style={styles.wrap}>
      {big && hint ? <PointingHand playKey={playKey} /> : null}
      <Animated.View style={{ transform: [{ scale }] }}>
        <AnimatedPressable
          onPress={onPress}
          accessibilityLabel={big ? 'Next' : 'Back'}
          style={[
            styles.button,
            { width: size, height: size, borderRadius: size / 2 },
            locked ? styles.locked : big ? [styles.open, CALM_SHADOW.lifted] : [styles.soft, CALM_SHADOW.soft],
          ]}
        >
          <Ionicons
            name={big ? 'arrow-forward' : 'arrow-back'}
            size={big ? 38 : 26}
            color={locked ? CALM.textSoft : big ? CALM.onPrimary : CALM.text}
          />
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: {
    backgroundColor: CALM.primary,
  },
  soft: {
    backgroundColor: CALM.surface,
  },
  locked: {
    backgroundColor: CALM.surfaceSoft,
  },
  hand: {
    position: 'absolute',
    end: '100%',
    marginEnd: 6,
  },
  handText: {
    fontSize: 34,
  },
});
