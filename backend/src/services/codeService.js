// CODE SERVICE - the 6-digit email codes (table: verification_codes).
//
// purpose is one of: 'signup', 'reset_password', 'change_password'
//
// Rules:
//   - only the SHA-256 hash of a code is saved, never the code itself
//   - a code works for 10 minutes and allows 5 wrong tries
//   - asking for a new code makes the old one stop working
//   - a code can be used only once (consumed_at is set)

const crypto = require('crypto');
const config = require('../config');
const { query } = require('../db/connection');
const HttpError = require('../utils/HttpError');
const { sha256 } = require('./tokenService');

const WRONG_CODE = "That code isn't right. Check it and try again.";

// Makes a new code, saves its hash, and returns the code (so it can be emailed).
async function createCode(run, userId, purpose) {
  // The older codes for the same thing stop working.
  await run(
    'UPDATE verification_codes SET consumed_at = UTC_TIMESTAMP() WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL',
    [userId, purpose]
  );

  const code = String(crypto.randomInt(100000, 1000000)); // 100000 ... 999999
  await run(
    `INSERT INTO verification_codes (user_id, purpose, code_hash, expires_at, created_at)
     VALUES (?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE, UTC_TIMESTAMP())`,
    [userId, purpose, sha256(code), config.codes.lifetimeMinutes]
  );
  return code;
}

// true when a code was sent less than a minute ago (stops email spam).
async function wasCodeSentRecently(userId, purpose) {
  const rows = await query(
    `SELECT id FROM verification_codes
      WHERE user_id = ? AND purpose = ? AND created_at > UTC_TIMESTAMP() - INTERVAL ? SECOND`,
    [userId, purpose, config.codes.resendWaitSeconds]
  );
  return rows.length > 0;
}

// Checks a typed code. Throws a 400 / 429 error when it is wrong, otherwise returns the code's id.
// It does NOT use a transaction on purpose: a wrong try must be counted even when we throw.
async function checkCode(userId, purpose, typedCode) {
  const rows = await query(
    `SELECT id, code_hash, attempts, expires_at < UTC_TIMESTAMP() AS is_expired
       FROM verification_codes
      WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL
      ORDER BY id DESC
      LIMIT 1`,
    [userId, purpose]
  );
  if (rows.length === 0) throw new HttpError(400, WRONG_CODE);

  const saved = rows[0];
  if (saved.is_expired) throw new HttpError(400, 'That code has expired. Ask for a new one.');
  if (saved.attempts >= config.codes.maxAttempts) {
    throw new HttpError(429, 'Too many wrong tries. Ask for a new code.');
  }

  const typedHash = Buffer.from(sha256(typedCode));
  const savedHash = Buffer.from(saved.code_hash);
  if (!crypto.timingSafeEqual(typedHash, savedHash)) {
    await query('UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?', [saved.id]);
    throw new HttpError(400, WRONG_CODE);
  }
  return saved.id;
}

// Marks a code as used, so it cannot be used again.
async function consumeCode(run, codeId) {
  await run('UPDATE verification_codes SET consumed_at = UTC_TIMESTAMP() WHERE id = ?', [codeId]);
}

module.exports = { createCode, wasCodeSentRecently, checkCode, consumeCode, WRONG_CODE };
