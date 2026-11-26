// PROGRESS DOTS - small "round 1 / 2 / 3" dots. Done = filled, current = a little bigger.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { motion } from '../utils/motion';
import { CALM } from '../theme/theme';

function Dot({ state }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    motion.spring(scale, state === 'current' ? 1.35 : 1, { friction: 5 }).start();
  }, [state]);

  return <Animated.View style={[styles.dot, styles[state], { transform: [{ scale }] }]} />;
}

export default function ProgressDots({ count, current }) {
  return (
    <View style={styles.row} accessibilityLabel={`${Math.min(current + 1, count)} / ${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} state={i < current ? 'done' : i === current ? 'current' : 'todo'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  todo: {
    backgroundColor: CALM.line,
  },
  current: {
    backgroundColor: CALM.primary,
  },
  done: {
    backgroundColor: CALM.sage,
  },
});
