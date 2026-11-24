// TALK MODULE - the AAC board (Augmentative and Alternative Communication): the child taps pictures to
// say what they want. This is the one file that tells the app what this module contains.
// (Read src/modules/index.js to see how modules are plugged in.)
//
// Inside this folder:
//   screens/     AACBoardScreen (sentence strip + Core / topic tabs + the picture board)
//   components/  SentenceStrip, QuickWords, WordButton, FolderTile
//   data/        aacWords.js - 48 core words (Universal Core 36 + toddler words, fixed places), 6 quick words,
//                13 topic folders x 12 words, the word-type
//                colours (Modified Fitzgerald Key) and the ARASAAC pictures (assets/aac/*.png)
//   i18n/        ur.json - the Urdu words of the board
//   aacConfig.js every number of the board
//
// THE PUBLIC DOOR: the rest of the app only uses what this file exports below. Child Home's "Talk" tile
// opens `entry`. Nothing is saved yet (a parent "AAC symbol editor" is planned for the Plan tab).
//
// Pictures: ARASAAC (arasaac.org), by Sergio Palao, licence CC BY-NC-SA, owner Government of Aragón.

import ur from './i18n/ur.json';
import AACBoardScreen from './screens/AACBoardScreen';

export default {
  name: 'talk',
  entry: 'AACBoard', // the ONE screen Child Home opens for this module
  translations: ur,
  // one sentence for parents, shown only in the Preview strip while exploring KidBuddy
  previewGuide: {
    AACBoard: 'Your child taps pictures to speak. Core words never move, so they learn where each word is.',
  },
  screens: [{ name: 'AACBoard', component: AACBoardScreen, options: { animation: 'fade' } }],
};
