// AAC WORDS - everything the AAC board shows: the word types (colours), the CORE board and the TOPIC pages.
//
// THE STANDARD WE FOLLOW (used by speech therapists all over the world):
//   * CORE board = the 36 "Universal Core" words of Project Core (UNC Chapel Hill, USA): small words a child
//     can use in almost any situation ("I want more", "stop", "help", "go"). They ALWAYS stay in the same
//     place, so the child learns where a word is (motor planning) - never sort or move them.
//   * Colours = the Modified Fitzgerald Key: every TYPE of word has its own colour (people yellow,
//     actions green, describing words blue, things orange, little position words pink, questions purple).
//     Here they are the soft KidBuddy pastels, so the board stays calm.
//   * Pictures = ARASAAC pictograms (assets/aac/*.png), the most used free AAC symbol set.
//     Credit: "Pictographic symbols: Sergio Palao. Origin: ARASAAC (arasaac.org). Licence: CC BY-NC-SA.
//     Owner: Government of Aragón (Spain)." (shown in Parent Settings -> Credits). Non-commercial use only.
//
// TO ADD A TOPIC WORD: put its picture in assets/aac/<word>.png (from arasaac.org), add it to SYMBOLS below,
// then add { word, type } to that topic's `words`. The `word` is also what is spoken (and translated:
// add its Urdu to modules/talk/i18n/ur.json).

import { PALETTE } from '../../../shared/theme/theme';

// ---------- the word types (Modified Fitzgerald Key, soft KidBuddy colours) ----------
//   fill = the button colour, edge = its border, name = shown to parents
export const WORD_TYPES = {
  people: { name: 'People', fill: PALETTE.pastelYellow, edge: PALETTE.sunny }, // I, you, mum ...
  action: { name: 'Actions', fill: PALETTE.pastelGreen, edge: PALETTE.green }, // want, go, help ...
  describe: { name: 'Describing', fill: PALETTE.pastelBlue, edge: PALETTE.blue }, // good, more, happy ...
  thing: { name: 'Things', fill: '#FDE3CC', edge: PALETTE.tangerine }, // water, ball, home ...
  little: { name: 'Little words', fill: PALETTE.pastelPink, edge: PALETTE.coral }, // in, on, up, finished
  how: { name: 'How words', fill: '#EFE3D3', edge: '#C9A27E' }, // not, here
  question: { name: 'Questions', fill: PALETTE.pastelLilac, edge: PALETTE.purpleLight }, // what, who ...
};

// ---------- the pictures (React Native needs one fixed require() per file) ----------
export const SYMBOLS = {
  i: require('../../../../assets/aac/i.png'),
  you: require('../../../../assets/aac/you.png'),
  he: require('../../../../assets/aac/he.png'),
  she: require('../../../../assets/aac/she.png'),
  it: require('../../../../assets/aac/it.png'),
  that: require('../../../../assets/aac/that.png'),
  want: require('../../../../assets/aac/want.png'),
  like: require('../../../../assets/aac/like.png'),
  get: require('../../../../assets/aac/get.png'),
  make: require('../../../../assets/aac/make.png'),
  go: require('../../../../assets/aac/go.png'),
  look: require('../../../../assets/aac/look.png'),
  turn: require('../../../../assets/aac/turn.png'),
  help: require('../../../../assets/aac/help.png'),
  open: require('../../../../assets/aac/open.png'),
  do: require('../../../../assets/aac/do.png'),
  put: require('../../../../assets/aac/put.png'),
  can: require('../../../../assets/aac/can.png'),
  stop: require('../../../../assets/aac/stop.png'),
  finished: require('../../../../assets/aac/finished.png'),
  up: require('../../../../assets/aac/up.png'),
  in: require('../../../../assets/aac/in.png'),
  on: require('../../../../assets/aac/on.png'),
  here: require('../../../../assets/aac/here.png'),
  good: require('../../../../assets/aac/good.png'),
  more: require('../../../../assets/aac/more.png'),
  different: require('../../../../assets/aac/different.png'),
  same: require('../../../../assets/aac/same.png'),
  all: require('../../../../assets/aac/all.png'),
  some: require('../../../../assets/aac/some.png'),
  not: require('../../../../assets/aac/not.png'),
  what: require('../../../../assets/aac/what.png'),
  who: require('../../../../assets/aac/who.png'),
  where: require('../../../../assets/aac/where.png'),
  when: require('../../../../assets/aac/when.png'),
  why: require('../../../../assets/aac/why.png'),
  water: require('../../../../assets/aac/water.png'),
  milk: require('../../../../assets/aac/milk.png'),
  juice: require('../../../../assets/aac/juice.png'),
  apple: require('../../../../assets/aac/apple.png'),
  banana: require('../../../../assets/aac/banana.png'),
  biscuit: require('../../../../assets/aac/biscuit.png'),
  ball: require('../../../../assets/aac/ball.png'),
  blocks: require('../../../../assets/aac/blocks.png'),
  bubbles: require('../../../../assets/aac/bubbles.png'),
  book: require('../../../../assets/aac/book.png'),
  swing: require('../../../../assets/aac/swing.png'),
  music: require('../../../../assets/aac/music.png'),
  happy: require('../../../../assets/aac/happy.png'),
  sad: require('../../../../assets/aac/sad.png'),
  angry: require('../../../../assets/aac/angry.png'),
  scared: require('../../../../assets/aac/scared.png'),
  tired: require('../../../../assets/aac/tired.png'),
  hurt: require('../../../../assets/aac/hurt.png'),
  mum: require('../../../../assets/aac/mum.png'),
  dad: require('../../../../assets/aac/dad.png'),
  teacher: require('../../../../assets/aac/teacher.png'),
  friend: require('../../../../assets/aac/friend.png'),
  brother: require('../../../../assets/aac/brother.png'),
  sister: require('../../../../assets/aac/sister.png'),
  home: require('../../../../assets/aac/home.png'),
  school: require('../../../../assets/aac/school.png'),
  park: require('../../../../assets/aac/park.png'),
  toilet: require('../../../../assets/aac/toilet.png'),
  bed: require('../../../../assets/aac/bed.png'),
  outside: require('../../../../assets/aac/outside.png'),
};

// One word = { word (what is shown + spoken; also the picture's name), type (a WORD_TYPES key) }.
const w = (word, type) => ({ word, type });

// ---------- the CORE board: 6 columns x 6 rows, ALWAYS in this place ----------
// Arranged in colour columns, left to right, like a sentence: who -> action -> little words -> describing -> questions.
export const CORE_COLUMNS = 6;
export const CORE = [
  // row 1
  w('I', 'people'), w('want', 'action'), w('turn', 'action'), w('stop', 'action'), w('good', 'describe'), w('not', 'how'),
  // row 2
  w('you', 'people'), w('like', 'action'), w('help', 'action'), w('finished', 'little'), w('more', 'describe'), w('what', 'question'),
  // row 3
  w('he', 'people'), w('get', 'action'), w('open', 'action'), w('up', 'little'), w('different', 'describe'), w('who', 'question'),
  // row 4
  w('she', 'people'), w('make', 'action'), w('do', 'action'), w('in', 'little'), w('same', 'describe'), w('where', 'question'),
  // row 5
  w('it', 'people'), w('go', 'action'), w('put', 'action'), w('on', 'little'), w('all', 'describe'), w('when', 'question'),
  // row 6
  w('that', 'people'), w('look', 'action'), w('can', 'action'), w('here', 'how'), w('some', 'describe'), w('why', 'question'),
];

// ---------- the TOPIC pages (fringe words), 6 each ----------
// icon = the flat AppIcon on its tab, accent = a WORD_TYPES key for the tab colour
export const TOPICS = [
  {
    id: 'food',
    title: 'Food',
    icon: 'food-apple',
    accent: 'thing',
    words: [w('water', 'thing'), w('milk', 'thing'), w('juice', 'thing'), w('apple', 'thing'), w('banana', 'thing'), w('biscuit', 'thing')],
  },
  {
    id: 'play',
    title: 'Play',
    icon: 'basketball',
    accent: 'thing',
    words: [w('ball', 'thing'), w('blocks', 'thing'), w('bubbles', 'thing'), w('book', 'thing'), w('swing', 'thing'), w('music', 'thing')],
  },
  {
    id: 'feelings',
    title: 'Feelings',
    icon: 'emoticon-happy-outline',
    accent: 'describe',
    words: [w('happy', 'describe'), w('sad', 'describe'), w('angry', 'describe'), w('scared', 'describe'), w('tired', 'describe'), w('hurt', 'describe')],
  },
  {
    id: 'people',
    title: 'People',
    icon: 'account-group',
    accent: 'people',
    words: [w('mum', 'people'), w('dad', 'people'), w('teacher', 'people'), w('friend', 'people'), w('brother', 'people'), w('sister', 'people')],
  },
  {
    id: 'places',
    title: 'Places',
    icon: 'map-marker',
    accent: 'thing',
    words: [w('home', 'thing'), w('school', 'thing'), w('park', 'thing'), w('toilet', 'thing'), w('bed', 'thing'), w('outside', 'thing')],
  },
];

export const TOPIC_COLUMNS = 3; // topic pages: 3 columns x 2 rows of big buttons

// The picture of a word ('I' -> SYMBOLS.i).
export function symbolFor(word) {
  return SYMBOLS[String(word).toLowerCase()] || null;
}
