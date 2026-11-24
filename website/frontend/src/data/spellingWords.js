// SPELLING WORDS - the words of the spelling game (English > Words > Spelling), the same list as the
// app's data/spellingWords.js. `image` = the word's picture in public/media/words (null = the
// child's buddy is shown instead). `sentence.drag` = the words the child drags into the sentence.

const ALL_WORDS = [
  { id: 'umbrella', word: 'umbrella', sayAs: 'Umbrella', image: '/media/words/umbrella.png', emoji: '☂️', sentence: { text: 'I see an umbrella.', drag: ['see', 'umbrella'] } },
  { id: 'cake', word: 'cake', sayAs: 'Cake', image: '/media/words/cake.png', emoji: '🎂', sentence: { text: 'I like the cake.', drag: ['like', 'cake'] } },
  { id: 'cat', word: 'cat', sayAs: 'Cat', image: null, emoji: '🐱', sentence: { text: 'The cat is soft.', drag: ['cat', 'soft'] } },
  { id: 'dog', word: 'dog', sayAs: 'Dog', image: null, emoji: '🐶', sentence: { text: 'I love my dog.', drag: ['love', 'dog'] } },
  { id: 'sun', word: 'sun', sayAs: 'Sun', image: null, emoji: '☀️', sentence: { text: 'The sun is hot.', drag: ['sun', 'hot'] } },
  { id: 'ball', word: 'ball', sayAs: 'Ball', image: null, emoji: '⚽', sentence: { text: 'I kick the ball.', drag: ['kick', 'ball'] } },
  { id: 'fish', word: 'fish', sayAs: 'Fish', image: null, emoji: '🐟', sentence: { text: 'A fish can swim.', drag: ['fish', 'swim'] } },
  { id: 'apple', word: 'apple', sayAs: 'Apple', image: null, emoji: '🍎', sentence: { text: 'I eat an apple.', drag: ['eat', 'apple'] } },
  { id: 'hat', word: 'hat', sayAs: 'Hat', image: null, emoji: '🎩', sentence: { text: 'I have a hat.', drag: ['have', 'hat'] } },
  { id: 'bus', word: 'bus', sayAs: 'Bus', image: null, emoji: '🚌', sentence: { text: 'The bus is big.', drag: ['bus', 'big'] } },
  { id: 'milk', word: 'milk', sayAs: 'Milk', image: null, emoji: '🥛', sentence: { text: 'I drink my milk.', drag: ['drink', 'milk'] } },
  { id: 'tree', word: 'tree', sayAs: 'Tree', image: null, emoji: '🌳', sentence: { text: 'The tree is tall.', drag: ['tree', 'tall'] } },
];

export const SPELLING_WORDS = ALL_WORDS;

export function getSpellingWord(id) {
  return SPELLING_WORDS.find((item) => item.id === id) || SPELLING_WORDS[0];
}

export function nextSpellingWord(id) {
  const index = SPELLING_WORDS.findIndex((item) => item.id === id);
  return SPELLING_WORDS[(index + 1) % SPELLING_WORDS.length];
}

// The letter picture (the user's art in public/media/letters). Capitals live in upper/, small in lower/.
export function letterArt(char) {
  if (!/^[A-Za-z]$/.test(char)) return null;
  return char === char.toUpperCase() ? `/media/letters/upper/${char}.png` : `/media/letters/lower/${char}.png`;
}
