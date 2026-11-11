// PIN SERVICE - the 4-digit Parent PIN that guards the way out of Child Mode (table: parent_pins).
//
// A 4-digit PIN has only 10 000 possibilities, so it is protected twice:
//   - it is saved as a bcrypt hash (never as plain digits)
//   - after 5 wrong PINs in a row it is locked for 5 minutes (failed_attempts / locked_until)

const config = require('../config');
const { query } = require('../db/connection');
const HttpError = require('../utils/HttpError');
const passwordService = require('./passwordService');

async function findPin(userId) {
  const rows = await query(
    `SELECT pin_hash, failed_attempts, locked_until,
            (locked_until IS NOT NULL AND locked_until > UTC_TIMESTAMP()) AS is_locked
       FROM parent_pins WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function getPinStatus(userId) {
  const pin = await findPin(userId);
  return { hasPin: !!pin, lockedUntil: pin && pin.is_locked ? pin.locked_until : null };
}

// First PIN of the account (the app asks for it the first time Child Mode is left).
async function createPin(userId, pin) {
  if (await findPin(userId)) {
    throw new HttpError(409, 'A Parent PIN already exists. Use "Change PIN" instead.');
  }
  const pinHash = await passwordService.hashSecret(pin);
  await query('INSERT INTO parent_pins (user_id, pin_hash) VALUES (?, ?)', [userId, pinHash]);
}

// Checks a typed PIN and counts wrong tries.
// Returns { valid: true } or { valid: false, attemptsLeft, lockedUntil }.
// Throws 429 while the PIN is locked, 404 when there is no PIN yet.
async function checkPinAttempt(userId, typedPin) {
  const pin = await findPin(userId);
  if (!pin) throw new HttpError(404, 'No Parent PIN has been created yet.');
  if (pin.is_locked) {
    throw new HttpError(429, 'Too many wrong PINs. Please wait a few minutes and try again.', {
      lockedUntil: pin.locked_until,
    });
  }

  if (await passwordService.compareSecret(typedPin, pin.pin_hash)) {
    await query('UPDATE parent_pins SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [userId]);
    return { valid: true };
  }

  const failed = pin.failed_attempts + 1;
  if (failed >= config.pin.maxAttempts) {
    await query(
      'UPDATE parent_pins SET failed_attempts = 0, locked_until = UTC_TIMESTAMP() + INTERVAL ? MINUTE WHERE user_id = ?',
      [config.pin.lockMinutes, userId]
    );
    const status = await getPinStatus(userId);
    return { valid: false, attemptsLeft: 0, lockedUntil: status.lockedUntil };
  }
  await query('UPDATE parent_pins SET failed_attempts = ? WHERE user_id = ?', [failed, userId]);
  return { valid: false, attemptsLeft: config.pin.maxAttempts - failed, lockedUntil: null };
}

async function changePin(userId, { oldPin, newPin }) {
  const result = await checkPinAttempt(userId, oldPin);
  if (!result.valid) {
    throw new HttpError(400, 'Your old PIN is not right.', { attemptsLeft: result.attemptsLeft });
  }
  if (oldPin === newPin) throw new HttpError(400, 'Choose a PIN you have not used before.');

  const pinHash = await passwordService.hashSecret(newPin);
  await query('UPDATE parent_pins SET pin_hash = ?, failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [
    pinHash,
    userId,
  ]);
}

// "Forgot PIN?": the account password proves it is really the parent.
async function resetPin(userId, { password, newPin }) {
  if (!(await passwordService.isCurrentPassword(userId, password))) {
    throw new HttpError(400, 'Your password is not right.');
  }
  const pinHash = await passwordService.hashSecret(newPin);
  await query(
    `INSERT INTO parent_pins (user_id, pin_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE pin_hash = ?, failed_attempts = 0, locked_until = NULL`,
    [userId, pinHash, pinHash]
  );
}

module.exports = { getPinStatus, createPin, checkPinAttempt, changePin, resetPin };
