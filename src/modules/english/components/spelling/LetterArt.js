// LETTER ART - shows one letter picture (assets/letters) at the given scale.
// The view is exactly as big as the letter's own shape; the 512 x 512 picture is shifted inside it,
// so nothing is cropped or resized on its own (every letter uses the same `scale`).
//   <LetterArt char="c" scale={0.4} />
//   <LetterArt char="c" scale={0.4} tint="#B8AA9A" />   a one-colour silhouette (placeholders, glows)

import React from 'react';
import { Image, View } from 'react-native';
import { LETTER_ART, LETTER_CANVAS } from '../../data/letterImages';

export default function LetterArt({ char, scale, tint, style }) {
  const art = LETTER_ART[char];
  if (!art) return null;
  const side = LETTER_CANVAS * scale;

  return (
    <View style={[{ width: art.width * scale, height: art.height * scale }, style]}>
      <Image
        source={art.image}
        fadeDuration={0}
        style={{ position: 'absolute', left: -art.x * scale, top: -art.y * scale, width: side, height: side, tintColor: tint }}
      />
    </View>
  );
}
