// FORM ERROR - a red message for a problem with the whole form
// (for example "Incorrect email or password."). Shows nothing when empty.

import React from 'react';
import { StyleSheet } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS } from '../theme/theme';

export default function FormError({ message, style }) {
  if (!message) return null;

  return (
    <Text style={[styles.text, style]} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.interMedium,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.error,
    textAlign: 'center',
  },
});
