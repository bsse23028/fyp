// ANIMATED PRESSABLE - a Pressable that shrinks a little with a soft spring while pressed.
// Use it for every button / card of the new design. Respects the switch in utils/motion.js.

import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { pressIn, pressOut } from '../utils/motion';

export default function AnimatedPressable({ children, style, onPressIn, onPressOut, disabled, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        pressIn(scale);
        if (onPressIn) onPressIn(e);
      }}
      onPressOut={(e) => {
        pressOut(scale);
        if (onPressOut) onPressOut(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}
