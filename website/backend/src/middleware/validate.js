// VALIDATE - quick shape checks at the gateway. The shared API does the full validation
// (password rules, PIN format ...); these checks only stop clearly broken requests early.

const HttpError = require('../utils/HttpError');

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// A JSON body, when one is sent, must be an object (not an array or a bare string).
function requireObjectBody(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body !== undefined && !isPlainObject(req.body)) {
    throw new HttpError(400, 'The data must be a JSON object.');
  }
  next();
}

// These fields must be non-empty text.
function requireStrings(fields) {
  return (req, res, next) => {
    const body = isPlainObject(req.body) ? req.body : {};
    const missing = fields.filter((name) => typeof body[name] !== 'string' || !body[name].trim());
    if (missing.length > 0) {
      throw new HttpError(400, `Please fill in: ${missing.join(', ')}.`, { details: missing.map((m) => `${m} is required`) });
    }
    next();
  };
}

module.exports = { isPlainObject, requireObjectBody, requireStrings };
