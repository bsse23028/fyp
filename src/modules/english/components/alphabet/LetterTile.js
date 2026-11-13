// LETTER TILE - one "Aa" tile of the alphabet grid: stars earned, a soft check when done,
// and a slow glow when it is the next letter to learn. Appears with a quick stagger.

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../shared/components/AppText';
import AnimatedPressable from '../../../../shared/components/AnimatedPressable';
import StarsRow from '../../../../shared/components/StarsRow';
import { useEntrance, usePulse } from '../../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SUCCESS, FONTS } from '../../../../shared/theme/theme';

export default function LetterTile({ item, index, stars, isNext, size, onPress }) {
  const entrance = useEntrance(index, { stagger: 28, duration: 220, distance: 10 });
  const glow = usePulse(isNext, { duration: 1600 });
  const done = stars > 0;

  return (
    <Animated.View style={[{ width: size }, entrance]}>
      {isNext && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            { backgroundColor: item.accent.main },
            {
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.55] }),
              transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
            },
          ]}
        />
      )}
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={`${item.letter}, ${stars} / 3`}
        style={[styles.tile, { height: size, backgroundColor: item.accent.pale }, CALM_SHADOW.soft]}
      >
        <Text style={[styles.letter, { color: item.accent.deep, fontSize: size * 0.36 }]}>
          {item.letter}
          {item.lower}
        </Text>
        <StarsRow count={stars} size={Math.max(12, size * 0.14)} />
        {done && (
          <View style={styles.check}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    margin: -5,
    borderRadius: CALM_RADIUS.large + 5,
  },
  tile: {
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
  },
  check: {
    position: 'absolute',
    top: 6,
    end: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM_SUCCESS.pale,
  },
  checkText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 12,
    color: CALM_SUCCESS.deep,
  },
});
