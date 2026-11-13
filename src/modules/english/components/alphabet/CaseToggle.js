// CASE TOGGLE - two big round buttons with the real letters ("A" and "a"), top right of the lesson.
// The chosen one is bigger, coloured and gently lifted; the other is softer. No words.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AnimatedPressable from '../../../../shared/components/AnimatedPressable';
import { motion } from '../../../../shared/utils/motion';
import { CALM, CALM_SHADOW, FONTS } from '../../../../shared/theme/theme';

const SIZE = 52;

function CaseButton({ char, selected, accent, onPress, label }) {
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    motion.spring(lift, selected ? 1 : 0, { friction: 6 }).start();
  }, [selected]);

  const style = {
    transform: [
      { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
      { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1.08] }) },
    ],
  };

  return (
    <Animated.View style={style}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={[
          styles.button,
          selected ? [{ backgroundColor: accent.main }, CALM_SHADOW.lifted] : styles.soft,
        ]}
      >
        <Animated.Text style={[styles.char, { color: selected ? CALM.onPrimary : CALM.textSoft }]}>{char}</Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CaseToggle({ item, caseMode, onChange }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      <CaseButton
        char={item.letter}
        label={`${item.letter} capital`}
        selected={caseMode !== 'lower'}
        accent={item.accent}
        onPress={() => onChange('upper')}
      />
      <CaseButton
        char={item.lower}
        label={`${item.lower} small`}
        selected={caseMode === 'lower'}
        accent={item.accent}
        onPress={() => onChange('lower')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    direction: 'ltr',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: {
    backgroundColor: CALM.surfaceSoft,
  },
  char: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 26,
    lineHeight: 32,
  },
});
