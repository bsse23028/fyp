// BUTTON - the big rounded button used everywhere.
//
//   <Button title="Continue" onPress={...} />                      filled indigo
//   <Button title="Log In" variant="secondary" onPress={...} />    white with indigo outline
//   <Button title="Verify" loading={true} />                       shows a spinner

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Text from './AppText';
import { COLORS, FONTS, FONT_SIZES, RADIUS, SIZES } from '../theme/theme';

export default function Button({ title, onPress, variant = 'primary', loading = false, style }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: loading }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: SIZES.button,
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: FONTS.interBold,
    fontSize: FONT_SIZES.button,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primary,
  },
});
