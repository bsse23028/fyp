// API CLIENT - the ONE place where the website talks to its backend (website/backend).
//
//   import { api } from '../services/api';
//   const data = await api.post('/api/auth/login', { email, password });
//
// What it does for every request (like the mobile app's src/shared/api/client.js):
//   1. same-origin request with cookies (the login lives in an httpOnly cookie: no token in JS)
//   2. adds the CSRF token header to POST / PUT / PATCH / DELETE (fetched once from /web-api/csrf)
//   3. sends and reads JSON
//   4. a server error THROWS an Error whose message is the server's own message, plus .status
//   5. a 401 on a logged-in request runs the "unauthorized handler" (AuthContext logs out)

const TIMEOUT_MS = 20000;

let csrfToken = null;
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function makeError(status, message, data) {
  const error = new Error(message);
  error.status = status;
  error.data = data || null;
  return error;
}

async function loadCsrfToken() {
  const response = await fetch('/web-api/csrf', { credentials: 'same-origin' });
  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request(method, path, body, { retried = false, quiet401 = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const unsafe = method !== 'GET';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    if (unsafe) headers['X-CSRF-Token'] = csrfToken || (await loadCsrfToken());
    response = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (networkError) {
    throw makeError(0, 'We can’t reach the KidBuddy server. Check your internet connection and try again.');
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

  if (!response.ok) {
    // The CSRF cookie was missing or old (e.g. cookies cleared): get a fresh one and try once more.
    if (response.status === 403 && data && data.code === 'csrf' && !retried) {
      csrfToken = null;
      return request(method, path, body, { retried: true, quiet401 });
    }
    if (response.status === 401 && !quiet401 && unauthorizedHandler) unauthorizedHandler();
    const message = data && data.error ? data.error : `Something went wrong (error ${response.status}).`;
    throw makeError(response.status, message, data);
  }
  return data;
}

export const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body = {}, options) => request('POST', path, body, options),
  patch: (path, body = {}) => request('PATCH', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
