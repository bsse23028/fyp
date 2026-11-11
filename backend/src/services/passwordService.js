// PASSWORD SERVICE - bcrypt hashing and the password history (table: user_passwords).
//
// bcrypt turns "Secret#123" into a hash like "$2b$10$Kix...". The hash cannot be turned
// back into the password; to check a password we hash the typed one and compare.
// We use the "bcryptjs" package: the same bcrypt algorithm, written in plain JavaScript,
// so it installs on Windows without any C++ build tools.
//
// user_passwords keeps the CURRENT password (is_current = 1) and the OLD ones
// (is_current = NULL), so we can say "choose a password you have not used before".

const bcrypt = require('bcryptjs');
const config = require('../config');
const { query } = require('../db/connection');

// Used for passwords AND for the 4-digit Parent PIN.
function hashSecret(plainText) {
  return bcrypt.hash(plainText, config.bcryptRounds);
}

function compareSecret(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

// { id, password_hash } of the current password, or null.
async function getCurrentPassword(userId) {
  const rows = await query(
    'SELECT id, password_hash FROM user_passwords WHERE user_id = ? AND is_current = 1',
    [userId]
  );
  return rows[0] || null;
}

async function isCurrentPassword(userId, plainPassword) {
  const current = await getCurrentPassword(userId);
  return !!current && (await compareSecret(plainPassword, current.password_hash));
}

// true if this password is the current one or any older one.
async function wasPasswordUsedBefore(userId, plainPassword) {
  const rows = await query('SELECT password_hash FROM user_passwords WHERE user_id = ?', [userId]);
  for (const row of rows) {
    if (await compareSecret(plainPassword, row.password_hash)) return true;
  }
  return false;
}

// Makes `plainPassword` the current password. The old one is kept as history.
async function setNewPassword(run, userId, plainPassword) {
  const hash = await hashSecret(plainPassword);
  await run('UPDATE user_passwords SET is_current = NULL WHERE user_id = ? AND is_current = 1', [userId]);
  await run('INSERT INTO user_passwords (user_id, password_hash, is_current) VALUES (?, ?, 1)', [userId, hash]);
}

module.exports = {
  hashSecret,
  compareSecret,
  getCurrentPassword,
  isCurrentPassword,
  wasPasswordUsedBefore,
  setNewPassword,
};
