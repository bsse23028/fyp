// SPELLING HELPERS - the alphabet entry (name for the voice) of any letter, capital or small.

import { ALPHABET } from '../../data/alphabetData';

export function getAlphabetItem(char) {
  if (!char) return null;
  return ALPHABET.find((item) => item.letter === char.toUpperCase()) || null;
}
