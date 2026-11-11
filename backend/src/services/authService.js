// AUTH SERVICE - sign up, email verification, log in / out, forgot password.
// (These replace the functions of AuthContext.js in the app.)
//
// SIGN UP FLOW
//   signUp()       -> account saved with status 'pending' + a code is emailed
//   verifyEmail()  -> the code is right: status 'active', and the parent is logged in
//
// FORGOT PASSWORD FLOW
//   forgotPassword()   -> a code is emailed (if the account exists)
//   verifyResetCode()  -> the code is right: returns a short-lived resetToken
//   resetPassword()    -> resetToken + new password: the password is changed

const { query, withTransaction } = require('../db/connection');
const HttpError = require('../utils/HttpError');
const passwordService = require('./passwordService');
const codeService = require('./codeService');
const tokenService = require('./tokenService');
const emailService = require('./emailService');

// Makes "  Sarah@Email.com " and "sarah@email.com" the same email (as the app does).
function cleanEmail(email) {
  return email.trim().toLowerCase();
}

// The ONLY user fields the app ever receives (never the password hash).
function publicUser(row) {
  return { id: String(row.id), name: row.name, email: row.email };
}

async function findUserByEmail(email) {
  const rows = await query('SELECT id, name, email, status FROM users WHERE email = ?', [cleanEmail(email)]);
  return rows[0] || null;
}

async function hasPin(userId) {
  const rows = await query('SELECT user_id FROM parent_pins WHERE user_id = ?', [userId]);
  return rows.length > 0;
}

// Creates a code and emails it, unless one was sent less than a minute ago.
async function sendCodeIfAllowed(user, purpose) {
  if (await codeService.wasCodeSentRecently(user.id, purpose)) return;
  const code = await withTransaction((run) => codeService.createCode(run, user.id, purpose));
  await emailService.sendCodeEmail(user.email, code, purpose);
}

// ---------- SIGN UP ----------

async function signUp({ name, email, password }) {
  const cleanedEmail = cleanEmail(email);
  const existing = await findUserByEmail(cleanedEmail);
  if (existing && existing.status !== 'pending') {
    throw new HttpError(409, 'An account with this email already exists. Try logging in.');
  }

  const passwordHash = await passwordService.hashSecret(password);
  const userId = await withTransaction(async (run) => {
    if (existing) {
      // Signed up before but never typed the code: update the details and send a code again.
      await run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), existing.id]);
      await run('UPDATE user_passwords SET password_hash = ? WHERE user_id = ? AND is_current = 1', [
        passwordHash,
        existing.id,
      ]);
      return existing.id;
    }
    const result = await run("INSERT INTO users (name, email, status) VALUES (?, ?, 'pending')", [
      name.trim(),
      cleanedEmail,
    ]);
    await run('INSERT INTO user_passwords (user_id, password_hash, is_current) VALUES (?, ?, 1)', [
      result.insertId,
      passwordHash,
    ]);
    return result.insertId;
  });

  await sendCodeIfAllowed({ id: userId, email: cleanedEmail }, 'signup');
  return { email: cleanedEmail };
}

async function verifyEmail({ email, code, deviceName, platform }) {
  const user = await findUserByEmail(email);
  if (!user) throw new HttpError(400, codeService.WRONG_CODE);
  if (user.status === 'active') throw new HttpError(409, 'This email is already verified. Please log in.');
  if (user.status === 'disabled') throw new HttpError(403, 'This account has been disabled.');

  const codeId = await codeService.checkCode(user.id, 'signup', code);
  const token = await withTransaction(async (run) => {
    await codeService.consumeCode(run, codeId);
    await run("UPDATE users SET status = 'active', email_verified_at = UTC_TIMESTAMP() WHERE id = ?", [user.id]);
    return tokenService.createLoginToken(run, user.id, { deviceName, platform });
  });
  return { token, user: publicUser(user), hasPin: false };
}

// "Resend code" link. The answer is always the same, so nobody can test which emails exist.
async function resendCode({ email, purpose }) {
  const user = await findUserByEmail(email);
  const allowedStatus = purpose === 'signup' ? 'pending' : 'active';
  if (user && user.status === allowedStatus) {
    await sendCodeIfAllowed(user, purpose);
  }
}

// ---------- LOG IN / LOG OUT ----------

async function logIn({ email, password, deviceName, platform }) {
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.status, p.password_hash
       FROM users u
       JOIN user_passwords p ON p.user_id = u.id AND p.is_current = 1
      WHERE u.email = ?`,
    [cleanEmail(email)]
  );
  const user = rows[0];
  if (!user || !(await passwordService.compareSecret(password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  if (user.status === 'pending') {
    throw new HttpError(403, 'Please verify your email first. We can send you a new code.', {
      needsVerification: true,
    });
  }
  if (user.status === 'disabled') throw new HttpError(403, 'This account has been disabled.');

  const token = await tokenService.createLoginToken(query, user.id, { deviceName, platform });
  return { token, user: publicUser(user), hasPin: await hasPin(user.id) };
}

async function logOut(sessionId) {
  await tokenService.revokeSession(sessionId);
}

async function getMe(user) {
  return { user: publicUser(user), hasPin: await hasPin(user.id) };
}

// ---------- FORGOT PASSWORD ----------

// Same answer whether the email exists or not (it does not reveal who has an account).
async function forgotPassword({ email }) {
  const user = await findUserByEmail(email);
  if (user && user.status === 'active') {
    await sendCodeIfAllowed(user, 'reset_password');
  }
}

async function verifyResetCode({ email, code }) {
  const user = await findUserByEmail(email);
  if (!user || user.status !== 'active') throw new HttpError(400, codeService.WRONG_CODE);

  const codeId = await codeService.checkCode(user.id, 'reset_password', code);
  await codeService.consumeCode(query, codeId);
  const current = await passwordService.getCurrentPassword(user.id);
  return { resetToken: tokenService.createResetToken(user.id, current.id) };
}

async function resetPassword({ resetToken, newPassword }) {
  const reset = tokenService.readResetToken(resetToken);
  if (!reset) throw new HttpError(400, 'This password reset has expired. Please start again.');

  const current = await passwordService.getCurrentPassword(reset.userId);
  if (!current || current.id !== reset.passwordId) {
    throw new HttpError(400, 'This password reset was already used. Please start again.');
  }
  if (await passwordService.wasPasswordUsedBefore(reset.userId, newPassword)) {
    throw new HttpError(400, "Choose a password you haven't used before.");
  }

  await withTransaction(async (run) => {
    await passwordService.setNewPassword(run, reset.userId, newPassword);
    // A new password logs out every device (somebody else may have known the old one).
    await tokenService.revokeOtherSessions(run, reset.userId);
  });
}

module.exports = {
  cleanEmail,
  publicUser,
  signUp,
  verifyEmail,
  resendCode,
  logIn,
  logOut,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
