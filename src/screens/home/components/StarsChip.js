// STARS CHIP - a small glass chip with a star and the number of stars earned today.
// Tapping it opens the "Stars today" card (ChildHomeScreen shows the card). Props: { count, onPress }

import React from 'react';
import { StyleSheet, Text as PlainText } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import Glass from './Glass';
import { CALM, FONTS, GLASS } from '../../../shared/theme/theme';

export default function StarsChip({ count, onPress }) {
  return (
    <AnimatedPressable onPress={onPress} hitSlop={8} accessibilityLabel="Stars today">
      <Glass style={styles.chip} radius={GLASS.radiusPill} strong>
        <Ionicons name="star" size={24} color={GLASS.star} />
        <PlainText style={styles.count}>{count}</PlainText>
      </Glass>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  count: {
    marginStart: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: CALM.text,
  },
});
