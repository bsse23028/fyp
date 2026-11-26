// WORD ART - a whole word drawn with the letter pictures, all at one scale and standing on one line.
// The view is exactly as big as the word's shape (see measureWord in wordLayout.js).
//   <WordArt text="cake" scale={0.2} />
//   <WordArt text="cake" scale={0.2} tint="#B8AA9A" />   a one-colour silhouette (placeholders, glows)

import React from 'react';
import { View } from 'react-native';
import LetterArt from './LetterArt';
import { LETTER_ART } from '../../data/letterImages';
import { measureWord } from './wordLayout';

export default function WordArt({ text, scale, tint, style }) {
  const word = measureWord(text);
  return (
    <View style={[{ width: word.width * scale, height: (word.bottom - word.top) * scale }, style]}>
      {word.letters.map(({ char, x }, i) => (
        <LetterArt
          key={i}
          char={char}
          scale={scale}
          tint={tint}
          style={{ position: 'absolute', left: x * scale, top: (LETTER_ART[char].y - word.top) * scale }}
        />
      ))}
    </View>
  );
}
