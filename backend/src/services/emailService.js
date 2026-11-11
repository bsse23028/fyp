// EMAIL SERVICE - sends the 6-digit codes.
//
// EMAIL_MODE in .env decides HOW:
//   console  the email is printed in the server terminal (development on your own computer,
//            the same idea as DEMO_MODE in the app)
//   smtp     the email is really sent with the SMTP settings (Gmail, Mailtrap, your host ...)
//   test     (automatic while running the tests) the email is kept in `sentEmails`,
//            so a test can read the code
//
// The code itself is NEVER put in an API response.

const nodemailer = require('nodemailer');
const config = require('../config');
const HttpError = require('../utils/HttpError');

const sentEmails = []; // only filled in test mode
let transporter = null; // created the first time an SMTP email is sent

const SUBJECTS = {
  signup: 'Your KidBuddy sign-up code',
  reset_password: 'Your KidBuddy password reset code',
  change_password: 'Your KidBuddy code to change your password',
};

async function sendEmail(to, subject, text) {
  if (config.email.mode === 'test') {
    sentEmails.push({ to, subject, text });
    return;
  }

  if (config.email.mode === 'console') {
    console.log(`\n----- EMAIL to ${to} -----\nSubject: ${subject}\n\n${text}\n--------------------------\n`);
    return;
  }

  if (!transporter) {
    const { host, port, secure, user, pass } = config.email.smtp;
    transporter = nodemailer.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined });
  }
  try {
    await transporter.sendMail({ from: config.email.from, to, subject, text });
  } catch (error) {
    console.error('Could not send email:', error.message);
    throw new HttpError(502, 'We could not send the email right now. Please try again.');
  }
}

async function sendCodeEmail(to, code, purpose) {
  const text =
    `Your KidBuddy code is ${code}.\n\n` +
    `It works for ${config.codes.lifetimeMinutes} minutes.\n` +
    'If you did not ask for this code, you can ignore this email.';
  await sendEmail(to, SUBJECTS[purpose], text);
}

module.exports = { sendCodeEmail, sentEmails };
