// READING DATA - helpers for Read Along (the same as the app's modules/english/readingData.js).
// The real topics come from the DATABASE (GET /api/reading/topics?childId=). readingTopics.json is
// only used in Preview mode (Explore KidBuddy) and as a fallback while the server is unreachable.

import topicsFile from './readingTopics.json';

export const DEMO_TOPICS = topicsFile;

export const DEMO_LEVELS = [
  { id: 'easy', label: 'Easy', stars: 1, tint: 'sagePale', color: 'sage' },
  { id: 'medium', label: 'Medium', stars: 2, tint: 'yellowPale', color: 'yellow' },
  { id: 'hard', label: 'Hard', stars: 3, tint: 'coralPale', color: 'coral' },
];

export const STARS_PER_SESSION = 3;

// The app's COLORS names used by the topics / levels ("bluePale" ...) -> real colours.
export const TINTS = {
  blue: '#8EC1EC',
  bluePale: '#CFE3F7',
  sage: '#A9DB8E',
  sagePale: '#CDEBB8',
  coral: '#FF7F7F',
  coralPale: '#F9D3D0',
  yellow: '#F7C744',
  yellowPale: '#FBEBA5',
  purple: '#A866E0',
  purplePale: '#DDD0F5',
  orange: '#F08A4B',
  orangePale: '#FADCD3',
};

export function findSentences(topics, topicId, levelId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !topic.levels[levelId]) return [];
  return topic.levels[levelId];
}

export function getSentence(sentences, index, language) {
  const sentence = sentences[index];
  if (!sentence) return { words: [], focus: 0 };
  const chosen = language === 'ur' && sentence.ur ? sentence.ur : { words: sentence.words, focus: sentence.focus };
  return { words: chosen.words, focus: chosen.focus == null ? 0 : chosen.focus };
}
