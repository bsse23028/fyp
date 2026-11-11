// CHILD ACCESS - makes sure the child in the URL belongs to the logged-in parent.
//
//   router.get('/:childId', requireOwnChild, childController.getChild);
//
// It runs AFTER requireAuth. If the child does not exist OR belongs to another parent,
// the answer is the same 404, so nobody can find out which child ids exist.
// On success the controller can use  req.childId  (a number).

const HttpError = require('../utils/HttpError');
const childService = require('../services/childService');

async function requireOwnChild(req, res, next) {
  const childId = await childService.findOwnChildId(req.user.id, req.params.childId);
  if (!childId) {
    throw new HttpError(404, 'Child profile not found.');
  }
  req.childId = childId;
  next();
}

module.exports = requireOwnChild;
