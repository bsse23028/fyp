// CHIP - a small rounded choice button ("7–9 years", "Reading", "English" ...).
// Selected chips are light indigo with an indigo border.
//
//   <Chip label="Reading" selected={on} onPress={() => ...} />

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS } from '../theme/theme';

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryPale,
  },
  text: {
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.primary,
  },
});
