// KID SCENE - a soft, animated picture-book background: sky gradient, a smiling sun that breathes
// slowly, clouds that float across very slowly, rolling hills and a few swaying flowers.
//   <KidScene scene="day" active={focused}>{the screen}</KidScene>
// `active` = false (screen not in front) stops every loop. With animations off nothing moves.
// Colours and numbers live in kidSceneConfig.js. All motion goes through utils/motion.js.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { motion, usePulse } from '../utils/motion';
import { KID_SCENES, KID_SCENE_MOTION as M } from './kidSceneConfig';

function Cloud({ index, width, screenWidth, screenHeight, active }) {
  const x = useRef(new Animated.Value(0)).current;
  const duration = M.cloudMinMs + ((M.cloudMaxMs - M.cloudMinMs) * index) / Math.max(1, M.cloudCount - 1);
  const start = (index / M.cloudCount) * screenWidth; // spread them out at the start

  useEffect(() => {
    if (!active) return undefined;
    const travel = screenWidth + width * 2;
    x.setValue((start + width) / travel);
    const first = motion.timing(x, 1, { duration: duration * (1 - (start + width) / travel), easing: Easing.linear });
    const loop = motion.loop(
      motion.sequence([motion.timing(x, 0, { duration: 0 }), motion.timing(x, 1, { duration, easing: Easing.linear })])
    );
    const animation = motion.sequence([first, loop]);
    animation.start();
    return () => animation.stop();
  }, [active, screenWidth]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-width, screenWidth + width] });
  const h = width * 0.45;
  return (
    <Animated.View style={[styles.cloud, { top: M.cloudY[index] * screenHeight, width, height: h, transform: [{ translateX }] }]}>
      <View style={[styles.puff, { width: h * 1.1, height: h * 1.1, borderRadius: h, left: width * 0.18, top: -h * 0.35 }]} />
      <View style={[styles.puff, { width: h * 0.85, height: h * 0.85, borderRadius: h, left: width * 0.48, top: -h * 0.18 }]} />
      <View style={[styles.puff, { width, height: h * 0.7, borderRadius: h, top: h * 0.3 }]} />
    </Animated.View>
  );
}

function Sun({ sun, screenWidth, screenHeight, active }) {
  const breath = usePulse(active, { duration: M.sunBreathMs });
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const s = sun.size;
  return (
    <Animated.View style={[styles.sun, { left: sun.x * screenWidth - s / 2, top: sun.y * screenHeight, transform: [{ scale }] }]}>
      <View style={{ position: 'absolute', width: s * 1.5, height: s * 1.5, borderRadius: s, backgroundColor: sun.glow, opacity: 0.6, left: -s * 0.25, top: -s * 0.25 }} />
      <View style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: sun.color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.sunEyes}>
          <View style={[styles.sunEye, { width: s * 0.09, height: s * 0.12 }]} />
          <View style={[styles.sunEye, { width: s * 0.09, height: s * 0.12 }]} />
        </View>
        <View style={{ width: s * 0.3, height: s * 0.14, borderBottomWidth: 3, borderColor: '#B9742A', borderBottomLeftRadius: s, borderBottomRightRadius: s }} />
      </View>
    </Animated.View>
  );
}

function Flower({ emoji, index, active }) {
  const sway = usePulse(active, { duration: M.flowerSwayMs + index * 400 });
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });
  return <Animated.View style={{ transform: [{ rotate }] }}><Text style={styles.flower}>{emoji}</Text></Animated.View>;
}

export default function KidScene({ scene = 'day', active = true, children, style }) {
  const { width, height } = useWindowDimensions();
  const [size, setSize] = useState({ width, height });
  const look = KID_SCENES[scene] || KID_SCENES.day;
  const w = size.width;
  const h = size.height;

  return (
    <View style={[styles.fill, style]} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <LinearGradient colors={look.sky} style={StyleSheet.absoluteFill} />
        {look.sun.show ? <Sun sun={look.sun} screenWidth={w} screenHeight={h} active={active} /> : null}
        {Array.from({ length: M.cloudCount }).map((_, i) => (
          <Cloud key={i} index={i} width={M.cloudSize[i % M.cloudSize.length]} screenWidth={w} screenHeight={h} active={active} />
        ))}
        {look.hills.map((hill, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: hill.x * w,
              bottom: -hill.height * h * 0.9,
              width: hill.width * w,
              height: hill.height * h * 2,
              borderRadius: w,
              backgroundColor: hill.color,
            }}
          />
        ))}
        <View style={styles.flowers}>
          {look.flowers.map((emoji, i) => (
            <Flower key={i} emoji={emoji} index={i} active={active} />
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    left: 0,
    opacity: 0.9,
  },
  puff: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  sun: {
    position: 'absolute',
  },
  sunEyes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  sunEye: {
    borderRadius: 6,
    backgroundColor: '#B9742A',
  },
  flowers: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    direction: 'ltr',
  },
  flower: {
    fontSize: 26,
  },
});
