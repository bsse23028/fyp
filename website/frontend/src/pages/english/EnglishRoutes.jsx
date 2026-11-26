// ENGLISH ROUTES - every page of the English module (the app's modules/english), under /child/english:
//   (hub = Reading & Writing, modules 1-5) · activities/:moduleNo · alphabet · alphabet/:letter (lesson) · trace · trace/:letter ·
//   games/bubbles · games/pairs · stories · stories/:letter · spell · spell/:wordId ·
//   read (topics) · read/:topicId (levels) · read/:topicId/:level/:index (Reading Time) ·
//   read/:topicId/:level/:index/turn (Your turn) · read/:topicId/:level/done (Nice reading!)
// Modules the parent switched off (child.modules) send the child back to the hub (or Child Home when none is on).

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import { ENGLISH_PAGE_MODULE, activityOn } from '../../utils/modules';
import { Screen } from '../../layouts/Layouts';
import { useLanguage } from '../../context/LanguageContext';
import EnglishHubPage from './EnglishHubPage';
import EnglishActivitiesPage from './EnglishActivitiesPage';
import AlphabetListPage from './AlphabetListPage';
import LetterLessonPage from './LetterLessonPage';
import { TraceListPage, LetterTracePage } from './TracePages';
import { BubblePopPage, MatchPairsPage } from './GamesPages';
import { StoryListPage, LetterStoryPage } from './StoryPages';
import { SpellingWordsPage, SpellingGamePage } from './SpellingPages';
import { ReadingTopicsPage, ReadingLevelPage, ReadingAlongPage, ReadingYourTurnPage, ReadingSummaryPage } from './ReadingPages';

// Which sky each page gets (the app's `scene` prop): lessons / reading are calm, spelling is evening.
function sceneFor(path) {
  if (/\/english\/spell\/.+/.test(path)) return 'spelling';
  if (/\/english\/spell$/.test(path)) return 'sunset';
  if (/\/english\/(alphabet\/.+|read\/[^/]+\/[^/]+)/.test(path)) return 'lesson';
  if (/\/english\/(trace|games|stories)\/.+/.test(path)) return 'lesson';
  return 'day';
}

// The first part after /child/english (alphabet, trace, games, stories, spell, read, activities).
function sectionOf(path) {
  return path.replace(/^\/child\/english\/?/, '').split('/')[0];
}

export default function EnglishRoutes() {
  useLanguage(); // re-render the English pages when the language changes
  const { pathname } = useLocation();
  const { activeChild } = useChild();
  // The hub needs at least one of modules 1-5 switched on; each page needs its own module (not even a saved link opens one that is off).
  const section = sectionOf(pathname);
  const anyOn = [1, 2, 3, 4, 5].some((no) => activityOn(activeChild, no));
  if (!anyOn) return <Navigate to="/child" replace />;
  if (ENGLISH_PAGE_MODULE[section] && !activityOn(activeChild, ENGLISH_PAGE_MODULE[section])) return <Navigate to="/child/english" replace />;
  return (
    <Screen kind="child" scene={sceneFor(pathname)}>
    <Routes>
      <Route index element={<EnglishHubPage />} />
      <Route path="alphabet" element={<AlphabetListPage />} />
      <Route path="alphabet/:letter" element={<LetterLessonPage />} />
      <Route path="trace" element={<TraceListPage />} />
      <Route path="trace/:letter" element={<LetterTracePage />} />
      <Route path="games" element={<Navigate to="/child/english/activities/4" replace />} />
      <Route path="games/bubbles" element={<BubblePopPage />} />
      <Route path="games/pairs" element={<MatchPairsPage />} />
      <Route path="stories" element={<StoryListPage />} />
      <Route path="stories/:letter" element={<LetterStoryPage />} />
      <Route path="words" element={<Navigate to="/child/english/activities/4" replace />} />
      <Route path="activities/:moduleNo" element={<EnglishActivitiesPage />} />
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
