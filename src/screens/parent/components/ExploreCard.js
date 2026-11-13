// EXPLORE CARD - "Explore KidBuddy" on Parent Home. Opens a Preview of Child Mode with the
// demo child Buddy: every activity open, nothing saved (see app/store/previewSlice.js).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Mascot from '../../../shared/components/Mascot';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../shared/theme/theme';

export default function ExploreCard({ onPress }) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityLabel="Explore KidBuddy" style={[styles.card, CALM_SHADOW.soft]}>
      <View style={styles.text}>
        <Text style={styles.title}>Explore KidBuddy</Text>
        <Text style={styles.copy}>Try every activity as Buddy, our demo child. Nothing is saved.</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Start exploring →</Text>
        </View>
      </View>
      <View style={styles.mascot}>
        <Mascot size={92} avatar="bear" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.skyPale,
    borderWidth: 2,
    borderColor: CALM.sky,
  },
  text: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: CALM.text,
  },
  copy: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: CALM.textSoft,
  },
  cta: {
    minHeight: 44,
    marginTop: 12,
    paddingHorizontal: 16,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.surface,
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    color: CALM.primaryDark,
  },
  mascot: {
    marginStart: 10,
  },
});
