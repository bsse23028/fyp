// AUTH VALIDATION - checks the body of the /api/auth/... requests.
// Each function returns a list of problems ([] = all good). See middleware/validate.js.

const { isText, isEmail, isDigits, passwordProblem } = require('./rules');

function emailProblem(email) {
  if (typeof email !== 'string' || !email.trim()) return 'Enter your email address.';
  if (!isEmail(email)) return 'Enter a valid email address.';
  return '';
}

function codeProblem(code) {
  return isDigits(code, 6) ? '' : 'Enter the 6-digit code.';
}

// Keeps only the real problems (drops the empty strings).
function onlyProblems(list) {
  return list.filter(Boolean);
}

function checkSignUp(body) {
  return onlyProblems([
    isText(body.name, 100) ? '' : 'Enter your name (100 characters at most).',
    emailProblem(body.email),
    passwordProblem(body.password),
  ]);
}

function checkVerifyEmail(body) {
  return onlyProblems([emailProblem(body.email), codeProblem(body.code)]);
}

function checkResendCode(body) {
  return onlyProblems([
    emailProblem(body.email),
    ['signup', 'reset_password'].includes(body.purpose) ? '' : 'purpose must be "signup" or "reset_password".',
  ]);
}

function checkLogIn(body) {
  return onlyProblems([
    emailProblem(body.email),
    typeof body.password === 'string' && body.password ? '' : 'Enter your password.',
    body.deviceName === undefined || isText(body.deviceName, 100) ? '' : 'deviceName is too long.',
    body.platform === undefined || isText(body.platform, 20) ? '' : 'platform is too long.',
  ]);
}

function checkForgotPassword(body) {
  return onlyProblems([emailProblem(body.email)]);
}

function checkVerifyResetCode(body) {
  return onlyProblems([emailProblem(body.email), codeProblem(body.code)]);
}

function checkResetPassword(body) {
  return onlyProblems([
    isText(body.resetToken, 2000) ? '' : 'resetToken is missing.',
    passwordProblem(body.newPassword, 'a new password'),
  ]);
}

module.exports = {
  checkSignUp,
  checkVerifyEmail,
  checkResendCode,
  checkLogIn,
  checkForgotPassword,
  checkVerifyResetCode,
  checkResetPassword,
  codeProblem,
  onlyProblems,
};
