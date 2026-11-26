// SESSION - keeps the API's login token in an httpOnly cookie, so page scripts can never read it
// (a big step up from saving the token in localStorage).
//
// Cookies set here:
//   kb_session  the API's JWT                       httpOnly, SameSite=Lax, path /
//   kb_reset    the 15-minute password-reset token  httpOnly, SameSite=Strict, path /api/auth
//
// Both are Secure in production (HTTPS only). The token itself is still checked by the shared API
// on every request, so logging out on the phone or changing the password ends this login too.

const config = require('../config');

const DAY_MS = 24 * 60 * 60 * 1000;

function baseOptions() {
  return { httpOnly: true, secure: config.cookies.secure, sameSite: 'lax', path: '/' };
}

function getToken(req) {
  return (req.cookies && req.cookies[config.cookies.session]) || null;
}

function setToken(res, token) {
  res.cookie(config.cookies.session, token, { ...baseOptions(), maxAge: config.cookies.sessionDays * DAY_MS });
}

function clearToken(res) {
  res.clearCookie(config.cookies.session, baseOptions());
}

const resetOptions = () => ({ httpOnly: true, secure: config.cookies.secure, sameSite: 'strict', path: '/api/auth' });

function getResetToken(req) {
  return (req.cookies && req.cookies[config.cookies.reset]) || null;
}

function setResetToken(res, token) {
  res.cookie(config.cookies.reset, token, { ...resetOptions(), maxAge: config.cookies.resetMinutes * 60 * 1000 });
}

function clearResetToken(res) {
  res.clearCookie(config.cookies.reset, resetOptions());
}

module.exports = { getToken, setToken, clearToken, getResetToken, setResetToken, clearResetToken };
