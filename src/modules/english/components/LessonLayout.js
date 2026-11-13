// LESSON LAYOUT - the same frame for every lesson page, so nothing ever moves around:
//   top: back (left) + `right` (the case toggle), then the icon progress
//   middle: the pages (full width, the SwipePager)
//   bottom: the buddy in the bottom-left corner with the small back arrow beside it,
//           a small 🔊 above the big forward arrow on the right. No written instructions.
//   over everything: the party-popper Confetti (`confetti` = { key, big }), which never catches touches.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import Confetti from '../../../shared/components/Confetti';
import SectionHeader from './SectionHeader';
import ArrowButton from './ArrowButton';
import { CALM, CALM_SHADOW, SPACING } from '../../../shared/theme/theme';

const BUDDY_SIZE = 76;
const BAR_HEIGHT = 96;

export default function LessonLayout({ progress, right, onBack, onSound, back, next, buddy, confetti, children }) {
  return (
    <Screen mode="child" background={CALM.background}>
      <View style={styles.body}>
        <SectionHeader onBack={onBack} right={right} />
        <View style={styles.progress}>{progress}</View>

        <View style={styles.pages}>{children}</View>

        <View style={styles.bar}>
          <View style={styles.backSpot}>{back ? <ArrowButton direction="back" {...back} /> : null}</View>
          <View style={styles.nextSpot}>
            {onSound ? (
              <AnimatedPressable onPress={onSound} hitSlop={6} accessibilityLabel="Say it again" style={[styles.sound, CALM_SHADOW.soft]}>
                <Ionicons name="volume-high" size={24} color={CALM.primaryDark} />
              </AnimatedPressable>
            ) : null}
            {next ? <ArrowButton direction="next" {...next} /> : null}
          </View>
        </View>

        <BuddyCharacter size={BUDDY_SIZE} style={styles.buddy} {...buddy} />
        {confetti ? <Confetti burstKey={confetti.key} big={confetti.big} count={confetti.count} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  progress: {
    marginTop: 8,
  },
  pages: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: -SPACING.screen,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'ltr',
  },
  backSpot: {
    marginStart: BUDDY_SIZE + 8,
    width: 56,
    alignItems: 'center',
  },
  nextSpot: {
    alignItems: 'center',
  },
  sound: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  buddy: {
    position: 'absolute',
    left: -6,
    bottom: 0,
  },
});
