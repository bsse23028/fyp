// CHILD CONTROLLER - child profiles, Child Mode, progress, struggle words, custom topics.
// requireAuth gives req.user; requireOwnChild gives req.childId (already checked to be this parent's).

const childService = require('../services/childService');
const progressService = require('../services/progressService');
const struggleWordService = require('../services/struggleWordService');
const readingService = require('../services/readingService');
const HttpError = require('../utils/HttpError');

// ----- profiles -----

async function listChildren(req, res) {
  res.status(200).json(await childService.listChildren(req.user.id));
}

async function createChild(req, res) {
  const child = await childService.createChild(req.user.id, req.body);
  res.status(201).json({ child });
}

async function getChild(req, res) {
  const child = await childService.getChild(req.user.id, req.childId);
  res.status(200).json({ child });
}

async function updateChild(req, res) {
  const child = await childService.updateChild(req.user.id, req.childId, req.body);
  res.status(200).json({ child });
}

async function deleteChild(req, res) {
  await childService.deleteChild(req.user.id, req.childId);
  res.status(204).end();
}

async function selectChild(req, res) {
  res.status(200).json(await childService.selectChild(req.user.id, req.childId));
}

// ----- progress -----

async function getProgress(req, res) {
  res.status(200).json(await progressService.getProgress(req.childId));
}

async function recordReadingSession(req, res) {
  const { created } = await progressService.recordReadingSession(req.childId, req.body);
  const progress = await progressService.getProgress(req.childId);
  // 201 = saved now; 200 = this session was already saved before (nothing added twice).
  res.status(created ? 201 : 200).json({ duplicate: !created, ...progress });
}

// ----- struggle words -----

async function listStruggleWords(req, res) {
  const language = req.query.language || null;
  if (language !== null && !['en', 'ur'].includes(language)) {
    throw new HttpError(400, 'language must be "en" or "ur".');
  }
  res.status(200).json({ words: await struggleWordService.listWords(req.childId, language) });
}

async function addStruggleWord(req, res) {
  const { created, word } = await struggleWordService.addWord(req.childId, req.body);
  res.status(created ? 201 : 200).json({ word });
}

// ----- custom topics -----

async function createCustomTopic(req, res) {
  const topic = await readingService.createCustomTopic(req.childId, req.body);
  res.status(201).json({ topic });
}

module.exports = {
  listChildren,
  createChild,
  getChild,
  updateChild,
  deleteChild,
  selectChild,
  getProgress,
  recordReadingSession,
  listStruggleWords,
  addStruggleWord,
  createCustomTopic,
};
