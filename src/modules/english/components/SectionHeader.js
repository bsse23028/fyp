// SECTION HEADER - back arrow + title (+ optional 🔊) for the English section screens.
// Pass `center` instead of a title to put something else in the middle (the lesson's StageProgress).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import SoundButton from '../../../shared/components/SoundButton';
import { useDirection } from '../../../shared/utils/direction';
import { CALM, CALM_SHADOW, CALM_SIZES, FONTS } from '../../../shared/theme/theme';

export function BackCircle({ onPress }) {
  const { isRTL } = useDirection();
  return (
    <AnimatedPressable onPress={onPress} hitSlop={6} accessibilityLabel="Back" style={[styles.back, CALM_SHADOW.soft]}>
      <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
    </AnimatedPressable>
  );
}

export default function SectionHeader({ title, center, onBack, onSound }) {
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
      {onSound ? <SoundButton onPress={onSound} /> : title ? <View style={styles.spacer} /> : null}
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
  backIcon: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 24,
    color: CALM.text,
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
