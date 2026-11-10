// MASCOT SPEECH - Buddy with a dark speech bubble next to him
// ("Hi, I'm / Buddy!"  or  "Let's grow / together!").
//
// Everything inside (bubble size, text size, tail) is calculated from the
// mascot `size`, so the whole picture scales smoothly on small and big phones.
//
// Props:
//   size   - mascot height in points
//   line1  - first line, white         (e.g. "Hi, I'm")
//   line2  - second line, lavender     (e.g. "Buddy!")

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import Mascot from './Mascot';
import { COLORS, FONTS } from '../theme/theme';

export default function MascotSpeech({ size, line1, line2 }) {
  return (
    <View style={styles.row}>
      <Mascot size={size} />

      <View
        style={[
          styles.bubble,
          {
            marginTop: size * 0.14,
            marginStart: size * 0.02,
            paddingVertical: size * 0.11,
            paddingHorizontal: size * 0.13,
            borderRadius: size * 0.16,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize: size * 0.118, lineHeight: size * 0.15 }]}>
          {line1}
        </Text>
        <Text style={[styles.text, styles.accent, { fontSize: size * 0.118, lineHeight: size * 0.15 }]}>
          {line2}
        </Text>

        {/* little triangle under the bubble, pointing down-left to the bunny */}
        <View
          style={[
            styles.tail,
            {
              left: size * 0.1,
              bottom: -size * 0.11,
              borderTopWidth: size * 0.11,
              borderRightWidth: size * 0.1,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  bubble: {
    backgroundColor: COLORS.bubble,
  },
  text: {
    fontFamily: FONTS.nunitoExtraBold,
    color: COLORS.white,
  },
  accent: {
    color: COLORS.bubbleAccent,
  },
  // A border-triangle: top border coloured, right border see-through.
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderTopColor: COLORS.bubble,
    borderRightColor: 'transparent',
  },
});
