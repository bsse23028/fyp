// LETTER CARD - the big "Aa" card. Pops in with a soft spring and one glow pulse; tap = happy wiggle.
//   pulsing: breathes in time while the voice says the sound (Say step)
//   from: start scale for the pop (1.5 = "shrinks" into place, used at the top of Listen)

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Text from '../../../../shared/components/AppText';
import AnimatedPressable from '../../../../shared/components/AnimatedPressable';
import { motion, usePulse, wiggle, wiggleRotate } from '../../../../shared/utils/motion';
import { CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../shared/theme/theme';

export default function LetterCard({ item, size = 200, from = 0.6, onPress, pulsing = false, wiggleKey = 0 }) {
  const pop = useRef(new Animated.Value(from)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const beat = usePulse(pulsing, { duration: 450 });

  useEffect(() => {
    motion
      .parallel([
        motion.spring(pop, 1, { friction: 5, tension: 90 }),
        motion.sequence([
          motion.delay(250),
          motion.timing(glow, 1, { duration: 450 }),
          motion.timing(glow, 0, { duration: 650 }),
        ]),
      ])
      .start();
  }, []);

  useEffect(() => {
    if (wiggleKey) wiggle(shake, { swings: 4, duration: 80 }).start();
  }, [wiggleKey]);

  const beatScale = beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const card = (
    <Animated.View
      style={[
        styles.card,
        CALM_SHADOW.lifted,
        { width: size, height: size * 0.8, backgroundColor: item.accent.pale },
        { transform: [{ scale: pop }, { scale: beatScale }, { rotate: wiggleRotate(shake, 6) }] },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { borderColor: item.accent.main, opacity: glow }]}
      />
      <Text style={[styles.letter, { fontSize: size * 0.42, color: item.accent.deep }]}>
        {item.letter}
        {item.lower}
      </Text>
    </Animated.View>
  );

  if (!onPress) return card;
  return (
    <AnimatedPressable onPress={onPress} accessibilityLabel={`Letter ${item.letter}`}>
      {card}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CALM_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    margin: -6,
    borderRadius: CALM_RADIUS.xl + 6,
    borderWidth: 6,
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
  },
});
