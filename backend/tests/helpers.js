// TEST HELPERS - small shortcuts used by every test file.

const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/db/connection');
const { sentEmails } = require('../src/services/emailService');

const GOOD_PASSWORD = 'Secret#123';

const api = () => request(app);

// A new email for every test, so tests never get in each other's way.
let counter = 0;
function uniqueEmail() {
  counter += 1;
  return `parent.${Date.now()}.${counter}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

// The Authorization header for a login token.
function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

// The 6-digit code in the LAST email sent to this address (test mode keeps emails in memory).
function lastCodeFor(email) {
  const mail = [...sentEmails].reverse().find((m) => m.to === email);
  return mail ? mail.text.match(/\b(\d{6})\b/)[1] : null;
}

function emailCount(email) {
  return sentEmails.filter((m) => m.to === email).length;
}

// Lets a test ask for a new code straight away (pretends the last code is 2 minutes old).
async function pretendCodesAreOld(email) {
  await query(
    `UPDATE verification_codes vc JOIN users u ON u.id = vc.user_id
        SET vc.created_at = UTC_TIMESTAMP() - INTERVAL 2 MINUTE
      WHERE u.email = ?`,
    [email]
  );
}

// Signs up + verifies a parent. Returns { email, password, name, token, user }.
async function createParent({ name = 'Sara', password = GOOD_PASSWORD } = {}) {
  const email = uniqueEmail();
  await api().post('/api/auth/signup').send({ name, email, password }).expect(201);
  const res = await api().post('/api/auth/verify-email').send({ email, code: lastCodeFor(email) }).expect(200);
  return { email, password, name, token: res.body.token, user: res.body.user };
}

// Creates a child for this parent and returns it.
async function createChild(token, fields = {}) {
  const res = await api()
    .post('/api/children')
    .set(auth(token))
    .send({ name: 'Zara', ageBand: '4–6 years', ...fields })
    .expect(201);
  return res.body.child;
}

module.exports = {
  api,
  auth,
  GOOD_PASSWORD,
  uniqueEmail,
  lastCodeFor,
  emailCount,
  pretendCodesAreOld,
  createParent,
  createChild,
  query,
};
