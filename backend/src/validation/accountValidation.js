// ACCOUNT VALIDATION - checks the body of the /api/account/... requests.

const { isText, isDigits, passwordProblem } = require('./rules');
const { codeProblem, onlyProblems } = require('./authValidation');

function pinProblem(pin, label) {
  return isDigits(pin, 4) ? '' : `${label} must be 4 digits.`;
}

function checkUpdateName(body) {
  return onlyProblems([isText(body.name, 100) ? '' : 'Enter your name (100 characters at most).']);
}

function checkPassword(body) {
  return onlyProblems([typeof body.password === 'string' && body.password ? '' : 'Enter your password.']);
}

function checkCodeOnly(body) {
  return onlyProblems([codeProblem(body.code)]);
}

function checkChangePassword(body) {
  return onlyProblems([
    typeof body.oldPassword === 'string' && body.oldPassword ? '' : 'Enter your old password.',
    passwordProblem(body.newPassword, 'a new password'),
    codeProblem(body.code),
  ]);
}

function checkCreatePin(body) {
  return onlyProblems([pinProblem(body.pin, 'The PIN')]);
}

function checkVerifyPin(body) {
  return onlyProblems([pinProblem(body.pin, 'The PIN')]);
}

function checkChangePin(body) {
  return onlyProblems([pinProblem(body.oldPin, 'The old PIN'), pinProblem(body.newPin, 'The new PIN')]);
}

function checkResetPin(body) {
  return onlyProblems([
    typeof body.password === 'string' && body.password ? '' : 'Enter your account password.',
    pinProblem(body.newPin, 'The new PIN'),
  ]);
}

module.exports = {
  checkUpdateName,
  checkPassword,
  checkCodeOnly,
  checkChangePassword,
  checkCreatePin,
  checkVerifyPin,
  checkChangePin,
  checkResetPin,
};
