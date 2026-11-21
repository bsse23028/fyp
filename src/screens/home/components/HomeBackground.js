// HOME BACKGROUND - the calm backdrop of Child Home: a soft gradient from warm off-white (top) to pale sky
// (bottom) with a few large, very soft round shapes. Each shape only drifts slowly around its OWN spot
// (its own timing, 6 to 10 seconds per loop); nothing roams across the screen.
// `active` = false (the screen is not in front) stops every drift. With animations off nothing moves.
// It is also the thing the glass blurs: it hands its view to the Glass components through GlassContext.
// The shapes and their numbers are in homeConfig.js (HOME_SHAPES).

import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { GlassContext } from './Glass';
import { useDrift } from '../../../shared/utils/motion';
import { GLASS } from '../../../shared/theme/theme';
import { HOME, HOME_SHAPES } from '../homeConfig';

function Shape({ shape, index, active }) {
  const drift = useDrift({ dx: shape.dx, dy: shape.dy, duration: shape.duration, delay: index * 400, active });
  const { size, color, opacity, dx: _dx, dy: _dy, duration: _duration, ...position } = shape;
  return (
    <Animated.View
      style={[styles.shape, position, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }, drift]}
    />
  );
}

// children = the page that lies on top of the background.
export default function HomeBackground({ active, children }) {
  const target = useRef(null);
  const Backdrop = HOME.USE_BLUR ? BlurTargetView : View;

  return (
    <View style={styles.fill}>
      <Backdrop ref={target} style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={GLASS.gradient} style={StyleSheet.absoluteFill} />
        {HOME.SHOW_SHAPES
          ? HOME_SHAPES.map((shape, i) => <Shape key={i} shape={shape} index={i} active={active} />)
          : null}
      </Backdrop>
      <GlassContext.Provider value={HOME.USE_BLUR ? target : null}>{children}</GlassContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  shape: {
    position: 'absolute',
  },
});
