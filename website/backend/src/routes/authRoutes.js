// AUTH ROUTES - the few /api/auth requests the gateway must handle ITSELF, because they hand out
// or end a login. Everything else in /api/auth is simply forwarded (see proxyRoutes.js).
//
//   POST /api/auth/login              forwards, then keeps the token in the httpOnly cookie
//   POST /api/auth/verify-email       same (sign-up step 2 logs the parent in)
//   POST /api/auth/logout             ends the login on the API and deletes the cookie
//   GET  /api/auth/me                 answers 401 straight away when there is no cookie
//   POST /api/auth/verify-reset-code  keeps the reset token in its own httpOnly cookie
//   POST /api/auth/reset-password     adds that reset token, so the page never sees it
//
// The page therefore NEVER receives a token: the answers have the same shape as the API's,
// minus the `token` / `resetToken` fields.

const express = require('express');
const upstream = require('../services/upstream');
const session = require('../services/session');
const { isPlainObject, requireStrings } = require('../middleware/validate');

const router = express.Router();

// Sent to the API so the parent can see which device a login belongs to.
function deviceInfo(req) {
  const agent = (req.get('user-agent') || 'Web browser').replace(/\s+/g, ' ');
  return { platform: 'web', deviceName: agent.slice(0, 100) };
}

function forwardError(res, status, data) {
  res.status(status).json(data || { error: `Something went wrong (error ${status}).` });
}

// Log in / verify email: on success keep the token, send back { user, hasPin }.
function loginHandler(path) {
  return async (req, res) => {
    const { status, data } = await upstream.call('POST', path, { body: { ...req.body, ...deviceInfo(req) } });
    if (status >= 200 && status < 300 && data && data.token) {
      session.setToken(res, data.token);
      const { token, ...rest } = data; // eslint-disable-line no-unused-vars
      return res.status(status).json(rest);
    }
    forwardError(res, status, data);
  };
}

router.post('/login', requireStrings(['email', 'password']), loginHandler('/api/auth/login'));
router.post('/verify-email', requireStrings(['email', 'code']), loginHandler('/api/auth/verify-email'));

router.post('/logout', async (req, res) => {
  const token = session.getToken(req);
  if (token) {
    try {
      await upstream.call('POST', '/api/auth/logout', { token });
    } catch (error) {
      // The API could not be reached: still log out in this browser.
    }
  }
  session.clearToken(res);
  res.status(204).end();
});

router.get('/me', async (req, res) => {
  const token = session.getToken(req);
  if (!token) return res.status(401).json({ error: 'Please log in first.' });
  const { status, data } = await upstream.call('GET', '/api/auth/me', { token });
  if (status === 401) session.clearToken(res);
  res.status(status).json(data);
});

router.post('/verify-reset-code', requireStrings(['email', 'code']), async (req, res) => {
  const { status, data } = await upstream.call('POST', '/api/auth/verify-reset-code', { body: req.body });
  if (status === 200 && data && data.resetToken) {
    session.setResetToken(res, data.resetToken);
    return res.status(200).json({ verified: true });
  }
  forwardError(res, status, data);
});

router.post('/reset-password', requireStrings(['newPassword']), async (req, res) => {
  const resetToken = session.getResetToken(req);
  if (!resetToken) {
    return res.status(400).json({ error: 'Please verify your email code first. The code may have expired.' });
  }
  const { status, data } = await upstream.call('POST', '/api/auth/reset-password', {
    body: { resetToken, newPassword: req.body.newPassword },
  });
  if (status === 200) {
    session.clearResetToken(res);
    session.clearToken(res); // every login of the account was ended by the API
  }
  res.status(status).json(data);
});

module.exports = router;
module.exports.isPlainObject = isPlainObject;
