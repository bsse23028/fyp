// ENGLISH MODULE - the one file that tells the app what this module contains.
// (Read src/modules/index.js to see how modules are plugged in.)
//
// Inside this folder:
//   screens/   EnglishHub (the proposal's Modules 1-5, data/englishSections.js), EnglishActivities (the
//              activities of Module 3 or 4), AlphabetList, LetterLesson, ReadingTopics, ReadingLevel, ReadingAlong, ReadingYourTurn,
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
//
// THE PUBLIC DOOR: the rest of the app only uses what this file exports below (entry, progress,
// parentTools ...). It NEVER imports a file from inside this folder. So the insides can change freely.

import englishReducer, { fetchReadingContent } from './store/englishSlice';
import alphabetReducer, { loadAlphabetProgress, selectLetterStars } from './store/alphabetSlice';
import { translate } from '../../shared/i18n/translate';
import ur from './i18n/ur.json';
import { configureLetterAudio } from '../../shared/utils/letterAudio';
import { LETTER_AUDIO } from './data/letterAudio';
import { ENGLISH_MUSIC } from './data/englishMusic';
import { getLetter } from './data/alphabetData';
import { ENGLISH_PREVIEW_GUIDE } from './data/previewGuide';
import EnglishHubScreen from './screens/EnglishHubScreen';
import AlphabetListScreen from './screens/AlphabetListScreen';
import LetterLessonScreen from './screens/LetterLessonScreen';
import ReadingTopicsScreen from './screens/ReadingTopicsScreen';
import ReadingLevelScreen from './screens/ReadingLevelScreen';
import ReadingAlongScreen from './screens/ReadingAlongScreen';
import ReadingYourTurnScreen from './screens/ReadingYourTurnScreen';
import ReadingSummaryScreen from './screens/ReadingSummaryScreen';
import StruggleWordsScreen from './screens/StruggleWordsScreen';
import SpellingWordsScreen from './screens/SpellingWordsScreen';
import SpellingGameScreen from './screens/SpellingGameScreen';
import TraceListScreen from './screens/TraceListScreen';
import LetterTraceScreen from './screens/LetterTraceScreen';
import EnglishActivitiesScreen from './screens/EnglishActivitiesScreen';
import BubblePopGameScreen from './screens/BubblePopGameScreen';
import MatchPairsGameScreen from './screens/MatchPairsGameScreen';
import StoryListScreen from './screens/StoryListScreen';
import LetterStoryScreen from './screens/LetterStoryScreen';

// The recorded letter sounds (and what the voice says instead when a clip is missing).
configureLetterAudio(LETTER_AUDIO, (letter) => getLetter(letter.toUpperCase()).soundSpeech);

// The English section screens fade instead of sliding (calmer, no repeated side swipes).
const FADE = { animation: 'fade' };

const LETTER_COUNT = 26;

export default {
  name: 'english',
  // THE ONE SCREEN the rest of the app opens (Child Home's "English" tile). Everything else in English
  // is reached from this hub.
  entry: 'EnglishHub',
  // How far a child is, for Parent Home's child cards and the Progress tab:
  //   { title, done, total, text, activityNo }   (no saved progress = 0 of 26)
  //   activityNo = the proposal module it belongs to (3 Words & Phonics: the alphabet lessons live there),
  //   so Parent Mode only shows it when that activity is switched on for the child.
  progress: (state, childId) => {
    const stars = selectLetterStars(state, childId);
    const done = Object.keys(stars).filter((letter) => stars[letter] > 0).length;
    return {
      activityNo: 3,
      title: 'Alphabet',
      done,
      total: LETTER_COUNT,
      text: translate('{n} of 26 letters', { n: done }),
    };
  },
  // Cards this module adds to Parent Mode's Plan tab (icon = a flat AppIcon name).
  parentTools: [
    {
      icon: 'alphabetical-variant',
      title: 'Struggle words',
      desc: 'Recent words that resurface gently',
      screen: 'StruggleWords',
      accent: 'games', // a CATEGORY colour name (theme.js)
    },
  ],
  reducer: englishReducer,
  reducers: { englishAlphabet: alphabetReducer }, // best stars per letter (saved on the phone)
  load: loadAlphabetProgress,
  // When a child is chosen ("Continue as Zara"), load the Read-Along content for this child
  // from the database: topics, levels, sentences, Urdu, and the child's custom topics.
  onChildSelected: (childId) => fetchReadingContent({ childId }),
  translations: ur,
  previewGuide: ENGLISH_PREVIEW_GUIDE, // one sentence per screen for parents, only in the Preview strip
  music: ENGLISH_MUSIC, // the ABC song in the background of the English screens
  screens: [
    { name: 'EnglishHub', component: EnglishHubScreen, options: FADE },
    { name: 'AlphabetList', component: AlphabetListScreen, options: FADE },
    { name: 'LetterLesson', component: LetterLessonScreen, options: FADE },
    { name: 'TraceList', component: TraceListScreen, options: FADE },
    { name: 'LetterTrace', component: LetterTraceScreen, options: FADE },
    { name: 'EnglishActivities', component: EnglishActivitiesScreen, options: FADE }, // the activities of proposal Module 3 or 4
    { name: 'BubblePopGame', component: BubblePopGameScreen, options: FADE },
    { name: 'MatchPairsGame', component: MatchPairsGameScreen, options: FADE },
    { name: 'StoryList', component: StoryListScreen, options: FADE },
    { name: 'LetterStory', component: LetterStoryScreen, options: FADE },
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
