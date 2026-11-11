// AUTH MIDDLEWARE - lets a request through only when it carries a valid login token.
//
// The app sends the token it got from /api/auth/login in a header:
//   Authorization: Bearer eyJhbGciOi...
//
// If everything is fine, the controller can use:
//   req.user       { id, name, email }   the logged-in parent
//   req.sessionId  the id of this login in the user_sessions table (used by logout)

const HttpError = require('../utils/HttpError');
const tokenService = require('../services/tokenService');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    throw new HttpError(401, 'Please log in first.');
  }

  const session = await tokenService.findSessionForToken(token);
  if (!session) {
    throw new HttpError(401, 'Your login has expired. Please log in again.');
  }

  req.user = session.user;
  req.sessionId = session.sessionId;
  next();
}

module.exports = requireAuth;
