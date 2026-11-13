// ALPHABET DATA - the 26 letters of the Alphabets section.
//   letter / lower   'A' / 'a'
//   nameSpeech       how the voice says the letter NAME ("ay")
//   soundSpeech      how the voice says the letter SOUND ("ah"). Text-to-speech can only approximate
//                    phonics; `audio: null` is kept so recorded sounds can replace it later.
//   examples         the 2 clearest TODDLER words: ONE familiar object each, as an emoji for now
//                    (`image: null` is the slot for a real illustration). Every emoji is Unicode 12 or
//                    older so it shows on older Android phones. `endsWith: true` = the letter is not at the
//                    start of the word (only X), so "starts with" questions must skip it.
//   WEAK pictures (no clear toddler object exists as an emoji): I (island), N (nut), Q (question mark),
//   U (up arrow), X (words END with x), Y (yarn), Z (zero). Replace these first with real art.

import { CALM_ACCENTS } from '../../../shared/theme/theme';

const word = (text, emoji, extra = {}) => ({ word: text, emoji, image: null, ...extra });

const LETTERS = [
  { letter: 'A', nameSpeech: 'ay', soundSpeech: 'ah', examples: [word('Apple', '🍎'), word('Ant', '🐜')] },
  { letter: 'B', nameSpeech: 'bee', soundSpeech: 'buh', examples: [word('Ball', '⚽'), word('Banana', '🍌')] },
  { letter: 'C', nameSpeech: 'see', soundSpeech: 'kuh', examples: [word('Cat', '🐱'), word('Car', '🚗')] },
  { letter: 'D', nameSpeech: 'dee', soundSpeech: 'duh', examples: [word('Dog', '🐶'), word('Duck', '🦆')] },
  { letter: 'E', nameSpeech: 'ee', soundSpeech: 'eh', examples: [word('Egg', '🥚'), word('Elephant', '🐘')] },
  { letter: 'F', nameSpeech: 'ef', soundSpeech: 'fff', examples: [word('Fish', '🐟'), word('Frog', '🐸')] },
  { letter: 'G', nameSpeech: 'jee', soundSpeech: 'guh', examples: [word('Grapes', '🍇'), word('Goat', '🐐')] },
  { letter: 'H', nameSpeech: 'aitch', soundSpeech: 'hah', examples: [word('Hat', '🎩'), word('House', '🏠')] },
  // WEAK: short "i" objects (igloo, insect) have no clear emoji, so I uses the long "eye" sound.
  { letter: 'I', nameSpeech: 'eye', soundSpeech: 'eye', examples: [word('Ice cream', '🍦'), word('Island', '🏝️')] },
  // Juice box and kite are Unicode 12 (Android 10+), the newest allowed.
  { letter: 'J', nameSpeech: 'jay', soundSpeech: 'juh', examples: [word('Juice', '🧃'), word('Jeans', '👖')] },
  { letter: 'K', nameSpeech: 'kay', soundSpeech: 'kuh', examples: [word('Kite', '🪁'), word('Key', '🔑')] },
  { letter: 'L', nameSpeech: 'el', soundSpeech: 'lll', examples: [word('Lion', '🦁'), word('Lemon', '🍋')] },
  { letter: 'M', nameSpeech: 'em', soundSpeech: 'mmm', examples: [word('Moon', '🌙'), word('Monkey', '🐵')] },
  // WEAK: no nest emoji on older phones, so N uses nut (peanut).
  { letter: 'N', nameSpeech: 'en', soundSpeech: 'nnn', examples: [word('Nose', '👃'), word('Nut', '🥜')] },
  { letter: 'O', nameSpeech: 'oh', soundSpeech: 'aw', examples: [word('Orange', '🍊'), word('Octopus', '🐙')] },
  { letter: 'P', nameSpeech: 'pee', soundSpeech: 'puh', examples: [word('Pig', '🐷'), word('Penguin', '🐧')] },
  // WEAK: no quilt emoji; queen and a question mark are the clearest Q pictures.
  { letter: 'Q', nameSpeech: 'cue', soundSpeech: 'kwuh', examples: [word('Queen', '👸'), word('Question', '❓')] },
  { letter: 'R', nameSpeech: 'ar', soundSpeech: 'rrr', examples: [word('Rabbit', '🐰'), word('Rainbow', '🌈')] },
  { letter: 'S', nameSpeech: 'ess', soundSpeech: 'sss', examples: [word('Sun', '☀️'), word('Snake', '🐍')] },
  { letter: 'T', nameSpeech: 'tee', soundSpeech: 'tuh', examples: [word('Tiger', '🐯'), word('Tree', '🌳')] },
  // WEAK: "Up" (an arrow) is the clearest second short-u picture.
  { letter: 'U', nameSpeech: 'you', soundSpeech: 'uh', examples: [word('Umbrella', '☂️'), word('Up', '⬆️')] },
  { letter: 'V', nameSpeech: 'vee', soundSpeech: 'vvv', examples: [word('Van', '🚐'), word('Violin', '🎻')] },
  { letter: 'W', nameSpeech: 'double you', soundSpeech: 'wuh', examples: [word('Watch', '⌚'), word('Whale', '🐳')] },
  // WEAK: almost no toddler words START with X (no xylophone emoji), so X uses words that END with x.
  {
    letter: 'X',
    nameSpeech: 'ex',
    soundSpeech: 'ks',
    examples: [word('Box', '📦', { endsWith: true }), word('Fox', '🦊', { endsWith: true })],
  },
  // Yo-yo is Unicode 12 (Android 10+). WEAK: there is no yak emoji, so yarn is the second picture.
  { letter: 'Y', nameSpeech: 'why', soundSpeech: 'yuh', examples: [word('Yo-yo', '🪀'), word('Yarn', '🧶')] },
  // WEAK: zebra is clear, but "zero" (a number) is the only second Z picture.
  { letter: 'Z', nameSpeech: 'zee', soundSpeech: 'zzz', examples: [word('Zebra', '🦓'), word('Zero', '0️⃣')] },
];

export const ALPHABET = LETTERS.map((item, index) => ({
  ...item,
  lower: item.letter.toLowerCase(),
  audio: null,
  accent: CALM_ACCENTS[index % CALM_ACCENTS.length],
}));

export function getLetter(letter) {
  return ALPHABET.find((item) => item.letter === letter) || ALPHABET[0];
}

export function nextLetter(letter) {
  const index = ALPHABET.findIndex((item) => item.letter === letter);
  return index >= 0 && index < ALPHABET.length - 1 ? ALPHABET[index + 1] : null;
}

// Where the letter sits inside an example word (first letter, or the x in "box").
export function highlightIndex(example, letter) {
  const index = example.word.toLowerCase().indexOf(letter.toLowerCase());
  return index < 0 ? 0 : index;
}

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// `count` other letters for distractors. Pictures must never start with the target letter
// (e.g. X's "Box" would be a second right answer for B), so letters whose words do are skipped.
export function otherLetters(letter, count) {
  const safe = ALPHABET.filter(
    (item) => item.letter !== letter && !item.examples.some((ex) => ex.word[0].toUpperCase() === letter)
  );
  return shuffle(safe).slice(0, count);
}

// Capital letters that look alike (question "Which one is A?").
export const LOOKALIKES = {
  A: ['H', 'V'], B: ['P', 'R'], C: ['G', 'O'], D: ['O', 'P'], E: ['F', 'B'], F: ['E', 'P'],
  G: ['C', 'O'], H: ['N', 'A'], I: ['L', 'T'], J: ['L', 'U'], K: ['X', 'R'], L: ['I', 'J'],
  M: ['N', 'W'], N: ['M', 'H'], O: ['Q', 'C'], P: ['R', 'B'], Q: ['O', 'G'], R: ['P', 'B'],
  S: ['Z', 'C'], T: ['I', 'L'], U: ['V', 'J'], V: ['U', 'Y'], W: ['M', 'V'], X: ['K', 'Y'],
  Y: ['V', 'X'], Z: ['S', 'N'],
};

// Letter names that sound almost the same: never offered together when the child only hears the letter.
const SOUND_GROUPS = ['BCDEGPTVZ', 'AJK', 'FSX', 'MN', 'IY', 'QU'];

export function soundAlikes(letter) {
  const group = SOUND_GROUPS.find((g) => g.includes(letter));
  return group ? group.split('') : [];
}

// `count` random letters (items) that are not the target and not in `avoid` (a list of capitals).
export function pickLetters(letter, count, avoid = []) {
  const blocked = new Set([letter, ...avoid.map((c) => c.toUpperCase())]);
  return shuffle(ALPHABET.filter((item) => !blocked.has(item.letter))).slice(0, count);
}
