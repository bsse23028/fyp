// VALIDATION - the same front-end checks as the mobile app (src/shared/utils/validation.js).
// Each function returns an error message, or '' when everything is fine.
// The shared API checks everything again on the server.

export function emailError(email) {
  if (!email.trim()) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
  return '';
}

export function nameError(name) {
  return name.trim() ? '' : 'Enter your name.';
}

// Edit this one list to change the rules: the error and the checklist both follow it.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (! @ # $ % ...)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'space', label: 'No spaces', test: (p) => p.length > 0 && !/\s/.test(p) },
];

export function passwordChecks(password) {
  return PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, ok: rule.test(password) }));
}

// For the Create account strength bar: how many of the rules are met, how many bars to fill (of 4) and their colour.
// 5 or 6 rules met = green, fewer = amber. Nothing here changes what is allowed; passwordError() above still decides.
export function passwordStrength(password) {
  const met = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const bars = Math.round((met * 4) / PASSWORD_RULES.length);
  return { met, total: PASSWORD_RULES.length, bars, tone: met >= 5 ? 'good' : 'mid' };
}

export function passwordError(password) {
  if (!password) return 'Enter a password.';
  if (password.length > 72) return 'Use at most 72 characters.';
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) return 'Your password does not follow all the rules yet.';
  return '';
}

export const PIN_FORMAT = /^\d{4}$/;
