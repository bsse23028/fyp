// GATEWAY TESTS - run the website backend against a small FAKE KidBuddy API, so these tests need
// no database. (The real end-to-end check against fyp/backend is described in website/README.md.)
//
//   npm test

const http = require('http');
const express = require('express');

let fakeServer;
let lastRequest = null;

// The fake API remembers the last request it got, so the tests can look at what was forwarded.
function startFakeApi() {
  const fake = express();
  fake.use(express.json());
  fake.use((req, res, next) => {
    lastRequest = { method: req.method, path: req.path, url: req.originalUrl, body: req.body, auth: req.headers.authorization };
    next();
  });
  fake.get('/health', (req, res) => res.json({ status: 'ok' }));
  fake.post('/api/auth/login', (req, res) => {
    if (req.body.password === 'Right#123') return res.json({ token: 'jwt-abc', user: { id: '1', name: 'Sara', email: req.body.email }, hasPin: false });
    res.status(401).json({ error: 'Incorrect email or password.' });
  });
  fake.post('/api/auth/verify-email', (req, res) => res.json({ token: 'jwt-new', user: { id: '2', name: 'Ali', email: req.body.email }, hasPin: false }));
  fake.post('/api/auth/logout', (req, res) => res.status(204).end());
  fake.get('/api/auth/me', (req, res) => {
    if (req.headers.authorization === 'Bearer jwt-abc') return res.json({ user: { id: '1', name: 'Sara', email: 's@x.com' }, hasPin: true });
    res.status(401).json({ error: 'Your login has expired. Please log in again.' });
  });
  fake.post('/api/auth/verify-reset-code', (req, res) => res.json({ resetToken: 'reset-xyz' }));
  fake.post('/api/auth/reset-password', (req, res) => res.json({ message: 'Your password was changed.' }));
  fake.get('/api/children', (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({ error: 'Please log in first.' });
    res.json({ children: [], activeId: null });
  });
  fake.delete('/api/children/:id', (req, res) => res.status(204).end());
  fake.get('/api/options', (req, res) => res.json({ languages: [] }));
  return new Promise((resolve) => {
    fakeServer = http.createServer(fake).listen(0, '127.0.0.1', () => resolve(fakeServer.address().port));
  });
}

let request;
let app;

beforeAll(async () => {
  const port = await startFakeApi();
  process.env.NODE_ENV = 'test';
  process.env.KIDBUDDY_API_URL = `http://127.0.0.1:${port}`;
  process.env.FRONTEND_DIST = '../does-not-exist';
  app = require('../src/app');
  request = require('supertest');
});

afterAll(() => new Promise((resolve) => fakeServer.close(resolve)));

// A browser-like agent: keeps cookies and sends the CSRF header.
async function browser() {
  const agent = request.agent(app);
  const res = await agent.get('/web-api/csrf');
  return { agent, csrf: res.body.csrfToken };
}

describe('security basics', () => {
  test('sets security headers and hides Express', async () => {
    const res = await request(app).get('/web-api/csrf');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('a POST without the CSRF header is refused', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'Right#123' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('csrf');
  });

  test('a POST from a foreign origin is refused', async () => {
    const { agent, csrf } = await browser();
    const res = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrf)
      .set('Origin', 'https://evil.example')
      .send({ email: 'a@b.com', password: 'Right#123' });
    expect(res.status).toBe(403);
  });

  test('unknown API paths are not forwarded', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(404);
  });

  test('health reports the shared API', async () => {
    const res = await request(app).get('/web-api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', gateway: 'ok', api: 'ok' });
  });
});

describe('login session in an httpOnly cookie', () => {
  test('login keeps the token in a cookie and never returns it', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: 's@x.com', password: 'Right#123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user.name).toBe('Sara');
    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('kb_session='));
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(lastRequest.body.platform).toBe('web');

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(lastRequest.auth).toBe('Bearer jwt-abc');
  });

  test('a wrong password passes the API message through', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: 's@x.com', password: 'nope' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Incorrect email or password.');
  });

  test('missing fields are stopped at the gateway', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: 's@x.com' });
    expect(res.status).toBe(400);
  });

  test('verify-email logs the parent in', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/verify-email').set('X-CSRF-Token', csrf).send({ email: 'a@x.com', code: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.headers['set-cookie'].some((c) => c.startsWith('kb_session=jwt-new'))).toBe(true);
  });

  test('me without a cookie is 401 straight away', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('a browser Authorization header is ignored (cookie only)', async () => {
    const res = await request(app).get('/api/children').set('Authorization', 'Bearer stolen');
    expect(res.status).toBe(401);
    expect(lastRequest.auth).toBeUndefined();
  });

  test('logout clears the cookie', async () => {
    const { agent, csrf } = await browser();
    await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: 's@x.com', password: 'Right#123' });
    const res = await agent.post('/api/auth/logout').set('X-CSRF-Token', csrf);
    expect(res.status).toBe(204);
    expect(res.headers['set-cookie'].some((c) => c.startsWith('kb_session=;'))).toBe(true);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
  });
});

describe('password reset token stays server side', () => {
  test('verify-reset-code hides the token; reset-password uses the cookie', async () => {
    const { agent, csrf } = await browser();
    const verify = await agent.post('/api/auth/verify-reset-code').set('X-CSRF-Token', csrf).send({ email: 's@x.com', code: '123456' });
    expect(verify.body).toEqual({ verified: true });

    const reset = await agent.post('/api/auth/reset-password').set('X-CSRF-Token', csrf).send({ newPassword: 'Brand#New9' });
    expect(reset.status).toBe(200);
    expect(lastRequest.body).toEqual({ resetToken: 'reset-xyz', newPassword: 'Brand#New9' });
  });

  test('reset-password without a verified code is refused', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/reset-password').set('X-CSRF-Token', csrf).send({ newPassword: 'Brand#New9' });
    expect(res.status).toBe(400);
  });
});

describe('forwarding', () => {
  test('query strings and 204 answers are forwarded', async () => {
    const { agent, csrf } = await browser();
    await agent.post('/api/auth/login').set('X-CSRF-Token', csrf).send({ email: 's@x.com', password: 'Right#123' });
    const del = await agent.delete('/api/children/7').set('X-CSRF-Token', csrf);
    expect(del.status).toBe(204);

    const opts = await agent.get('/api/options?x=1');
    expect(opts.status).toBe(200);
    expect(lastRequest.url).toBe('/api/options?x=1');
  });

  test('a non-object JSON body is refused', async () => {
    const { agent, csrf } = await browser();
    const res = await agent.post('/api/auth/signup').set('X-CSRF-Token', csrf).send([1, 2]);
    expect(res.status).toBe(400);
  });
});
