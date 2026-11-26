// LISTEN PICTURE - the big picture of a Listen page: a soft round background with the picture standing on
// it as a TalkingObject (eyes, smile, arms, feet), and the word below with the letter highlighted.
//   mood / moodKey / speaking / active / onPress go straight to the TalkingObject.
//   Change `popKey` to make the word's letters pop in one by one.

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import TalkingObject from '../../../../../shared/components/TalkingObject';
import { useFlip, useScaleIn } from '../../../../../shared/utils/motion';
import { highlightIndex } from '../../../data/alphabetData';
import { useLetterCase } from '../LetterCase';
import { CALM, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

export const LETTER_POP_MS = 120;
const OBJECT_SCALE = 0.62; // the character's size compared to the round background

function PopLetter({ char, delay, color, size }) {
  const pop = useScaleIn(delay);
  return <Animated.Text style={[styles.wordLetter, { color, fontSize: size }, pop]}>{char}</Animated.Text>;
}

export default function ListenPicture({ item, example, size, popKey = 0, mood, moodKey, speaking, active, onPress }) {
  const { caseMode, word } = useLetterCase();
  const flip = useFlip(caseMode);
  const mark = highlightIndex(example, item.letter);

  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, CALM_SHADOW.lifted, { width: size, height: size, borderRadius: size / 2, backgroundColor: item.accent.pale }]}>
        <TalkingObject
          emoji={example.emoji}
          image={example.image}
          size={size * OBJECT_SCALE}
          mood={mood}
          moodKey={moodKey}
          speaking={speaking}
          active={active}
          onPress={onPress}
          hitSlop={size * (1 - OBJECT_SCALE) * 0.5}
        />
      </View>

      <Animated.View key={popKey} style={[styles.word, flip]}>
        {word(example.word)
          .split('')
          .map((char, i) => (
            <PopLetter
              key={i}
              char={char}
              size={Math.max(26, size * 0.16)}
              delay={popKey ? i * LETTER_POP_MS : 0}
              color={i === mark ? item.accent.deep : CALM.text}
            />
          ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    direction: 'ltr',
  },
  wordLetter: {
    fontFamily: FONTS.nunitoBlack,
  },
});
