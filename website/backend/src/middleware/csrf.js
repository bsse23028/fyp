// CSRF PROTECTION - "double submit" check for every request that changes something.
//
// Because the login lives in a cookie, another website could try to make the browser send a
// POST to us. To stop that:
//   1. GET /web-api/csrf gives the page a random token in a readable cookie (kb_csrf)
//   2. the page copies it into the X-CSRF-Token header of every POST/PUT/PATCH/DELETE
//   3. here we check that the header and the cookie are the same
// Another site can make the browser SEND our cookies, but it can never READ them, so it cannot
// copy the token into the header. The Origin header is checked as well when the browser sends it.

const crypto = require('crypto');
const config = require('../config');
const HttpError = require('../utils/HttpError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfCookie(res, token) {
  res.cookie(config.cookies.csrf, token, {
    httpOnly: false, // the page must read it
    secure: config.cookies.secure,
    sameSite: 'strict',
    path: '/',
  });
}

// GET /web-api/csrf  ->  { csrfToken }   (also refreshes the cookie)
function issueCsrfToken(req, res) {
  const token = (req.cookies && req.cookies[config.cookies.csrf]) || newToken();
  setCsrfCookie(res, token);
  res.json({ csrfToken: token });
}

function sameToken(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin) {
    const own = `${req.protocol}://${req.get('host')}`;
    if (origin !== own && !config.allowedOrigins.includes(origin)) {
      throw new HttpError(403, 'This request came from a website that is not allowed.');
    }
  }

  const cookieToken = req.cookies && req.cookies[config.cookies.csrf];
  if (!sameToken(req.get('x-csrf-token'), cookieToken)) {
    throw new HttpError(403, 'Your session security check failed. Please refresh the page and try again.', {
      code: 'csrf',
    });
  }
  next();
}

module.exports = { issueCsrfToken, requireCsrf };
