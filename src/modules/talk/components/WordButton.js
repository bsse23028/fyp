// WORD BUTTON - one picture + word on the AAC board, in its word-type colour (Fitzgerald Key).
// A tap: a small springy press, then onPress(word). The board decides what happens (speak + add to the strip).
// Props: { item: { word, type }, width, height, big (topic page), onPress(item) }

import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Text from '../../../shared/components/AppText';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { WORD_TYPES, symbolFor } from '../data/aacWords';
import { AAC } from '../aacConfig';
import { FONTS, PALETTE } from '../../../shared/theme/theme';

export default function WordButton({ item, width, height, big = false, onPress }) {
  const type = WORD_TYPES[item.type] || WORD_TYPES.people;
  const picture = width * (big ? AAC.TOPIC_SYMBOL_PART : AAC.SYMBOL_PART);

  return (
    <AnimatedPressable
      onPress={() => onPress(item)}
      accessibilityLabel={item.word}
      style={[
        styles.cell,
        { width, height, backgroundColor: type.fill, borderColor: type.edge },
      ]}
    >
      <Image source={symbolFor(item.word)} style={{ width: picture, height: picture }} resizeMode="contain" />
      <Text style={[styles.label, { fontSize: big ? AAC.TOPIC_LABEL_SIZE : AAC.LABEL_SIZE }]} numberOfLines={1} adjustsFontSizeToFit>
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
    paddingVertical: 4,
  },
  label: {
    marginTop: 2,
    fontFamily: FONTS.nunitoExtraBold,
    color: PALETTE.deepPlum,
    textAlign: 'center',
  },
});
