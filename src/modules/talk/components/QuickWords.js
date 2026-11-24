// QUICK WORDS - the row of words that is ALWAYS on the AAC board, above the core words
// (yes · no · please · thank you · wait · toilet). White tiles with a soft coral edge.
// Props: { words, onPress(item) }

import React from 'react';
import { StyleSheet, View } from 'react-native';
import WordButton from './WordButton';
import { AAC } from '../aacConfig';

export default function QuickWords({ words, width, onPress }) {
  const cell = (width - AAC.GAP * (words.length - 1)) / words.length;
  return (
    <View style={styles.row}>
      {words.map((item) => (
        <WordButton key={item.word} item={item} width={cell} height={AAC.QUICK_HEIGHT} onPress={onPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: AAC.GAP,
    direction: 'ltr', // the same places in Urdu too
  },
});
