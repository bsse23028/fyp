// PREVIEW BANNER - the thin strip under the header while Explore KidBuddy (Preview mode) is on:
// "Preview mode - nothing is saved" + an "Exit preview" button.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import AnimatedPressable from './AnimatedPressable';
import { CALM, CALM_RADIUS, FONTS } from '../theme/theme';

export default function PreviewBanner({ onExit }) {
  return (
    <View style={styles.bar} accessibilityRole="summary">
      <Text style={styles.icon}>👀</Text>
      <Text style={styles.text} numberOfLines={2}>
        Preview mode - nothing is saved
      </Text>
      <AnimatedPressable onPress={onExit} hitSlop={8} accessibilityLabel="Exit preview" style={styles.button}>
        <Text style={styles.buttonText}>Exit preview</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: CALM.yellowPale,
    borderBottomWidth: 1,
    borderBottomColor: CALM.line,
  },
  icon: {
    fontSize: 16,
    marginEnd: 8,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.text,
  },
  button: {
    minHeight: 40,
    marginStart: 8,
    paddingHorizontal: 14,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.surface,
    borderWidth: 1.5,
    borderColor: CALM.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.primaryDark,
  },
});
