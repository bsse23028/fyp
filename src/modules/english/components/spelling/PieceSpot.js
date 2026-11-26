// PIECE SPOT - the place of one loose piece (a letter, or a word of the sentence) on the page.
// The pieces pop in one after another; the piece that is being held is drawn above the others.

import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useScaleIn } from '../../../../shared/utils/motion';

export default function PieceSpot({ index, x, y, lifted, children }) {
  const appear = useScaleIn(250 + index * 90);
  return (
    <Animated.View style={[styles.spot, { left: x, top: y, zIndex: lifted ? 30 : 2, elevation: lifted ? 30 : 2 }, appear]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spot: {
    position: 'absolute',
  },
});
