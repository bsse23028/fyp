// READING DATA - helpers for the reading topics of the English module.
//
// The topics themselves are NOT written here. They live in a plain JSON file:
//     modules/english/data/readingTopics.json
// Each topic has 3 levels (easy / medium / hard) and each level is a list of sentences:
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
// TO ADD A TOPIC: copy one topic block in the JSON file and change the words. Nothing else
// needs to change - the topic list, the levels and the progress dots follow the file.
//
// LATER (personalised stories): topics made for one child will be saved in the Redux slice
// (`customTopics` in store/englishSlice.js) in this very same shape, and they will show up
// in the topic list automatically.

import topicsFile from './data/readingTopics.json';

// The topics that come with the app.
export const BUILT_IN_TOPICS = topicsFile;

// The three levels, in the order they are shown.
export const LEVELS = [
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
export function getSentence(sentences, index, language) {
  const sentence = sentences[index];
  return language === 'ur' ? sentence.ur : { words: sentence.words, focus: sentence.focus };
}
