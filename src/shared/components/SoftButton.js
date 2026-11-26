// SOFT BUTTON - the big rounded button of the calm design (spring press, 56+ px tall, Nunito).
//   variant: 'primary' (teal) | 'secondary' (white, teal border) | 'soft' (pale teal) | 'outline-coral'

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Text from './AppText';
import AnimatedPressable from './AnimatedPressable';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SIZES, FONTS } from '../theme/theme';

const VARIANTS = {
  primary: { box: { backgroundColor: CALM.primary, borderColor: CALM.primary }, text: { color: CALM.onPrimary } },
  secondary: { box: { backgroundColor: CALM.surface, borderColor: CALM.primary }, text: { color: CALM.primaryDark } },
  soft: { box: { backgroundColor: CALM.primaryPale, borderColor: CALM.primaryPale }, text: { color: CALM.primaryDark } },
  'outline-coral': { box: { backgroundColor: CALM.coralPale, borderColor: CALM.coral }, text: { color: CALM.text } },
};

export default function SoftButton({ title, onPress, variant = 'primary', icon, loading = false, style, textStyle }) {
  const look = VARIANTS[variant] || VARIANTS.primary;

  return (
    <AnimatedPressable
      onPress={loading ? undefined : onPress}
      accessibilityLabel={title}
      accessibilityState={{ busy: loading }}
      style={[styles.base, look.box, variant === 'primary' && CALM_SHADOW.soft, style]}
    >
      {loading ? (
        <ActivityIndicator color={look.text.color} />
      ) : (
        <View style={styles.row}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={[styles.text, look.text, textStyle]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: CALM_SIZES.tap,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: CALM_RADIUS.medium,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    marginEnd: 8,
  },
  text: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    textAlign: 'center',
  },
});
