// PROGRESS SERVICE - stars and sessions.
//
// Tables:
//   activity_sessions        one row per finished session (any module)
//   reading_session_details  which topic + level a reading session used
//   child_daily_progress     the total per child, per day, per module (what Parent screens read)
//
// The answer has the same shape the app already uses on a child:
//   reading:  { date: '2026-10-12', starsToday: 3, sessions: 1 }   the LAST day of Read-Along
//   activity: { '2026-10-12': { sessions: 1, stars: 3 }, ... }    every day, all modules together
// (The app compares reading.date with its own "today", so an old day shows 0 stars.)

const { query, withTransaction } = require('../db/connection');
const HttpError = require('../utils/HttpError');

const READ_ALONG = 'read-along';

function emptyProgress() {
  return { reading: { date: null, starsToday: 0, sessions: 0 }, activity: {} };
}

// { [childId]: { reading, activity } } for several children at once.
async function loadProgress(childIds) {
  const rows = await query(
    `SELECT p.child_id, p.activity_date, m.code AS module_code, p.sessions, p.stars
       FROM child_daily_progress p
       JOIN modules m ON m.id = p.module_id
      WHERE p.child_id IN (?)
      ORDER BY p.activity_date`,
    [childIds]
  );

  const progress = {};
  childIds.forEach((id) => {
    progress[id] = emptyProgress();
  });
  rows.forEach((row) => {
    const child = progress[row.child_id];
    const day = child.activity[row.activity_date] || { sessions: 0, stars: 0 };
    day.sessions += row.sessions;
    day.stars += row.stars;
    child.activity[row.activity_date] = day;
    if (row.module_code === READ_ALONG) {
      // Rows are sorted by date, so the last one wins = the latest reading day.
      child.reading = { date: row.activity_date, starsToday: row.stars, sessions: row.sessions };
    }
  });
  return progress;
}

async function getProgress(childId) {
  const progress = await loadProgress([childId]);
  return progress[childId];
}

// Today in UTC as 'YYYY-MM-DD' (only used when the app does not send its own date).
function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Saves one finished Read-Along session.
// Returns { created: true } normally, or { created: false } when this clientSessionId was
// already saved (the app retried after a network problem): the stars are NOT added twice.
async function recordReadingSession(childId, body) {
  const language = body.language || 'en';
  const sessionDate = body.sessionDate || todayUtc();

  // The topic must be a built-in one or one made for THIS child.
  const topicLevels = await query(
    `SELECT tl.id
       FROM topic_levels tl
       JOIN reading_topics t ON t.id = tl.topic_id
       JOIN reading_levels l ON l.id = tl.level_id
      WHERE t.code = ? AND l.code = ? AND t.is_active = 1
        AND (t.owner_child_id IS NULL OR t.owner_child_id = ?)`,
    [body.topicId, body.level, childId]
  );
  if (topicLevels.length === 0) throw new HttpError(400, 'Unknown topic or level.');
  const topicLevelId = topicLevels[0].id;

  const [module] = await query('SELECT id FROM modules WHERE code = ?', [READ_ALONG]);

  const alreadySaved = await query('SELECT id FROM activity_sessions WHERE child_id = ? AND client_session_id = ?', [
    childId,
    body.clientSessionId,
  ]);
  if (alreadySaved.length > 0) return { created: false };

  try {
    await withTransaction(async (run) => {
      const session = await run(
        `INSERT INTO activity_sessions
           (child_id, module_id, language_code, stars_earned, session_date, completed_at, client_session_id)
         VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?)`,
        [childId, module.id, language, body.stars, sessionDate, body.clientSessionId]
      );
      await run('INSERT INTO reading_session_details (session_id, topic_level_id) VALUES (?, ?)', [
        session.insertId,
        topicLevelId,
      ]);
      // Add to the day's total (or start it).
      await run(
        `INSERT INTO child_daily_progress (child_id, module_id, activity_date, sessions, stars)
         VALUES (?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE sessions = sessions + 1, stars = stars + ?`,
        [childId, module.id, sessionDate, body.stars, body.stars]
      );
    });
  } catch (error) {
    // Two copies of the same request arrived at the same moment: the second one is ignored.
    if (error.code === 'ER_DUP_ENTRY') return { created: false };
    throw error;
  }
  return { created: true };
}

module.exports = { emptyProgress, loadProgress, getProgress, recordReadingSession };
