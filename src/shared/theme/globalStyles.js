// GLOBAL STYLES - styles that are shared by many screens.
//
// Screen-specific styles stay at the bottom of each screen file.
// Anything that is repeated in 2+ screens lives here instead.

import { StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from './theme';

export const globalStyles = StyleSheet.create({
  // The big title on form screens ("Welcome back", "Forgot password?" ...)
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: FONT_SIZES.heading,
    color: COLORS.text,
  },
  // The grey line under the heading
  subheading: {
    marginTop: 6,
    fontFamily: FONTS.interRegular,
    fontSize: FONT_SIZES.body,
    lineHeight: 21,
    color: COLORS.textMuted,
  },
  // Grey centred sentence ("New to KidBuddy? ...")
  centerText: {
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  // Indigo tappable text ("Create account", "Forgot password?" ...)
  link: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  // Small grey print under a form or under buttons
  smallPrint: {
    fontFamily: FONTS.interRegular,
    fontSize: FONT_SIZES.small,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  // Space between stacked form fields
  fieldGap: {
    marginTop: SPACING.medium,
  },
});
