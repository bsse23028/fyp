// STARS ROW - 0 to `max` soft stars.   <StarsRow count={2} size={14} />   <StarsRow count={3} popIn gap={400} />
// popIn: the earned stars spring in one after another (result screens).

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { useScaleIn } from '../utils/motion';
import { CALM } from '../theme/theme';

function Star({ filled, size, delay, popIn }) {
  const pop = useScaleIn(delay);
  const style = [styles.star, { fontSize: size, lineHeight: size * 1.2, color: filled ? CALM.yellow : CALM.line }];
  if (!popIn || !filled) return <Text style={style}>★</Text>;
  return <Animated.Text style={[style, pop]}>★</Animated.Text>;
}

export default function StarsRow({ count = 0, max = 3, size = 16, popIn = false, gap = 400, style }) {
  return (
    <View style={[styles.row, style]} accessibilityLabel={`${count} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < count} size={size} popIn={popIn} delay={i * gap} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  star: {
    marginHorizontal: 1,
    textAlign: 'center',
  },
});
