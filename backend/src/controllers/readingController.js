// READING CONTROLLER - the Read-Along topics and levels.

const readingService = require('../services/readingService');
const childService = require('../services/childService');
const HttpError = require('../utils/HttpError');

// GET /api/reading/topics            built-in topics
// GET /api/reading/topics?childId=12 built-in topics + the custom topics of child 12
async function getTopics(req, res) {
  let childId = null;
  if (req.query.childId !== undefined) {
    childId = await childService.findOwnChildId(req.user.id, req.query.childId);
    if (!childId) throw new HttpError(404, 'Child profile not found.');
  }
  const levels = await readingService.getLevels();
  const topics = await readingService.getTopics(childId);
  res.status(200).json({ levels, topics });
}

module.exports = { getTopics };
