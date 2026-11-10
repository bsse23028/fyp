// CHILD INSTRUCTION - the coloured bar with a speaker and one short instruction
// ("Pick a word activity"). Tapping the speaker reads it aloud.
//
//   <ChildInstruction text="Pick a word activity" />
//   <ChildInstruction text="..." tint={COLORS.sagePale} />

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from './AppText';
import SpeakButton from './SpeakButton';
import { COLORS, FONTS } from '../theme/theme';

export default function ChildInstruction({ text, tint = COLORS.bluePale }) {
  return (
    <View style={[styles.bar, { backgroundColor: tint }]}>
      {/* <SpeakButton text={text} compact /> */}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 64,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    marginStart: 11,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    lineHeight: 23,
    color: COLORS.warmText,
  },
});
