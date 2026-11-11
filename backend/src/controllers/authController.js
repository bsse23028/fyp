// AUTH CONTROLLER - reads the request, calls authService, sends the answer.
// (Controllers stay small: the real work is in the services.)

const authService = require('../services/authService');

// The same message whether the email exists or not (privacy).
const CODE_SENT = 'If the email can receive a code, a 6-digit code is on its way.';

async function signUp(req, res) {
  const result = await authService.signUp(req.body);
  res.status(201).json({ message: 'We sent a 6-digit code to your email.', email: result.email });
}

async function verifyEmail(req, res) {
  const result = await authService.verifyEmail(req.body);
  res.status(200).json(result);
}

async function resendCode(req, res) {
  await authService.resendCode(req.body);
  res.status(200).json({ message: CODE_SENT });
}

async function logIn(req, res) {
  const result = await authService.logIn(req.body);
  res.status(200).json(result);
}

async function logOut(req, res) {
  await authService.logOut(req.sessionId);
  res.status(204).end();
}

async function getMe(req, res) {
  res.status(200).json(await authService.getMe(req.user));
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body);
  res.status(200).json({ message: CODE_SENT });
}

async function verifyResetCode(req, res) {
  const result = await authService.verifyResetCode(req.body);
  res.status(200).json(result);
}

async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  res.status(200).json({ message: 'Your password was changed. Please log in with the new password.' });
}

module.exports = { signUp, verifyEmail, resendCode, logIn, logOut, getMe, forgotPassword, verifyResetCode, resetPassword };
