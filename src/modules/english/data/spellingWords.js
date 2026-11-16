// SPELLING WORDS - the words of the spelling game (English > Words > Spelling).
//   id      a short name used in navigation ({ wordId: 'cake' })
//   word    the letters exactly as they are shown: small letters, or a capital first letter for a name
//           (ALL_CAPS in spellingConfig.js switches every word to capitals)
//   sayAs   how the voice reads the whole word (tune this when the voice says it oddly)
//   image   the word's picture from letterImages.js (null = no picture: the child's buddy is shown instead)
//   ready   true = shown in the word list (set false to hide a word that is not finished yet)
//   sentence  the second part of the game (leave it out for a word without a sentence):
//             text  = the sentence, ending with a full stop
//             drag  = the words the child has to drag into the sentence (the others are already written)
//             sayAs = only when the voice should read it differently from `text` (a name)
// TO ADD A WORD: add one line below (+ its picture in letterImages.js). The letter pictures come from
// letterImages.js and the letter sounds from alphabetData.js.

import { getLetter } from './alphabetData';
import { WORD_ART } from './letterImages';

const ALL_WORDS = [
  { id: 'umbrella', word: 'umbrella', sayAs: 'Umbrella', image: WORD_ART.umbrella, ready: true,
    sentence: { text: 'I see an umbrella.', drag: ['see', 'umbrella'] } },
  { id: 'cake', word: 'cake', sayAs: 'Cake', image: WORD_ART.cake, ready: true,
    sentence: { text: 'I like the cake.', drag: ['like', 'cake'] } },
  // A name: check how the phone's voice says it and change sayAs if needed. No picture (the buddy pops out).
  { id: 'faiqa', word: 'Faiqa', sayAs: 'Faa-eeqa', image: null, ready: true,
    sentence: { text: 'Faiqa is my friend.', drag: ['Faiqa', 'friend'], sayAs: 'Faa-eeqa is my friend.' } },
];

export const SPELLING_WORDS = ALL_WORDS.filter((item) => item.ready);

export function getSpellingWord(id) {
  return SPELLING_WORDS.find((item) => item.id === id) || SPELLING_WORDS[0];
}

export function nextSpellingWord(id) {
  const index = SPELLING_WORDS.findIndex((item) => item.id === id);
  return SPELLING_WORDS[(index + 1) % SPELLING_WORDS.length];
}

// One entry per letter of the word. `char` = the letter as shown ('c' or 'C'), `slot` = its place in the word.
export function lettersOf(word, allCaps) {
  const shown = allCaps ? word.toUpperCase() : word;
  return shown.split('').map((char, slot) => {
    const info = getLetter(char.toUpperCase());
    return { id: `${char}${slot}`, char, slot, nameSpeech: info.nameSpeech, soundSpeech: info.soundSpeech };
  });
}
