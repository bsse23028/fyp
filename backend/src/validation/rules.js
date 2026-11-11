// RULES - small yes/no checks shared by every validation file.
// Each one returns true when the value is OK.

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A piece of text with a length between min and max (spaces at the ends do not count).
function isText(value, max, min = 1) {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

// Text that may also be empty ('' is allowed).
function isOptionalText(value, max) {
  return value === undefined || value === null || isText(value, max, 0);
}

function isEmail(value) {
  return isText(value, 190) && EMAIL_FORMAT.test(value.trim());
}

// Exactly `length` digits, e.g. a 6-digit code or a 4-digit PIN.
function isDigits(value, length) {
  return typeof value === 'string' && new RegExp(`^\\d{${length}}$`).test(value);
}

// A list of short texts, e.g. ['Reading', 'Writing'].
function isTextList(value, maxItems, maxLength) {
  return (
    Array.isArray(value) && value.length <= maxItems && value.every((item) => isText(item, maxLength))
  );
}

function isWholeNumber(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// The SAME password rules as the app (src/shared/utils/validation.js in the frontend).
// bcrypt only looks at the first 72 bytes, so longer passwords are refused.
const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, message: 'The password needs at least 8 characters.' },
  { test: (p) => /[A-Z]/.test(p), message: 'The password needs one uppercase letter (A-Z).' },
  { test: (p) => /[a-z]/.test(p), message: 'The password needs one lowercase letter (a-z).' },
  { test: (p) => /\d/.test(p), message: 'The password needs one number (0-9).' },
  { test: (p) => /[^A-Za-z0-9\s]/.test(p), message: 'The password needs one special character (! @ # $ % ...).' },
  { test: (p) => !/\s/.test(p), message: 'The password cannot contain spaces.' },
  { test: (p) => Buffer.byteLength(p, 'utf8') <= 72, message: 'The password is too long (72 characters at most).' },
];

// '' when the password is fine, otherwise the first broken rule.
function passwordProblem(password, label = 'a password') {
  if (typeof password !== 'string' || password.length === 0) return `Enter ${label}.`;
  const broken = PASSWORD_RULES.find((rule) => !rule.test(password));
  return broken ? broken.message : '';
}

module.exports = {
  isText,
  isOptionalText,
  isEmail,
  isDigits,
  isTextList,
  isWholeNumber,
  isPlainObject,
  passwordProblem,
};
