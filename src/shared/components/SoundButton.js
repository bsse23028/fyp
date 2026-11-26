// SOUND BUTTON - the round 🔊 "say it again" button of the calm design (56 px, spring press).

import React from 'react';
import { StyleSheet } from 'react-native';
import Text from './AppText';
import AnimatedPressable from './AnimatedPressable';
import { CALM, CALM_SHADOW, CALM_SIZES } from '../theme/theme';

export default function SoundButton({ onPress, style }) {
  return (
    <AnimatedPressable onPress={onPress} hitSlop={6} accessibilityLabel="Say it again" style={[styles.button, CALM_SHADOW.soft, style]}>
      <Text style={styles.icon}>🔊</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: CALM_SIZES.tap,
    height: CALM_SIZES.tap,
    borderRadius: CALM_SIZES.tap / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  icon: {
    fontSize: 24,
  },
});
