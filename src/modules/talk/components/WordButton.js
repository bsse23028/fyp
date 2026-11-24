// WORD BUTTON - one picture + word on the AAC board, in its word-type colour (Fitzgerald Key):
// a coloured tile with the picture on a soft white card and the word in bold under it.
// A tap: a springy press, then onPress(item). The board decides what happens (speak + add to the sentence).
// Props: { item: { word, type, pic }, width, height, big (larger word), onPress(item) }

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { WORD_TYPES, symbolFor } from '../data/aacWords';
import { AAC } from '../aacConfig';
import { FONTS, PALETTE } from '../../../shared/theme/theme';

export default function WordButton({ item, width, height, big = false, onPress }) {
  const type = WORD_TYPES[item.type] || WORD_TYPES.people;
  const labelSize = big ? AAC.TOPIC_LABEL_SIZE : AAC.LABEL_SIZE;
  // the picture card fills the tile above the word
  const card = Math.max(20, Math.min(width - 8, height - labelSize * 1.3 - 8));

  return (
    <AnimatedPressable
      onPress={() => onPress(item)}
      accessibilityLabel={item.word}
      style={[styles.cell, { width, height, backgroundColor: type.fill, borderColor: type.edge }]}
    >
      <View style={[styles.card, { width: card, height: card, borderRadius: card * 0.22 }]}>
        <Image source={symbolFor(item)} style={{ width: card * 0.86, height: card * 0.86 }} resizeMode="contain" />
      </View>
      <Text style={[styles.label, { fontSize: labelSize }]} numberOfLines={1} adjustsFontSizeToFit>
        {item.word}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: AAC.CELL_RADIUS,
    borderWidth: AAC.CELL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.cloudWhite,
  },
  label: {
    marginTop: 1,
    fontFamily: FONTS.nunitoBlack,
    color: PALETTE.deepPlum,
    textAlign: 'center',
  },
});
