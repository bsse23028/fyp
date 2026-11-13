// LETTER CASE - how the lesson draws letters: capital ("A") or small ("a").
//   <LetterCaseProvider value="lower">...</LetterCaseProvider>   (LetterLessonScreen)
//   const { caseMode, show, other } = useLetterCase();
//   show(item)  -> the letter in the chosen case      other(item) -> the letter in the other case
//   <LessonLetter item={item} style={...} />  draws it and does a quick flip when the case changes.
// Only drawing changes: the voice always says the same letter name.

import React, { createContext, useContext } from 'react';
import { Animated } from 'react-native';
import { useFlip } from '../../../../shared/utils/motion';

const LetterCaseContext = createContext('upper');

export const LetterCaseProvider = LetterCaseContext.Provider;

export function useLetterCase() {
  const caseMode = useContext(LetterCaseContext);
  const lower = caseMode === 'lower';
  return {
    caseMode,
    show: (item) => (lower ? item.lower : item.letter),
    other: (item) => (lower ? item.letter : item.lower),
    word: (text) => (lower ? text.toLowerCase() : text),
  };
}

// `opposite` draws the other case (e.g. the small-letter targets of "Big and small").
export function LessonLetter({ item, opposite = false, style }) {
  const { caseMode, show, other } = useLetterCase();
  const flip = useFlip(caseMode);
  return <Animated.Text style={[style, flip]}>{opposite ? other(item) : show(item)}</Animated.Text>;
}
