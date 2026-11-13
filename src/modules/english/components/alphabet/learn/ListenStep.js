// LISTEN - the letter moves up small; the first picture pops in. Tap it: it bounces, its letters pop in
// one by one and the voice says "A says ah, like apple." Then the second picture appears.
// Tapping both pictures unlocks Next.

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import LetterCard from '../LetterCard';
import PictureCard, { LETTER_POP_MS } from '../PictureCard';
import { CALM, FONTS } from '../../../../../shared/theme/theme';

export default function ListenStep({ item, voice, contentWidth, onReady, onHappy }) {
  const [shown, setShown] = useState(1);
  const [plays, setPlays] = useState([0, 0]);
  const [caption, setCaption] = useState(null);
  const timer = useRef(null);
  const pictureSize = Math.min(160, (contentWidth - 16) / 2);

  useEffect(() => {
    voice.ui('Tap each picture.');
    return () => clearTimeout(timer.current);
  }, []);

  function handleTap(index) {
    const example = item.examples[index];
    const next = plays.map((count, i) => (i === index ? count + 1 : count));
    setPlays(next);

    const line = `${item.letter} says ${item.soundSpeech}, like ${example.word.toLowerCase()}.`;
    setCaption(line);
    voice.teach(line);

    if (index === 0 && shown === 1) {
      timer.current = setTimeout(() => setShown(2), example.word.length * LETTER_POP_MS + 1200);
    }
    if (next.every((count) => count > 0) && plays.some((count) => count === 0)) {
      onReady();
      onHappy();
    }
  }

  return (
    <View style={styles.body}>
      <LetterCard item={item} size={110} from={1.5} />

      <View style={styles.row}>
        {item.examples.slice(0, shown).map((example, i) => (
          <PictureCard
            key={example.word}
            example={example}
            item={item}
            size={pictureSize}
            tapped={plays[i] > 0}
            playKey={plays[i]}
            onPress={() => handleTap(i)}
          />
        ))}
      </View>

      <Text style={styles.caption} numberOfLines={2}>
        {caption || ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  caption: {
    marginTop: 14,
    minHeight: 28,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 18,
    color: CALM.textSoft,
    textAlign: 'center',
  },
});
