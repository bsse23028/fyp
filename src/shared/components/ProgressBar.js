// PROGRESS BAR - a thin rounded bar that is filled for a part (value 0 = empty, 1 = full).
//
//   <ProgressBar value={0.6} />                         sunny yellow on a pale track
//   <ProgressBar value={0.3} color={PALETTE.coral} />
//
// Props: value (0..1), color, trackColor, style

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DESIGN } from '../theme/designConfig';
import { PALETTE } from '../theme/theme';

export default function ProgressBar({ value = 0, color = PALETTE.sunny, trackColor = PALETTE.lavenderMist, style }) {
  const part = Math.max(0, Math.min(1, value || 0));

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(part * 100) }}
    >
      <View style={[styles.fill, { width: `${part * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: DESIGN.BAR_HEIGHT,
    borderRadius: DESIGN.BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: DESIGN.BAR_HEIGHT / 2,
  },
});
