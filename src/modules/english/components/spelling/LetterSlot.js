// LETTER SLOT - one placeholder: the same picture (a letter, or a whole word of the sentence) as a pale grey
// silhouette.   renderArt(tint) draws the shape in one colour, `glowColor` = the piece's own light colour.
//   near         its OWN letter is held close by (the magnet): it glows softly in that letter's light colour
//   hint         a soft yellow glow in the letter's shape pulses behind it (the child missed twice)
//   filled       its letter has landed (the real letter now sits on top)
// `spot` = { x, y, width, height } from layoutWord (the loose letter lands exactly on top of it).

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { motion, usePulse } from '../../../../shared/utils/motion';
import { SPELLING } from './spellingConfig';

export default function LetterSlot({ renderArt, glowColor, spot, near, hint, filled }) {
  const close = useRef(new Animated.Value(0)).current;
  const pulse = usePulse(hint && !filled && !near, { duration: 900 });

  useEffect(() => {
    motion.timing(close, near ? 1 : 0, { duration: 180 }).start();
  }, [near]);

  return (
    <Animated.View pointerEvents="none" style={[styles.slot, { left: spot.x, top: spot.y, width: spot.width, height: spot.height }]}>
      {/* hint: a yellow shape that pulses */}
      <Animated.View
        style={[
          styles.layer,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1.14] }) }],
          },
        ]}
      >
        {renderArt(SPELLING.HINT_TINT)}
      </Animated.View>
      {/* magnet: a steady soft glow in the letter's own light colour */}
      <Animated.View
        style={[
          styles.layer,
          {
            opacity: close.interpolate({ inputRange: [0, 1], outputRange: [0, SPELLING.MAGNET_GLOW] }),
            transform: [{ scale: close.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) }],
          },
        ]}
      >
        {renderArt(glowColor)}
      </Animated.View>
      <View style={{ opacity: filled ? 0 : SPELLING.PLACEHOLDER_OPACITY }}>{renderArt(SPELLING.PLACEHOLDER_TINT)}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
  },
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
