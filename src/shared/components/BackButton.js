// BACK BUTTON - the white rounded square with a "<" on the auth screens.

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDirection } from '../utils/direction';
import { COLORS } from '../theme/theme';

export default function BackButton({ onPress }) {
  const { isRTL } = useDirection();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <View style={[styles.chevron, isRTL && styles.chevronRTL]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
  },
  // A "<" drawn from two borders of a small turned square.
  chevron: {
    width: 12,
    height: 12,
    marginStart: 4,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: COLORS.text,
    transform: [{ rotate: '45deg' }],
  },
  // Urdu: the arrow points right ">" (back = towards the right)
  chevronRTL: {
    transform: [{ rotate: '225deg' }],
  },
});
