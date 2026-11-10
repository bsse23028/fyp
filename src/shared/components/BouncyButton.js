// BOUNCY BUTTON - a pressable that bounces up and down all the time, with a
// shadow on the ground that reacts to the bounce:
//
//   goes UP    -> the shadow gets smaller and lighter
//   comes DOWN -> the shadow gets bigger and darker
//
// When it is pressed it grows a little, and it stays a little bigger while
// `active` is true (e.g. while its card is open).
//
//   <BouncyButton active={open} onPress={toggle} shadowWidth={64} delay={300}>
//     <Mascot size={96} />
//   </BouncyButton>
//
// Props:
//   children     - what bounces (a picture, an emoji ...)
//   onPress      - what happens on tap
//   active       - true = stays slightly bigger
//   shadowWidth  - width of the ground shadow (about the width of the picture)
//   delay        - wait this many ms before starting, so two buttons do not bounce in step
//   accessibilityLabel

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

const JUMP = 14; // how high it jumps (points)

export default function BouncyButton({ children, onPress, active = false, shadowWidth = 64, delay = 0, accessibilityLabel }) {
  const bounce = useRef(new Animated.Value(0)).current; // 0 = on the ground, 1 = highest point
  const grow = useRef(new Animated.Value(1)).current; // size of the button (1 = normal)

  // The endless bounce: up (slows down at the top), down (speeds up towards the ground).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    const starter = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(starter);
      loop.stop();
    };
  }, []);

  // Stay a little bigger while active.
  useEffect(() => {
    springTo(active ? 1.12 : 1);
  }, [active]);

  function springTo(value) {
    Animated.spring(grow, { toValue: value, friction: 5, tension: 160, useNativeDriver: true }).start();
  }

  // The same `bounce` number drives the height AND the shadow, so they always match.
  const lift = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -JUMP] });
  const shadowScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] });
  const shadowOpacity = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.1] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => springTo(1.2)}
      onPressOut={() => springTo(active ? 1.12 : 1)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: active }}
    >
      <View style={styles.wrap}>
        <Animated.View style={{ transform: [{ translateY: lift }, { scale: grow }] }}>{children}</Animated.View>
        <Animated.View
          style={[styles.shadow, { width: shadowWidth, opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: JUMP, // room for the jump
  },
  shadow: {
    height: 10,
    marginTop: 6,
    borderRadius: 5,
    backgroundColor: '#3D2B1F',
  },
});
