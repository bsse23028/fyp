// SPELLING PICTURE - shows the picture of a spelling word (`image` in spellingWords.js).
// A word without a picture shows `fallback` instead (the child's buddy).

import React from 'react';
import { Image, View } from 'react-native';

export default function SpellingPicture({ item, size, fallback }) {
  const source = item.image || fallback;
  if (!source) return <View style={{ width: size, height: size }} />;
  return <Image source={source} fadeDuration={0} style={{ width: size, height: size }} resizeMode="contain" />;
}
