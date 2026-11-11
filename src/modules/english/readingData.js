// READING DATA - helpers for the reading topics of the English module.
//
// WHERE THE TOPICS COME FROM: the DATABASE. The app loads them with
//     GET /api/reading/topics?childId=...     (see store/englishSlice.js)
// in this shape (the same shape the old JSON file had):
//
//   { "id": "animals", "title": "Animals", "icon": "🐶", "tint": "bluePale",
//     "levels": { "easy": [ SENTENCE, SENTENCE, SENTENCE ], "medium": [...], "hard": [...] } }
//
//   SENTENCE = { "words": ["The","cat","sat."],  "focus": 1,
//                "ur": { "words": [...], "focus": 0 } }
//     words : the sentence, one word per item.
//     focus : the position (0 = first word) of the glowing word on the "Your turn" screen.
//     ur    : the same sentence in Urdu, with its own focus (Urdu starts on the right).
//
// TO ADD A TOPIC: add it to the reading tables in the database (or, for one child, save a
// custom topic with saveCustomTopic). The topic list, the levels and the progress dots follow.
//
// data/readingTopics.json is KEPT, but only as the DEMO_MODE fallback (when the server's
// content is not loaded). Do not edit it to change what children read.

import topicsFile from './data/readingTopics.json';

// DEMO_MODE fallback only: the topics that used to come with the app.
export const DEMO_TOPICS = topicsFile;

// DEMO_MODE fallback only: the three levels (the real ones come from the database).
export const DEMO_LEVELS = [
  { id: 'easy', label: 'Easy', stars: 1, tint: 'sagePale', color: 'sage' },
  { id: 'medium', label: 'Medium', stars: 2, tint: 'yellowPale', color: 'yellow' },
  { id: 'hard', label: 'Hard', stars: 3, tint: 'coralPale', color: 'coral' },
];

// Stars given when a whole session is finished.
export const STARS_PER_SESSION = 3;

// The sentences of one topic + level. Returns [] if the topic or level does not exist.
export function findSentences(topics, topicId, levelId) {
  const topic = topics.find((t) => t.id === topicId);
  if (!topic || !topic.levels[levelId]) return [];
  return topic.levels[levelId];
}

// One sentence in the chosen language: { words, focus }.
// The database may say focus = null ("no glowing word"); then the first word is used, so
// the "Your turn" screen always has a word. A sentence without Urdu falls back to English.
export function getSentence(sentences, index, language) {
  const sentence = sentences[index];
  const chosen = language === 'ur' && sentence.ur ? sentence.ur : { words: sentence.words, focus: sentence.focus };
  return { words: chosen.words, focus: chosen.focus == null ? 0 : chosen.focus };
}
