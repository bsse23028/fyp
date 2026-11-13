// LESSON LAYOUT - the same frame for every lesson stage, so nothing jumps around:
//   top: back + StageProgress, then the instruction (written) with a 🔊 to hear it again
//   middle: the stage content
//   bottom: the buddy in the bottom-left corner, the Next button bottom-centre

import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import SoundButton from '../../../shared/components/SoundButton';
import CrossFade from '../../../shared/components/CrossFade';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from './SectionHeader';
import NextButton from './NextButton';
import { CALM, FONTS, SPACING } from '../../../shared/theme/theme';

const BUDDY_SIZE = 76;
const BUDDY_ROOM = BUDDY_SIZE + 12;

export default function LessonLayout({ progress, instruction, onBack, onSound, next, buddy, children }) {
  const { width } = useWindowDimensions();
  const nextWidth = Math.max(140, Math.min(230, width - SPACING.screen * 2 - BUDDY_ROOM * 2));

  return (
    <Screen mode="child" background={CALM.background}>
      <View style={styles.body}>
        <SectionHeader onBack={onBack} center={progress} />

        <View style={styles.instructionRow}>
          <CrossFade stepKey={instruction} style={styles.instructionFade}>
            <Text style={styles.instruction} numberOfLines={3}>
              {instruction}
            </Text>
          </CrossFade>
          {onSound ? <SoundButton onPress={onSound} /> : null}
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.bottom}>
          <NextButton width={nextWidth} {...next} />
        </View>
        <BuddyCharacter size={BUDDY_SIZE} style={styles.buddy} {...buddy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    minHeight: 60,
  },
  instructionFade: {
    marginEnd: 10,
    justifyContent: 'center',
  },
  instruction: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    lineHeight: 28,
    color: CALM.text,
  },
  content: {
    flex: 1,
    marginTop: 6,
  },
  bottom: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddy: {
    position: 'absolute',
    start: -6,
    bottom: 0,
  },
});
