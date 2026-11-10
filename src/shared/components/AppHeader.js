// APP HEADER - the top bar of every screen (logo left, buttons right).
//
//   every screen:  logo + the English / اردو toggle
//   Home button:   🏠 goes to the home screen of the current mode
//   Child Mode:    the logo is tappable (opens "My Buddy") and a 🔒 Parent button
//                  asks for the Parent PIN
//
// The bar has a thin line and a soft shadow underneath, so it never blends
// into the screen below it.
//
// Props:
//   avatar         - optional avatar id, to preview a choice before it is saved
//   onLogoPress    - optional: makes the logo tappable
//   onHomePress    - optional: shows the 🏠 button
//   onParentPress  - optional: shows the 🔒 Parent button

import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from './AppText';
import BrandLogo from './BrandLogo';
import LanguageToggle from './LanguageToggle';
import { COLORS, FONTS, SPACING } from '../theme/theme';

export default function AppHeader({ avatar, onLogoPress, onHomePress, onParentPress }) {
  const { width } = useWindowDimensions();
  const roomy = width >= 390; // small phones show only the 🔒 icon, big phones also the word "Parent"

  return (
    <View style={styles.bar}>
      {onLogoPress ? (
        <Pressable onPress={onLogoPress} hitSlop={8} accessibilityRole="button" accessibilityLabel="Change my buddy">
          <BrandLogo height={38} avatar={avatar} />
        </Pressable>
      ) : (
        <BrandLogo height={38} avatar={avatar} />
      )}

      <View style={styles.right}>
        {onHomePress ? (
          <Pressable
            onPress={onHomePress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Home"
            style={[styles.button, styles.gap]}
          >
            <Text style={styles.icon}>🏠</Text>
          </Pressable>
        ) : null}

        {onParentPress ? (
          <Pressable
            onPress={onParentPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Parent mode"
            style={[styles.button, styles.gap, roomy && styles.buttonWide]}
          >
            <Text style={styles.icon}>🔒</Text>
            {roomy ? <Text style={styles.parentText}>Parent</Text> : null}
          </Pressable>
        ) : null}

        <LanguageToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    // the separator: a thin line + a soft shadow
    borderBottomWidth: 1,
    borderBottomColor: '#E6E0F2',
    shadowColor: '#2D2563',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    zIndex: 2, // keeps the shadow on top of the screen content
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    marginEnd: 8,
  },
  button: {
    minWidth: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E0F2',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWide: {
    paddingHorizontal: 10,
  },
  icon: {
    fontSize: 18,
  },
  parentText: {
    marginStart: 5,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    color: COLORS.warmMuted,
  },
});
