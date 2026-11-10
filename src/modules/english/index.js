// ENGLISH MODULE - the one file that tells the app what this module contains.
// (Read src/modules/index.js to see how modules are plugged in.)
//
// Inside this folder:
//   screens/   WordsHub, ReadingTopics, ReadingLevel, ReadingAlong, ReadingYourTurn,
//              ReadingSummary, StruggleWords
//   data/      readingTopics.json (topics x 3 levels) · sampleStruggleWords.json
//   store/     englishSlice.js (Redux Toolkit)
//   i18n/      ur.json (the Urdu words used only by this module)
//   readingData.js   small helpers for the topics file
//
// Screens of this module may import from:
//   ../../../shared/...   components, theme, utils, i18n   (the toolbox)
//   ../../../app/...      useChild(), useLanguage(), navigation helpers
// and from nowhere else (never from another module).

import englishReducer, { loadEnglishData } from './store/englishSlice';
import ur from './i18n/ur.json';
import WordsHubScreen from './screens/WordsHubScreen';
import ReadingTopicsScreen from './screens/ReadingTopicsScreen';
import ReadingLevelScreen from './screens/ReadingLevelScreen';
import ReadingAlongScreen from './screens/ReadingAlongScreen';
import ReadingYourTurnScreen from './screens/ReadingYourTurnScreen';
import ReadingSummaryScreen from './screens/ReadingSummaryScreen';
import StruggleWordsScreen from './screens/StruggleWordsScreen';

export default {
  name: 'english',
  reducer: englishReducer,
  load: loadEnglishData,
  translations: ur,
  screens: [
    { name: 'WordsHub', component: WordsHubScreen },
    { name: 'ReadingTopics', component: ReadingTopicsScreen },
    { name: 'ReadingLevel', component: ReadingLevelScreen },
    { name: 'ReadingAlong', component: ReadingAlongScreen },
    { name: 'ReadingYourTurn', component: ReadingYourTurnScreen },
    { name: 'ReadingSummary', component: ReadingSummaryScreen },
    { name: 'StruggleWords', component: StruggleWordsScreen },
  ],
};
