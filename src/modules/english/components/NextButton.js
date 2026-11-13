// NEXT BUTTON - the one main button of every lesson stage, always bottom-centre.
// Disabled = soft grey, no press. `pulsing` adds a slow gentle breathing to invite a tap.

import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { usePulse } from '../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

export default function NextButton({ title = 'Next', onPress, disabled = false, pulsing = false, width }) {
  const pulse = usePulse(pulsing && !disabled, { duration: 1400 });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        style={[styles.button, { width }, disabled ? styles.off : [styles.on, CALM_SHADOW.soft]]}
      >
        <Text style={[styles.text, disabled && styles.textOff]} numberOfLines={1}>
          {title}
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: CALM_SIZES.bigButton,
    paddingHorizontal: 18,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: {
    backgroundColor: CALM.primary,
  },
  off: {
    backgroundColor: CALM.surfaceSoft,
  },
  text: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 19,
    color: CALM.onPrimary,
  },
  textOff: {
    color: CALM.textSoft,
  },
});
