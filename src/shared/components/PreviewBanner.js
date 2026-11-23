// PREVIEW BANNER - the thin strip under the header while Explore KidBuddy (Preview mode) is on:
// "Preview mode - nothing is saved" + an "Exit preview" button, and under it ONE short sentence for the
// parent about the page they are on (`guide`, from app/navigation/previewGuides.js). A real child using
// Child Mode never sees this strip.
// Props: { onExit, guide }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import AppIcon from './AppIcon';
import AnimatedPressable from './AnimatedPressable';
import { CALM, CALM_RADIUS, FONTS, PALETTE } from '../theme/theme';

export default function PreviewBanner({ onExit, guide }) {
  return (
    <View style={styles.bar} accessibilityRole="summary">
      <View style={styles.row}>
        <Text style={styles.icon}>👀</Text>
        <Text style={styles.text} numberOfLines={2}>
          Preview mode - nothing is saved
        </Text>
        <AnimatedPressable onPress={onExit} hitSlop={8} accessibilityLabel="Exit preview" style={styles.button}>
          <Text style={styles.buttonText}>Exit preview</Text>
        </AnimatedPressable>
      </View>
      {guide ? (
        <View style={styles.guide}>
          <AppIcon name="information-outline" size={16} color={CALM.text} style={styles.guideIcon} />
          <Text style={styles.guideText}>{guide}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: CALM.yellowPale,
    borderBottomWidth: 1,
    borderBottomColor: CALM.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginEnd: 8,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.text,
  },
  button: {
    minHeight: 40,
    marginStart: 8,
    paddingHorizontal: 14,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.surface,
    borderWidth: 1.5,
    borderColor: CALM.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 13,
    color: CALM.primaryDark,
  },
  // the parent's explanation of this page
  guide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: PALETTE.sunny,
  },
  guideIcon: {
    marginTop: 1,
    marginEnd: 6,
  },
  guideText: {
    flex: 1,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: CALM.text,
  },
});
