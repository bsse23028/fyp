// VALIDATION - simple front-end checks. Each function returns an error
// message (a string) when something is wrong, or '' when everything is fine.

export function emailError(email) {
  if (!email.trim()) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address.';
  }
  return '';
}

export function nameError(name) {
  return name.trim() ? '' : 'Enter your name.';
}

// PASSWORD RULES - used by sign-up, reset password and change password.
// To add or remove a rule, edit this one list: the error message and the
// checklist under the password box both follow it automatically.
export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (! @ # $ % ...)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'space', label: 'No spaces', test: (p) => p.length > 0 && !/\s/.test(p) },
];

// The checklist: [{ id, label, ok }] for the typed password.
export function passwordChecks(password) {
  return PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, ok: rule.test(password) }));
}

// '' when the password follows every rule, otherwise one error message.
export function passwordError(password) {
  if (!password) return 'Enter a password.';
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) {
    return 'Your password does not follow all the rules yet.';
  }
  return '';
}

// Makes "  Sarah@Email.com " and "sarah@email.com" count as the same email.
export function cleanEmail(email) {
  return email.trim().toLowerCase();
}
