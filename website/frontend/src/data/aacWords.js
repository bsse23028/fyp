// AAC WORDS - (ported from the mobile app: src/modules/talk/data/aacWords.js) everything the AAC board shows: the word types (colours), the QUICK words, the CORE board
// (full + big-button pages) and the TOPIC folders.
//
// THE DESIGN WE FOLLOW (what speech therapists use worldwide, e.g. TD Snap Core First, Proloquo2Go,
// TouchChat WordPower):
//   * a CORE board that always looks the same: the 36 "Universal Core" words of Project Core (UNC Chapel Hill)
//     + the extra words young children use most (me, my, out, off, eat, drink, play, sleep, come, big,
//     little, again). Words NEVER move (motor planning), so the child learns where each word is.
//   * QUICK words always on screen (yes, no, please, thank you, wait, toilet).
//   * TOPIC folders for the "fringe" words (things, people, places ...), 12 pictures each.
//   * Colours = the Modified Fitzgerald Key (people yellow, actions green, describing blue, things orange,
//     little/social words pink, questions purple), in soft KidBuddy pastels.
//   * Pictures = ARASAAC pictograms (data/aacSymbols.js, public/media/aac). Credit in Parent Settings -> Credits.
//
// A word = { word (shown + spoken, translated: Urdu in i18n/ur.json), type (a WORD_TYPES key), pic (picture
// name in aacSymbols.js; leave it out when it is the word itself in small letters, spaces as _ ) }.
// TO ADD A TOPIC WORD: put its picture in public/media/aac/<pic>.png, add it to aacSymbols.js, then add it below.

// The soft colours of the word types (the same values as the app's KidBuddy palette).
const PALETTE = {
  pastelYellow: '#FBEBA5',
  sunny: '#F7C744',
  pastelGreen: '#CDEBB8',
  green: '#A9DB8E',
  pastelBlue: '#CFE3F7',
  blue: '#8EC1EC',
  tangerine: '#F08A4B',
  pastelPink: '#F9D3D0',
  coral: '#FF7F7F',
  pastelLilac: '#DDD0F5',
  purpleLight: '#A866E0',
  cloudWhite: '#FFFFFF',
};
import { SYMBOLS } from './aacSymbols';

// ---------- the word types (Modified Fitzgerald Key, soft KidBuddy colours) ----------
//   fill = the button colour, edge = its border
export const WORD_TYPES = {
  people: { name: 'People', fill: PALETTE.pastelYellow, edge: PALETTE.sunny },
  action: { name: 'Actions', fill: PALETTE.pastelGreen, edge: PALETTE.green },
  describe: { name: 'Describing', fill: PALETTE.pastelBlue, edge: PALETTE.blue },
  thing: { name: 'Things', fill: '#FDE3CC', edge: PALETTE.tangerine },
  little: { name: 'Little words', fill: PALETTE.pastelPink, edge: PALETTE.coral },
  how: { name: 'How words', fill: '#EFE3D3', edge: '#C9A27E' },
  question: { name: 'Questions', fill: PALETTE.pastelLilac, edge: PALETTE.purpleLight },
  social: { name: 'Quick words', fill: PALETTE.cloudWhite, edge: PALETTE.coral },
};

const w = (word, type, pic) => ({ word, type, pic });

// ---------- QUICK words: always on screen, above the board ----------
export const QUICK = [
  w('yes', 'social'), w('no', 'social'), w('please', 'social'),
  w('thank you', 'social'), w('wait', 'social'), w('toilet', 'social'),
];

// ---------- the CORE board: 6 columns x 8 rows, ALWAYS in this place ----------
// Colour columns left to right, like a sentence: who -> actions -> little words -> describing -> how + questions.
export const CORE_COLUMNS = 6;
const COLUMNS = [
  [w('I', 'people', 'i'), w('you', 'people'), w('he', 'people'), w('she', 'people'), w('it', 'people'), w('that', 'people'), w('me', 'people'), w('my', 'people')],
  [w('want', 'action'), w('like', 'action'), w('get', 'action'), w('make', 'action'), w('go', 'action'), w('look', 'action'), w('eat', 'action'), w('drink', 'action')],
  [w('turn', 'action'), w('help', 'action'), w('open', 'action'), w('do', 'action'), w('put', 'action'), w('can', 'action'), w('play', 'action'), w('sleep', 'action')],
  [w('stop', 'action'), w('come', 'action'), w('finished', 'little'), w('up', 'little'), w('in', 'little'), w('on', 'little'), w('out', 'little'), w('off', 'little')],
  [w('good', 'describe'), w('more', 'describe'), w('different', 'describe'), w('same', 'describe'), w('all', 'describe'), w('some', 'describe'), w('big', 'describe'), w('little', 'describe')],
  [w('not', 'how'), w('here', 'how'), w('again', 'how'), w('what', 'question'), w('who', 'question'), w('where', 'question'), w('when', 'question'), w('why', 'question')],
];
// row by row, for the full 6 x 8 grid
export const CORE = [];
for (let row = 0; row < 8; row++) COLUMNS.forEach((column) => CORE.push(column[row]));

// The SAME core words as BIG buttons: 3 pages of 4 x 4 (two colour columns per page, in the same order),
// so a word is always on the same page and in the same place there too.
export const BIG_COLUMNS = 4;
export const CORE_BIG_PAGES = [0, 2, 4].map((first) => {
  const a = COLUMNS[first];
  const b = COLUMNS[first + 1];
  const page = [];
  for (let row = 0; row < 4; row++) page.push(a[row], a[row + 4], b[row], b[row + 4]);
  return page;
});

// ---------- TOPIC folders (fringe words), 12 each ----------
// icon = the picture on the folder, accent = a WORD_TYPES key for the folder colour
const T = 'thing';
export const TOPICS = [
  {
    id: 'food', title: 'Food & drinks', icon: 'apple', accent: T,
    words: [w('water', T), w('milk', T), w('juice', T), w('apple', T), w('banana', T), w('orange', T),
      w('biscuit', T), w('bread', T), w('rice', T), w('egg', T), w('ice cream', T), w('chocolate', T)],
  },
  {
    id: 'play', title: 'Play', icon: 'ball', accent: T,
    words: [w('ball', T), w('blocks', T), w('bubbles', T), w('book', T), w('swing', T), w('slide', T),
      w('doll', T), w('car', T), w('puzzle', T), w('crayons', T), w('music', T), w('television', T)],
  },
  {
    id: 'feelings', title: 'Feelings', icon: 'happy', accent: 'describe',
    words: [w('happy', 'describe'), w('sad', 'describe'), w('angry', 'describe'), w('scared', 'describe'),
      w('tired', 'describe'), w('hurt', 'describe'), w('sick', 'describe'), w('hungry', 'describe'),
      w('thirsty', 'describe'), w('excited', 'describe'), w('calm', 'describe'), w('love', 'describe')],
  },
  {
    id: 'people', title: 'People', icon: 'mum', accent: 'people',
    words: [w('mum', 'people'), w('dad', 'people'), w('brother', 'people'), w('sister', 'people'),
      w('baby', 'people'), w('grandmother', 'people'), w('grandfather', 'people'), w('friend', 'people'),
      w('teacher', 'people'), w('doctor', 'people'), w('boy', 'people'), w('girl', 'people')],
  },
  {
    id: 'places', title: 'Places', icon: 'home', accent: T,
    words: [w('home', T), w('school', T), w('park', T), w('toilet', T), w('kitchen', T), w('bedroom', T),
      w('outside', T), w('shop', T), w('hospital', T), w('mosque', T), w('garden', T), w('beach', T)],
  },
  {
    id: 'body', title: 'My body', icon: 'hand', accent: T,
    words: [w('head', T), w('eyes', T), w('ears', T), w('nose', T), w('mouth', T), w('teeth', T),
      w('hand', T), w('tummy', T), w('leg', T), w('foot', T), w('hair', T), w('back', T)],
  },
  {
    id: 'clothes', title: 'Clothes', icon: 'shirt', accent: T,
    words: [w('shirt', T), w('trousers', T), w('dress', T), w('shoes', T), w('socks', T), w('hat', T),
      w('jacket', T), w('pyjamas', T), w('gloves', T), w('scarf', T)],
  },
  {
    id: 'animals', title: 'Animals', icon: 'dog', accent: T,
    words: [w('dog', T), w('cat', T), w('bird', T), w('fish', T), w('cow', T), w('horse', T),
      w('duck', T), w('rabbit', T), w('lion', T), w('elephant', T), w('sheep', T), w('monkey', T)],
  },
  {
    id: 'colours', title: 'Colours', icon: 'red', accent: 'describe',
    words: [w('red', 'describe'), w('blue', 'describe'), w('green', 'describe'), w('yellow', 'describe'),
      w('orange', 'describe', 'orange_colour'), w('pink', 'describe'), w('purple', 'describe'),
      w('black', 'describe'), w('white', 'describe'), w('brown', 'describe')],
  },
  {
    id: 'routine', title: 'My day', icon: 'brush_teeth', accent: 'action',
    words: [w('wake up', 'action'), w('wash hands', 'action'), w('brush teeth', 'action'), w('bath', 'action'),
      w('get dressed', 'action'), w('comb hair', 'action'), w('breakfast', T), w('lunch', T), w('dinner', T),
      w('nap', 'action'), w('go to bed', 'action'), w('medicine', T)],
  },
  {
    id: 'school', title: 'School', icon: 'pencil', accent: T,
    words: [w('pencil', T), w('paper', T), w('scissors', T), w('glue', T), w('school bag', T), w('computer', T),
      w('draw', 'action'), w('read', 'action'), w('write', 'action'), w('sing', 'action'), w('line up', 'action'),
      w('sit down', 'action')],
  },
  {
    id: 'weather', title: 'Weather', icon: 'sunny', accent: 'describe',
    words: [w('sunny', 'describe'), w('rainy', 'describe'), w('cloudy', 'describe'), w('windy', 'describe'),
      w('hot', 'describe'), w('cold', 'describe'), w('snow', T), w('rainbow', T)],
  },
  {
    id: 'actions', title: 'Moving', icon: 'run', accent: 'action',
    words: [w('run', 'action'), w('jump', 'action'), w('walk', 'action'), w('sit', 'action'), w('stand', 'action'),
      w('dance', 'action'), w('clap', 'action'), w('hug', 'action'), w('throw', 'action'), w('catch', 'action'),
      w('push', 'action'), w('pull', 'action')],
  },
];

export const TOPIC_COLUMNS = 3; // words inside a folder: 3 columns of big buttons
export const FOLDER_COLUMNS = 3; // the folder tiles

// The picture of a word: its `pic`, else the word in small letters with spaces as "_".
export function symbolFor(item) {
  const key = item.pic || String(item.word).toLowerCase().replace(/ /g, '_');
  return SYMBOLS[key] || null;
}
export function pictureNamed(name) {
  return SYMBOLS[name] || null;
}
