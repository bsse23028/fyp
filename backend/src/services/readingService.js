// READING SERVICE - the Read-Along topics (replaces readingTopics.json in the app).
//
// The database keeps a sentence word by word (reading_topics -> topic_levels ->
// reading_sentences -> sentence_translations -> sentence_words). This file turns it back into
// the shape the app already reads:
//
//   { id: 'animals', title: 'Animals', icon: '🐶', tint: 'bluePale', isCustom: false,
//     levels: {
//       easy: [ { words: ['The','cat','sat'], focus: 1, ur: { words: [...], focus: 0 } }, ... ],
//       medium: [...], hard: [...]
//     } }
//
// focus: the app counts from 0 (first word = 0); the database counts from 1.

const crypto = require('crypto');
const { query, withTransaction } = require('../db/connection');

// The 3 levels, in order: [{ id: 'easy', label: 'Easy', stars: 1, tint, color }, ...]
async function getLevels() {
  return query('SELECT code AS id, label, stars, tint, color FROM reading_levels ORDER BY sort_order');
}

// Built-in topics, plus the custom topics of `childId` (or none when childId is null).
async function getTopics(childId) {
  const rows = await query(
    `SELECT t.code AS topic_code, t.title, t.icon, t.tint, t.owner_child_id,
            l.code AS level_code, s.position AS sentence_position,
            st.language_code, st.focus_position, w.word
       FROM reading_topics t
       JOIN topic_levels tl          ON tl.topic_id = t.id
       JOIN reading_levels l         ON l.id = tl.level_id
       JOIN reading_sentences s      ON s.topic_level_id = tl.id
       JOIN sentence_translations st ON st.sentence_id = s.id
       JOIN sentence_words w         ON w.translation_id = st.id
      WHERE t.is_active = 1 AND (t.owner_child_id IS NULL OR t.owner_child_id = ?)
      ORDER BY (t.owner_child_id IS NOT NULL), t.sort_order, t.id, l.sort_order, s.position, st.language_code, w.position`,
    [childId]
  );

  const topics = [];
  const topicsByCode = {};
  const sentencesByKey = {}; // 'animals|easy|1' -> the sentence object

  rows.forEach((row) => {
    let topic = topicsByCode[row.topic_code];
    if (!topic) {
      topic = {
        id: row.topic_code,
        title: row.title,
        icon: row.icon,
        tint: row.tint,
        isCustom: row.owner_child_id !== null,
        levels: {},
      };
      topicsByCode[row.topic_code] = topic;
      topics.push(topic);
    }
    if (!topic.levels[row.level_code]) topic.levels[row.level_code] = [];

    const key = `${row.topic_code}|${row.level_code}|${row.sentence_position}`;
    let sentence = sentencesByKey[key];
    if (!sentence) {
      sentence = { words: [], focus: null, ur: { words: [], focus: null } };
      sentencesByKey[key] = sentence;
      topic.levels[row.level_code].push(sentence);
    }

    const part = row.language_code === 'ur' ? sentence.ur : sentence; // English is the main one
    part.words.push(row.word);
    part.focus = row.focus_position === null ? null : row.focus_position - 1;
  });
  return topics;
}

// Saves one language of a sentence: a translation row + one row per word.
async function insertTranslation(run, sentenceId, languageCode, part) {
  const focus = part.focus === undefined || part.focus === null ? null : part.focus + 1;
  const translation = await run(
    'INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (?, ?, ?)',
    [sentenceId, languageCode, focus]
  );
  const words = part.words.map((word, i) => [translation.insertId, i + 1, word.trim()]);
  await run('INSERT INTO sentence_words (translation_id, position, word) VALUES ?', [words]);
}

// Saves a topic made for ONE child (e.g. a personalised story) and returns it in the app's shape.
async function createCustomTopic(childId, body) {
  const code = `custom-${crypto.randomUUID()}`;

  await withTransaction(async (run) => {
    const levelRows = await run('SELECT id, code FROM reading_levels');
    const levelIds = Object.fromEntries(levelRows.map((row) => [row.code, row.id]));

    const topic = await run(
      'INSERT INTO reading_topics (code, title, icon, tint, owner_child_id, sort_order) VALUES (?, ?, ?, ?, ?, 0)',
      [code, body.title.trim(), body.icon || null, body.tint || null, childId]
    );

    for (const [levelCode, sentences] of Object.entries(body.levels)) {
      const topicLevel = await run('INSERT INTO topic_levels (topic_id, level_id) VALUES (?, ?)', [
        topic.insertId,
        levelIds[levelCode],
      ]);
      for (let i = 0; i < sentences.length; i++) {
        const sentence = await run('INSERT INTO reading_sentences (topic_level_id, position) VALUES (?, ?)', [
          topicLevel.insertId,
          i + 1,
        ]);
        await insertTranslation(run, sentence.insertId, 'en', sentences[i]);
        await insertTranslation(run, sentence.insertId, 'ur', sentences[i].ur);
      }
    }
  });

  const topics = await getTopics(childId);
  return topics.find((topic) => topic.id === code);
}

module.exports = { getLevels, getTopics, createCustomTopic };
