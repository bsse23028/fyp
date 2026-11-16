// ENGLISH MODULE - the one file that tells the app what this module contains.
// (Read src/modules/index.js to see how modules are plugged in.)
//
// Inside this folder:
//   screens/   EnglishHub (Alphabets · Words · Sentences), AlphabetList, LetterLesson,
//              WordsHub, ReadingTopics, ReadingLevel, ReadingAlong, ReadingYourTurn,
//              ReadingSummary, StruggleWords, SpellingWords, SpellingGame (drag letters to spell a word)
//   data/      readingTopics.json (DEMO_MODE fallback only; the real topics are in the
//              database) · sampleStruggleWords.json
//   store/     englishSlice.js (Redux Toolkit)
//   i18n/      ur.json (the Urdu words used only by this module)
//   readingData.js   small helpers for the topics file
//
// Screens of this module may import from:
//   ../../../shared/...   components, theme, utils, i18n   (the toolbox)
//   ../../../app/...      useChild(), useLanguage(), navigation helpers
// and from nowhere else (never from another module).

import englishReducer, { fetchReadingContent } from './store/englishSlice';
import alphabetReducer, { loadAlphabetProgress } from './store/alphabetSlice';
import ur from './i18n/ur.json';
import { configureLetterAudio } from '../../shared/utils/letterAudio';
import { LETTER_AUDIO } from './data/letterAudio';
import { ENGLISH_MUSIC } from './data/englishMusic';
import { getLetter } from './data/alphabetData';
import EnglishHubScreen from './screens/EnglishHubScreen';
import AlphabetListScreen from './screens/AlphabetListScreen';
import LetterLessonScreen from './screens/LetterLessonScreen';
import WordsHubScreen from './screens/WordsHubScreen';
import ReadingTopicsScreen from './screens/ReadingTopicsScreen';
import ReadingLevelScreen from './screens/ReadingLevelScreen';
import ReadingAlongScreen from './screens/ReadingAlongScreen';
import ReadingYourTurnScreen from './screens/ReadingYourTurnScreen';
import ReadingSummaryScreen from './screens/ReadingSummaryScreen';
import StruggleWordsScreen from './screens/StruggleWordsScreen';
import SpellingWordsScreen from './screens/SpellingWordsScreen';
import SpellingGameScreen from './screens/SpellingGameScreen';

// The recorded letter sounds (and what the voice says instead when a clip is missing).
configureLetterAudio(LETTER_AUDIO, (letter) => getLetter(letter.toUpperCase()).soundSpeech);

// The English section screens fade instead of sliding (calmer, no repeated side swipes).
const FADE = { animation: 'fade' };

export default {
  name: 'english',
  reducer: englishReducer,
  reducers: { englishAlphabet: alphabetReducer }, // best stars per letter (saved on the phone)
  load: loadAlphabetProgress,
  // When a child is chosen ("Continue as Zara"), load the Read-Along content for this child
  // from the database: topics, levels, sentences, Urdu, and the child's custom topics.
  onChildSelected: (childId) => fetchReadingContent({ childId }),
  translations: ur,
  music: ENGLISH_MUSIC, // the ABC song in the background of the English screens
  screens: [
    { name: 'EnglishHub', component: EnglishHubScreen, options: FADE },
    { name: 'AlphabetList', component: AlphabetListScreen, options: FADE },
    { name: 'LetterLesson', component: LetterLessonScreen, options: FADE },
    { name: 'WordsHub', component: WordsHubScreen },
    { name: 'ReadingTopics', component: ReadingTopicsScreen },
    { name: 'ReadingLevel', component: ReadingLevelScreen },
    { name: 'ReadingAlong', component: ReadingAlongScreen },
    { name: 'ReadingYourTurn', component: ReadingYourTurnScreen },
    { name: 'ReadingSummary', component: ReadingSummaryScreen },
    { name: 'StruggleWords', component: StruggleWordsScreen },
    { name: 'SpellingWords', component: SpellingWordsScreen, options: FADE },
    { name: 'SpellingGame', component: SpellingGameScreen, options: FADE },
  ],
};
