// STRUGGLE WORD SERVICE - words a child found hard (table: struggle_words).
//
// The app shows them as  [ { word: 'lightning', count: 3, topic: 'Weather' } ]
// Reporting the same word again only adds 1 to its count (the database ignores upper / lower
// case, so 'Lightning' and 'lightning' are the same word).

const { query } = require('../db/connection');
const HttpError = require('../utils/HttpError');

function toAppWord(row) {
  return {
    word: row.word,
    count: row.miss_count,
    topic: row.topic_title || '',
    topicId: row.topic_code || null,
    language: row.language_code,
    lastMissedAt: row.last_missed_at,
  };
}

const SELECT_WORDS = `
  SELECT sw.word, sw.miss_count, sw.language_code, sw.last_missed_at, t.code AS topic_code, t.title AS topic_title
    FROM struggle_words sw
    LEFT JOIN reading_topics t ON t.id = sw.topic_id`;

// language = 'en' / 'ur', or null for both. The hardest words come first.
async function listWords(childId, language) {
  const rows = await query(
    `${SELECT_WORDS}
      WHERE sw.child_id = ? AND (? IS NULL OR sw.language_code = ?)
      ORDER BY sw.miss_count DESC, sw.last_missed_at DESC`,
    [childId, language, language]
  );
  return rows.map(toAppWord);
}

// Finds a topic by its id ('weather') or its title ('Weather'): built-in or this child's own.
async function findTopicId(childId, topic) {
  const rows = await query(
    `SELECT id FROM reading_topics
      WHERE (code = ? OR title = ?) AND (owner_child_id IS NULL OR owner_child_id = ?)
      ORDER BY id
      LIMIT 1`,
    [topic, topic, childId]
  );
  if (rows.length === 0) throw new HttpError(400, `Unknown topic: ${topic}.`);
  return rows[0].id;
}

// Returns { created: true/false, word: {...} }. created = false means the count went up.
async function addWord(childId, { word, topic, language }) {
  const text = word.trim();
  const languageCode = language || 'en';
  const topicId = topic ? await findTopicId(childId, topic.trim()) : null;

  const result = await query(
    `INSERT INTO struggle_words (child_id, language_code, word, topic_id, miss_count, first_missed_at, last_missed_at)
     VALUES (?, ?, ?, ?, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE miss_count = miss_count + 1, last_missed_at = UTC_TIMESTAMP(), topic_id = COALESCE(?, topic_id)`,
    [childId, languageCode, text, topicId, topicId]
  );

  const rows = await query(`${SELECT_WORDS} WHERE sw.child_id = ? AND sw.language_code = ? AND sw.word = ?`, [
    childId,
    languageCode,
    text,
  ]);
  // MySQL says affectedRows = 1 for a new row and 2 for an updated one.
  return { created: result.affectedRows === 1, word: toAppWord(rows[0]) };
}

module.exports = { listWords, addWord };
