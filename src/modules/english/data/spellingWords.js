// SPELLING WORDS - the words of the spelling game (English > Words > Spelling).
//   id      a short name used in navigation ({ wordId: 'cake' })
//   word    the letters exactly as they are shown: small letters, or a capital first letter for a name
//           (ALL_CAPS in spellingConfig.js switches every word to capitals)
//   sayAs   how the voice reads the whole word (tune this when the voice says it oddly)
//   image   the word's picture: WORD_ART.<id> from letterImages.js. A word that has no picture there yet
//           shows the child's buddy instead, so a new word works before its picture is drawn.
//   ready   true = shown in the word list (set false to hide a word that is not finished yet)
//   sentence  the second part of the game (leave it out for a word without a sentence):
//             text  = the sentence, ending with a full stop
//             drag  = the words the child has to drag into the sentence (the others are already written)
//             sayAs = only when the voice should read it differently from `text` (a name)
// TO ADD A WORD: add one block below (+ its picture: put assets/words/<id>.png and add it to WORD_ART in
// letterImages.js). The letter pictures come from
// letterImages.js and the letter sounds from alphabetData.js.

import { getLetter } from './alphabetData';
import { WORD_ART } from './letterImages';

const ALL_WORDS = [
  {
    id: 'umbrella', word: 'umbrella', sayAs: 'Umbrella', image: WORD_ART.umbrella || null, ready: true,
    sentence: { text: 'I see an umbrella.', drag: ['see', 'umbrella'] },
  },
  {
    id: 'cake', word: 'cake', sayAs: 'Cake', image: WORD_ART.cake || null, ready: true,
    sentence: { text: 'I like the cake.', drag: ['like', 'cake'] },
  },
  {
    id: 'cat', word: 'cat', sayAs: 'Cat', image: WORD_ART.cat || null, ready: true,
    sentence: { text: 'The cat is soft.', drag: ['cat', 'soft'] },
  },
  {
    id: 'dog', word: 'dog', sayAs: 'Dog', image: WORD_ART.dog || null, ready: true,
    sentence: { text: 'I love my dog.', drag: ['love', 'dog'] },
  },
  {
    id: 'sun', word: 'sun', sayAs: 'Sun', image: WORD_ART.sun || null, ready: true,
    sentence: { text: 'The sun is hot.', drag: ['sun', 'hot'] },
  },
  {
    id: 'ball', word: 'ball', sayAs: 'Ball', image: WORD_ART.ball || null, ready: true,
    sentence: { text: 'I kick the ball.', drag: ['kick', 'ball'] },
  },
  {
    id: 'fish', word: 'fish', sayAs: 'Fish', image: WORD_ART.fish || null, ready: true,
    sentence: { text: 'A fish can swim.', drag: ['fish', 'swim'] },
  },
  {
    id: 'apple', word: 'apple', sayAs: 'Apple', image: WORD_ART.apple || null, ready: true,
    sentence: { text: 'I eat an apple.', drag: ['eat', 'apple'] },
  },
  {
    id: 'hat', word: 'hat', sayAs: 'Hat', image: WORD_ART.hat || null, ready: true,
    sentence: { text: 'I have a hat.', drag: ['have', 'hat'] },
  },
  {
    id: 'bus', word: 'bus', sayAs: 'Bus', image: WORD_ART.bus || null, ready: true,
    sentence: { text: 'The bus is big.', drag: ['bus', 'big'] },
  },
  {
    id: 'milk', word: 'milk', sayAs: 'Milk', image: WORD_ART.milk || null, ready: true,
    sentence: { text: 'I drink my milk.', drag: ['drink', 'milk'] },
  },
  {
    id: 'tree', word: 'tree', sayAs: 'Tree', image: WORD_ART.tree || null, ready: true,
    sentence: { text: 'The tree is tall.', drag: ['tree', 'tall'] },
  },
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
