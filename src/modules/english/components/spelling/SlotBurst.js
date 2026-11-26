// SLOT BURST - the little "yes!" effect when a piece (a letter or a word) lands in its place. It is drawn
// ABOVE the pieces.   renderArt(tint) draws the shape in one colour; color / light = the piece's colours.
//   a quick soft flash in the letter's own colour (the shape "fills" with colour)
//   a ring that grows out of the letter and fades
//   a few sparkles
// It plays once each time `burstKey` changes (0 = nothing) and never catches touches.
// With animations off nothing is shown (the steps jump straight to their invisible end).

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Sparkles from '../../../../shared/components/Sparkles';
import { motion } from '../../../../shared/utils/motion';
import { SPELLING } from './spellingConfig';

export default function SlotBurst({ renderArt, color, light, spot, burstKey = 0 }) {
  const flash = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const ringSize = Math.max(spot.width, spot.height);

  useEffect(() => {
    if (!burstKey) return;
    flash.setValue(0);
    ring.setValue(0);
    motion
      .parallel([
        motion.sequence([
          motion.timing(flash, 1, { duration: SPELLING.FLASH_IN }),
          motion.timing(flash, 0, { duration: SPELLING.FLASH_OUT }),
        ]),
        motion.timing(ring, 1, { duration: SPELLING.RING_TIME, easing: Easing.out(Easing.quad) }),
      ])
      .start();
  }, [burstKey]);

  return (
    <Animated.View pointerEvents="none" style={[styles.burst, { left: spot.x, top: spot.y, width: spot.width, height: spot.height }]}>
      <Animated.View
        style={[
          styles.ring,
          {
            left: (spot.width - ringSize) / 2,
            top: (spot.height - ringSize) / 2,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: SPELLING.RING_WIDTH,
            borderColor: color,
            opacity: ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.8, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, SPELLING.RING_GROW] }) }],
          },
        ]}
      />
      <Animated.View style={[styles.layer, { opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, SPELLING.FLASH_OPACITY] }) }]}>
        {renderArt(light)}
      </Animated.View>
      <Sparkles burstKey={burstKey} size={Math.min(26, Math.max(14, spot.width * 0.28))} count={4} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    zIndex: 40,
    elevation: 40,
  },
  ring: {
    position: 'absolute',
  },
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
