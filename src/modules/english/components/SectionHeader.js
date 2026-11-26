// SECTION HEADER - back arrow + title (+ optional 🔊) for the English section screens.
// Pass `center` instead of a title to put something else in the middle (the lesson's progress),
// and `right` for something at the top right (the lesson's case toggle).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import SoundButton from '../../../shared/components/SoundButton';
import { useDirection } from '../../../shared/utils/direction';
import { CALM, CALM_SHADOW, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

export function BackCircle({ onPress }) {
  const { isRTL } = useDirection();
  return (
    <AnimatedPressable onPress={onPress} hitSlop={6} accessibilityLabel="Back" style={[styles.back, CALM_SHADOW.soft]}>
      <Ionicons name="arrow-back" size={28} color={CALM.text} style={isRTL && styles.flip} />
    </AnimatedPressable>
  );
}

export default function SectionHeader({ title, center, right, onBack, onSound }) {
  let end = null;
  if (right) end = right;
  else if (onSound) end = <SoundButton onPress={onSound} />;
  else if (title) end = <View style={styles.spacer} />;

  return (
    <View style={styles.row}>
      <BackCircle onPress={onBack} />
      <View style={styles.middle}>
        {center ||
          (title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null)}
      </View>
      {end}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: CALM_SIZES.tap,
    height: CALM_SIZES.tap,
    borderRadius: CALM_SIZES.tap / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  flip: {
    transform: [{ scaleX: -1 }],
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 26,
    color: CALM.text,
  },
  spacer: {
    width: CALM_SIZES.tap,
  },
});
