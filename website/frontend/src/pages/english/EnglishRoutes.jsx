// ENGLISH ROUTES - every page of the English module (the app's modules/english), under /child/english:
//   (hub) · alphabet · alphabet/:letter (lesson) · trace · trace/:letter · games · games/bubbles ·
//   games/pairs · stories · stories/:letter · words · spell · spell/:wordId ·
//   read (topics) · read/:topicId (levels) · read/:topicId/:level/:index (Reading Time) ·
//   read/:topicId/:level/:index/turn (Your turn) · read/:topicId/:level/done (Nice reading!)
// Sections whose activity the parent switched off (child.modules) send the child back to the hub.

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { ENGLISH_SECTIONS, HOME_AREAS, isOn } from '../../utils/modules';
import { Screen } from '../../layouts/Layouts';
import { useLanguage } from '../../context/LanguageContext';
import EnglishHubPage from './EnglishHubPage';
import AlphabetListPage from './AlphabetListPage';
import LetterLessonPage from './LetterLessonPage';
import { TraceListPage, LetterTracePage } from './TracePages';
import { LetterGamesPage, BubblePopPage, MatchPairsPage } from './GamesPages';
import { StoryListPage, LetterStoryPage } from './StoryPages';
import { WordsHubPage, SpellingWordsPage, SpellingGamePage } from './SpellingPages';
import { ReadingTopicsPage, ReadingLevelPage, ReadingAlongPage, ReadingYourTurnPage, ReadingSummaryPage } from './ReadingPages';

// Which sky each page gets (the app's `scene` prop): lessons / reading are calm, spelling is evening.
function sceneFor(path) {
  if (/\/english\/spell\/.+/.test(path)) return 'spelling';
  if (/\/english\/spell$/.test(path)) return 'sunset';
  if (/\/english\/(alphabet\/.+|read\/[^/]+\/[^/]+)/.test(path)) return 'lesson';
  if (/\/english\/(trace|games|stories)\/.+/.test(path)) return 'lesson';
  return 'day';
}

// The first part after /child/english (alphabet, trace, games, stories, words / spell, read).
function sectionOf(path) {
  const part = path.replace(/^\/child\/english\/?/, '').split('/')[0];
  return part === 'spell' ? 'words' : part;
}

export default function EnglishRoutes() {
  useLanguage(); // re-render the English pages when the language changes
  const { pathname } = useLocation();
  const { activeChild } = useChild();
  // A section the parent switched off is not reachable, not even by a saved link.
  const section = sectionOf(pathname);
  if (!isOn(activeChild, HOME_AREAS.english)) return <Navigate to="/child" replace />;
  if (ENGLISH_SECTIONS[section] && !isOn(activeChild, ENGLISH_SECTIONS[section])) return <Navigate to="/child/english" replace />;
  return (
    <Screen kind="child" scene={sceneFor(pathname)}>
    <Routes>
      <Route index element={<EnglishHubPage />} />
      <Route path="alphabet" element={<AlphabetListPage />} />
      <Route path="alphabet/:letter" element={<LetterLessonPage />} />
      <Route path="trace" element={<TraceListPage />} />
      <Route path="trace/:letter" element={<LetterTracePage />} />
      <Route path="games" element={<LetterGamesPage />} />
      <Route path="games/bubbles" element={<BubblePopPage />} />
      <Route path="games/pairs" element={<MatchPairsPage />} />
      <Route path="stories" element={<StoryListPage />} />
      <Route path="stories/:letter" element={<LetterStoryPage />} />
      <Route path="words" element={<WordsHubPage />} />
      <Route path="spell" element={<SpellingWordsPage />} />
      <Route path="spell/:wordId" element={<SpellingGamePage />} />
      <Route path="read" element={<ReadingTopicsPage />} />
      <Route path="read/:topicId" element={<ReadingLevelPage />} />
      <Route path="read/:topicId/:level/done" element={<ReadingSummaryPage />} />
      <Route path="read/:topicId/:level/:index" element={<ReadingAlongPage />} />
      <Route path="read/:topicId/:level/:index/turn" element={<ReadingYourTurnPage />} />
    </Routes>
    </Screen>
  );
}
