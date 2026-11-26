// POP CARD - a white card that pops in under the hero (the greeting card and the "Stars today" card).
// Tapping the card itself does nothing, so it stays open; ChildHomeScreen closes it when the child taps
// anywhere else. With animations off it simply appears.

import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { motion } from '../../../shared/utils/motion';
import { COLORS } from '../../../shared/theme/theme';

export default function PopCard({ children }) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.spring(pop, 1, { friction: 7, tension: 120 }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { opacity: pop, transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
      ]}
    >
      <Pressable onPress={() => {}} accessible={false} style={styles.card}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
  },
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
