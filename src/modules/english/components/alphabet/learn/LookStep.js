// LOOK - the big letter card pops in; the voice says "This is the letter A."
// Tapping the card makes it wiggle and says the letter name. One tap unlocks Next.

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LetterCard from '../LetterCard';

export default function LookStep({ item, voice, cardSize, onReady }) {
  const [wiggleKey, setWiggleKey] = useState(0);

  useEffect(() => {
    voice.ui('This is the letter {letter}.', { letter: item.letter });
  }, []);

  function handleTap() {
    setWiggleKey((key) => key + 1);
    voice.teach(item.nameSpeech);
    onReady();
  }

  return (
    <View style={styles.center}>
      <LetterCard item={item} size={cardSize} onPress={handleTap} wiggleKey={wiggleKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
