// ACCOUNT CONTROLLER - the logged-in parent's name, password and Parent PIN.

const accountService = require('../services/accountService');
const pinService = require('../services/pinService');

async function updateName(req, res) {
  const user = await accountService.updateName(req.user, req.body.name);
  res.status(200).json({ user });
}

async function verifyPassword(req, res) {
  const valid = await accountService.verifyPassword(req.user.id, req.body.password);
  res.status(200).json({ valid });
}

async function sendChangePasswordCode(req, res) {
  await accountService.sendChangePasswordCode(req.user);
  res.status(200).json({ message: 'We sent a 6-digit code to your email.' });
}

async function verifyChangePasswordCode(req, res) {
  await accountService.verifyChangePasswordCode(req.user.id, req.body.code);
  res.status(200).json({ valid: true });
}

async function changePassword(req, res) {
  await accountService.changePassword(req.user.id, req.sessionId, req.body);
  res.status(200).json({ message: 'Your password was changed.' });
}

// ----- Parent PIN -----

async function getPinStatus(req, res) {
  res.status(200).json(await pinService.getPinStatus(req.user.id));
}

async function createPin(req, res) {
  await pinService.createPin(req.user.id, req.body.pin);
  res.status(201).json({ message: 'Parent PIN saved.' });
}

async function verifyPin(req, res) {
  const result = await pinService.checkPinAttempt(req.user.id, req.body.pin);
  res.status(200).json(result);
}

async function changePin(req, res) {
  await pinService.changePin(req.user.id, req.body);
  res.status(200).json({ message: 'Parent PIN updated.' });
}

async function resetPin(req, res) {
  await pinService.resetPin(req.user.id, req.body);
  res.status(200).json({ message: 'Parent PIN saved.' });
}

module.exports = {
  updateName,
  verifyPassword,
  sendChangePasswordCode,
  verifyChangePasswordCode,
  changePassword,
  getPinStatus,
  createPin,
  verifyPin,
  changePin,
  resetPin,
};
