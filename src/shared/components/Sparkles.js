// SPARKLES - a few ✨ that drift up gently and fade, each time `burstKey` changes (0 = nothing).
// Place it inside a relative parent; it never catches touches. Off when animations are off.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { animationsEnabled, motion } from '../utils/motion';

const SPOTS = [
  { start: '10%', delay: 0, rise: 50 },
  { start: '45%', delay: 120, rise: 66 },
  { start: '78%', delay: 240, rise: 46 },
  { start: '28%', delay: 360, rise: 58 },
];

function Sparkle({ spot, size }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = motion.sequence([motion.delay(spot.delay), motion.timing(progress, 1, { duration: 1300 })]);
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { start: spot.start },
        {
          opacity: progress.interpolate({ inputRange: [0, 0.2, 0.75, 1], outputRange: [0, 1, 0.8, 0] }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -spot.rise] }) }],
        },
      ]}
    >
      <Text style={{ fontSize: size }}>✨</Text>
    </Animated.View>
  );
}

export default function Sparkles({ burstKey = 0, size = 18, count = 3, style }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!burstKey || !animationsEnabled()) return undefined;
    setShown(burstKey);
    const timer = setTimeout(() => setShown(0), 1800);
    return () => clearTimeout(timer);
  }, [burstKey]);

  if (!shown) return null;

  return (
    <View style={[styles.layer, style]} pointerEvents="none">
      {SPOTS.slice(0, count).map((spot, i) => (
        <Sparkle key={`${shown}-${i}`} spot={spot} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: {
    position: 'absolute',
    bottom: '40%',
  },
});
