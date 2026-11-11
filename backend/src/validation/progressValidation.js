// PROGRESS VALIDATION - reading sessions and struggle words.

const { isText, isWholeNumber } = require('./rules');
const { onlyProblems } = require('./authValidation');

const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS_AWAY = 2; // the phone's "today" can differ from the server's by a time zone, not more

// '2026-10-12' -> true only when it is a real calendar day close to today.
function isRecentDay(value) {
  if (typeof value !== 'string' || !DATE_FORMAT.test(value)) return false;
  const day = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== value) return false;
  const daysAway = Math.abs(day.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
  return daysAway <= MAX_DAYS_AWAY;
}

// POST /api/children/:childId/sessions
//   { clientSessionId: 'uuid', stars: 3, topicId: 'animals', level: 'easy', language: 'en', sessionDate: '2026-10-12' }
function checkReadingSession(body) {
  return onlyProblems([
    typeof body.clientSessionId === 'string' && UUID_FORMAT.test(body.clientSessionId)
      ? ''
      : 'clientSessionId must be a UUID made by the app (it stops a retry from counting twice).',
    isWholeNumber(body.stars, 0, 100) ? '' : 'stars must be a whole number from 0 to 100.',
    isText(body.topicId, 60) ? '' : 'topicId is missing.',
    ['easy', 'medium', 'hard'].includes(body.level) ? '' : 'level must be "easy", "medium" or "hard".',
    body.language === undefined || ['en', 'ur'].includes(body.language) ? '' : 'language must be "en" or "ur".',
    body.sessionDate === undefined || isRecentDay(body.sessionDate)
      ? ''
      : 'sessionDate must be today’s date on the phone, written as YYYY-MM-DD.',
  ]);
}

// POST /api/children/:childId/struggle-words   { word: 'lightning', topic: 'Weather', language: 'en' }
function checkStruggleWord(body) {
  return onlyProblems([
    isText(body.word, 80) ? '' : 'word is missing (80 characters at most).',
    body.topic === undefined || body.topic === null || isText(body.topic, 80) ? '' : 'topic must be a topic id or title.',
    body.language === undefined || ['en', 'ur'].includes(body.language) ? '' : 'language must be "en" or "ur".',
  ]);
}

module.exports = { checkReadingSession, checkStruggleWord };
