// TOKEN SERVICE - login tokens (JWT) and the logins saved in the user_sessions table.
//
// HOW A LOGIN WORKS
//   1. On log in we make a random "session key" and save its SHA-256 hash in user_sessions
//      (the schema calls the column refresh_token_hash; it holds the hash of this key).
//   2. The app gets a JWT that contains { userId, sessionKey }, signed with JWT_SECRET.
//   3. On every request, middleware/auth.js checks the signature, then checks that the
//      session row still exists, is not revoked (logged out) and is not expired.
// Because of step 3, "log out" and "change password" really end a login on the server,
// even if somebody kept a copy of the token.

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db/connection');

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Creates a login for this user and returns the JWT for the app.
// `run` is `query` or the `run` of a transaction.
async function createLoginToken(run, userId, device = {}) {
  const sessionKey = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign({ userId, sessionKey }, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.expiresIn,
  });
  const expiresAt = new Date(jwt.decode(token).exp * 1000);

  await run(
    `INSERT INTO user_sessions (user_id, refresh_token_hash, device_name, platform, last_used_at, expires_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), ?)`,
    [userId, sha256(sessionKey), device.deviceName || null, device.platform || null, expiresAt]
  );
  return token;
}

// Returns { sessionId, user: { id, name, email } } for a valid login token, otherwise null.
async function findSessionForToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
  } catch (error) {
    return null; // wrong signature, expired, or not a JWT at all
  }
  if (!payload.userId || !payload.sessionKey || payload.purpose) return null; // a reset token is not a login

  const rows = await query(
    `SELECT s.id AS session_id, u.id, u.name, u.email
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.refresh_token_hash = ?
        AND s.revoked_at IS NULL
        AND s.expires_at > UTC_TIMESTAMP()
        AND u.status = 'active'`,
    [sha256(payload.sessionKey)]
  );
  if (rows.length === 0 || rows[0].id !== payload.userId) return null;

  const row = rows[0];
  await query('UPDATE user_sessions SET last_used_at = UTC_TIMESTAMP() WHERE id = ?', [row.session_id]);
  return { sessionId: row.session_id, user: { id: row.id, name: row.name, email: row.email } };
}

// Log out of ONE login.
async function revokeSession(sessionId) {
  await query('UPDATE user_sessions SET revoked_at = UTC_TIMESTAMP() WHERE id = ? AND revoked_at IS NULL', [sessionId]);
}

// Log out of every login of this user, except (optionally) the one making the request.
async function revokeOtherSessions(run, userId, keepSessionId = 0) {
  await run(
    'UPDATE user_sessions SET revoked_at = UTC_TIMESTAMP() WHERE user_id = ? AND id <> ? AND revoked_at IS NULL',
    [userId, keepSessionId]
  );
}

// A short-lived token that only allows "choose a new password" (forgot-password flow).
// It remembers which password was current, so it can be used only ONCE.
function createResetToken(userId, passwordId) {
  return jwt.sign({ userId, passwordId, purpose: 'reset_password' }, config.jwt.secret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.resetExpiresIn,
  });
}

// Returns { userId, passwordId } or null if the token is wrong / expired.
function readResetToken(token) {
  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    return payload.purpose === 'reset_password' ? payload : null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  sha256,
  createLoginToken,
  findSessionForToken,
  revokeSession,
  revokeOtherSessions,
  createResetToken,
  readResetToken,
};
