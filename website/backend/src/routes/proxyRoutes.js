// PROXY ROUTES - forwards the rest of /api to the shared KidBuddy API, adding the login token
// from the httpOnly cookie. Only the API's own sections are allowed through (an allow-list),
// and any Authorization header the browser sends is ignored: the cookie is the only login.
//
//   /api/auth/...      signup, resend-code, forgot-password  (public)
//   /api/account/...   name, password, Parent PIN            (login)
//   /api/children/...  child profiles, progress, struggle words, custom topics (login)
//   /api/reading/...   Read-Along topics                     (login)
//   /api/options       the choice lists                      (public)
//
// A 401 from the API means the login has ended: the cookie is deleted too.

const express = require('express');
const upstream = require('../services/upstream');
const session = require('../services/session');
const HttpError = require('../utils/HttpError');

const router = express.Router();

const ALLOWED = [/^\/auth\/[a-z-]+$/, /^\/account(\/[a-z-]+)*$/, /^\/children(\/[A-Za-z0-9-]+)*$/, /^\/reading\/topics$/, /^\/options$/];
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

router.use(async (req, res) => {
  if (!METHODS.has(req.method) || !ALLOWED.some((pattern) => pattern.test(req.path))) {
    throw new HttpError(404, 'Not found.');
  }

  const token = session.getToken(req);
  const queryIndex = req.originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  const { status, data } = await upstream.call(req.method, `/api${req.path}`, {
    token,
    query,
    body: hasBody ? req.body || {} : undefined,
  });

  if (status === 401 && token) session.clearToken(res);
  if (status === 204 || data === null) return res.status(status).end();
  res.status(status).json(data);
});

module.exports = router;
