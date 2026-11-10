// TOGGLE - the on/off switch (48 x 28) used for modules in the child profile.
//
//   <Toggle on={enabled} onPress={() => setEnabled(!enabled)} />

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/theme';

export default function Toggle({ on, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={[styles.track, on ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.knob, on && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trackOn: {
    backgroundColor: COLORS.primary,
  },
  trackOff: {
    backgroundColor: '#CBD5E1',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  // slides the knob to the right
  knobOn: {
    alignSelf: 'flex-end',
  },
});
