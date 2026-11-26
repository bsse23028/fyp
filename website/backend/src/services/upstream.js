// UPSTREAM - the ONE place that talks to the shared KidBuddy API (fyp/backend).
//
//   const { status, data } = await upstream.call('POST', '/api/auth/login', { body, token });
//
// - adds the login token as "Authorization: Bearer <token>" when one is given
// - sends and reads JSON
// - never throws for an HTTP error status: the caller decides what to do with it
// - throws HttpError 502/504 when the API cannot be reached or does not answer in time

const config = require('../config');
const HttpError = require('../utils/HttpError');

async function call(method, path, { body, token, query = '' } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.upstream.timeoutMs);

  let response;
  try {
    response = await fetch(config.upstream.url + path + query, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new HttpError(504, 'The KidBuddy server took too long to answer. Please try again.');
    }
    if (!config.isTest) console.error(`[gateway] cannot reach ${config.upstream.url}${path}:`, error.message);
    throw new HttpError(502, 'We can’t reach the KidBuddy server right now. Please try again in a moment.');
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }
  return { status: response.status, data };
}

module.exports = { call };
