// SOFT SHAPES - a few pale bubbles behind Splash / Welcome. Each one only sways gently around its
// own spot (6-10 s per loop, its own timing), never roams, collides or bounces. Decorative only.

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useDrift, useEntrance } from '../utils/motion';
import { CALM } from '../theme/theme';

const SHAPES = [
  { size: 200, top: -50, start: -60, color: CALM.skyPale, dx: 8, dy: 10, duration: 9000 },
  { size: 140, top: '20%', end: -40, color: CALM.coralPale, dx: 6, dy: 9, duration: 7200 },
  { size: 70, top: '12%', start: '58%', color: CALM.lavenderPale, dx: 5, dy: 7, duration: 6400 },
  { size: 100, top: '45%', start: -30, color: CALM.yellowPale, dx: 7, dy: 8, duration: 8400 },
  { size: 56, top: '58%', end: '18%', color: CALM.primaryPale, dx: 4, dy: 6, duration: 6800 },
  { size: 230, bottom: -100, end: -70, color: CALM.sagePale, dx: 9, dy: 10, duration: 9800 },
  { size: 80, bottom: '14%', start: '12%', color: CALM.skyPale, dx: 5, dy: 8, duration: 7600 },
];

function Shape({ shape, index }) {
  const entrance = useEntrance(index, { distance: 0, duration: 900 });
  const drift = useDrift({ dx: shape.dx, dy: shape.dy, duration: shape.duration, delay: index * 450 });
  const { size, color, dx: _x, dy: _y, duration: _d, ...position } = shape;

  return (
    <Animated.View style={[styles.shape, position, entrance]}>
      <Animated.View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, drift]} />
    </Animated.View>
  );
}

export default function SoftShapes() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      {SHAPES.map((shape, i) => (
        <Shape key={i} shape={shape} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
  },
  bubble: {
    opacity: 0.6,
  },
});
