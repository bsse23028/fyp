// API CLIENT - the ONE place where the app talks to the backend.
//
//   import { api } from '../../shared/api/client';
//   const data = await api.post('/api/auth/login', { email, password });
//   const me   = await api.get('/api/auth/me');
//
// What it does for every request:
//   1. puts API_BASE_URL (src/shared/config.js) in front of the path
//   2. adds the login token, if we have one:   Authorization: Bearer <token>
//   3. sends and reads JSON
//   4. if the server answers with an error, it THROWS an Error whose message is the
//      server's own message (e.g. "Incorrect email or password."), so screens can show it
//   5. if the server answers 401 to a request that HAD a token, the login is over:
//      the token is deleted and the "unauthorized handler" runs (AuthContext.js uses it to
//      log the parent out and open the Log In screen)
//
// The token is saved in AsyncStorage, so the parent stays logged in after closing the app.
// The backend contract is backend/docs/API.md.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { KEYS } from '../utils/storage';

// ----- the token -----

export function saveToken(token) {
  return AsyncStorage.setItem(KEYS.authToken, token);
}

export function getToken() {
  return AsyncStorage.getItem(KEYS.authToken);
}

export function clearToken() {
  return AsyncStorage.removeItem(KEYS.authToken);
}

// ----- what happens on a 401 -----

let unauthorizedHandler = null;

// AuthContext.js calls this once:  setUnauthorizedHandler(() => { ...log out... })
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// An Error that also remembers the HTTP status (0 = the server could not be reached).
function makeError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// ----- the request itself -----

async function request(method, path, body) {
  const token = await getToken();

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  // Give up when the server does not answer in time (e.g. a wrong IP address).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (networkError) {
    // For the developer: shows which address was tried.
    console.warn(`KidBuddy API: could not reach ${API_BASE_URL}${path}`, networkError.message);
    throw makeError(0, 'We can’t reach the KidBuddy server. Check your Wi-Fi and try again.');
  } finally {
    clearTimeout(timer);
  }

  // Read the answer. (A 204 answer has no body at all.)
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null; // not JSON (should not happen with our backend)
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      await clearToken();
      if (unauthorizedHandler) unauthorizedHandler();
    }
    const message = data && data.error ? data.error : `Something went wrong (error ${response.status}).`;
    throw makeError(response.status, message);
  }
  return data;
}

// Short names for the 5 kinds of request the app uses.
export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  patch: (path, body = {}) => request('PATCH', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
