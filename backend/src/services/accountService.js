// ACCOUNT SERVICE - the logged-in parent changes their name or password.
// (The Parent PIN is in pinService.js.)
//
// Changing the password needs TWO proofs, as in the app:
//   the old password  AND  a 6-digit code sent to the parent's email.

const { query, withTransaction } = require('../db/connection');
const HttpError = require('../utils/HttpError');
const passwordService = require('./passwordService');
const codeService = require('./codeService');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const { publicUser } = require('./authService');

async function updateName(user, newName) {
  const name = newName.trim();
  await query('UPDATE users SET name = ? WHERE id = ?', [name, user.id]);
  return publicUser({ ...user, name });
}

// "Is this my password?" (used before sending the change code, and by "Forgot PIN?").
async function verifyPassword(userId, password) {
  return passwordService.isCurrentPassword(userId, password);
}

async function sendChangePasswordCode(user) {
  if (await codeService.wasCodeSentRecently(user.id, 'change_password')) {
    throw new HttpError(429, 'Please wait a minute before asking for a new code.');
  }
  const code = await withTransaction((run) => codeService.createCode(run, user.id, 'change_password'));
  await emailService.sendCodeEmail(user.email, code, 'change_password');
}

// Step 1 of the change: is the code right? (It is NOT used up yet.)
async function verifyChangePasswordCode(userId, code) {
  await codeService.checkCode(userId, 'change_password', code);
}

async function changePassword(userId, sessionId, { oldPassword, newPassword, code }) {
  if (!(await passwordService.isCurrentPassword(userId, oldPassword))) {
    throw new HttpError(400, 'Your old password is not right.');
  }
  if (await passwordService.wasPasswordUsedBefore(userId, newPassword)) {
    throw new HttpError(400, 'Choose a password you have not used before.');
  }
  const codeId = await codeService.checkCode(userId, 'change_password', code);

  await withTransaction(async (run) => {
    await codeService.consumeCode(run, codeId);
    await passwordService.setNewPassword(run, userId, newPassword);
    // Other phones are logged out; this phone stays logged in.
    await tokenService.revokeOtherSessions(run, userId, sessionId);
  });
}

module.exports = { updateName, verifyPassword, sendChangePasswordCode, verifyChangePasswordCode, changePassword };
