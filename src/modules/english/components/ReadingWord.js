// READING WORD - one word of a Read Along sentence. The glowing word (`lit`) gets a soft yellow background
// with a gold line under it. Every word keeps the same space around it, so nothing jumps when it lights up.
//
//   <ReadingWord word="soft" lit size={36} lineHeight={54} />

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import { READING } from '../readingConfig';
import { FONTS, PALETTE } from '../../../shared/theme/theme';

export default function ReadingWord({ word, lit = false, size, lineHeight }) {
  return (
    <View style={[styles.box, lit && styles.boxLit]}>
      <Text style={[styles.word, { fontSize: size, lineHeight }]}>{word}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 2,
    marginVertical: 3,
    paddingHorizontal: READING.WORD_PADDING,
    borderRadius: READING.WORD_RADIUS,
    borderBottomWidth: READING.UNDERLINE,
    borderColor: 'transparent',
  },
  boxLit: {
    backgroundColor: PALETTE.pastelYellow,
    borderColor: PALETTE.sunny,
  },
  word: {
    fontFamily: FONTS.nunitoExtraBold,
    color: PALETTE.deepPlum,
  },
});
