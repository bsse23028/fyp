// AUTH TESTS - /api/auth/...

const {
  api,
  auth,
  GOOD_PASSWORD,
  uniqueEmail,
  lastCodeFor,
  emailCount,
  pretendCodesAreOld,
  createParent,
  query,
} = require('./helpers');

describe('POST /api/auth/signup', () => {
  test('creates a pending account, hashes the password and emails a code', async () => {
    const email = uniqueEmail();
    const res = await api()
      .post('/api/auth/signup')
      .send({ name: '  Sara  ', email: `  ${email.toUpperCase()} `, password: GOOD_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email); // trimmed + lowercase
    expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
    expect(JSON.stringify(res.body)).not.toContain(lastCodeFor(email)); // the code only goes by email

    const [user] = await query('SELECT id, name, status FROM users WHERE email = ?', [email]);
    expect(user).toMatchObject({ name: 'Sara', status: 'pending' });
    const [saved] = await query('SELECT password_hash FROM user_passwords WHERE user_id = ?', [user.id]);
    expect(saved.password_hash).toMatch(/^\$2[aby]\$/); // a bcrypt hash
    expect(saved.password_hash).not.toContain(GOOD_PASSWORD);
    expect(lastCodeFor(email)).toMatch(/^\d{6}$/);
  });

  test.each([
    [{ email: 'a@b.co', password: GOOD_PASSWORD }, 'Enter your name'],
    [{ name: 'Sara', email: 'not-an-email', password: GOOD_PASSWORD }, 'valid email'],
    [{ name: 'Sara', email: 'a@b.co', password: 'short' }, 'at least 8'],
    [{ name: 'Sara', email: 'a@b.co', password: 'nouppercase1!' }, 'uppercase'],
    [{ name: 'Sara', email: 'a@b.co', password: 'Has Space1!' }, 'spaces'],
  ])('rejects bad data %# with 400', async (body, message) => {
    const res = await api().post('/api/auth/signup').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(message);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('rejects an email that already has an active account (409)', async () => {
    const parent = await createParent();
    const res = await api().post('/api/auth/signup').send({ name: 'X', email: parent.email, password: GOOD_PASSWORD });
    expect(res.status).toBe(409);
  });

  test('signing up again before verifying updates the details (201)', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'First', email, password: GOOD_PASSWORD }).expect(201);
    await api().post('/api/auth/signup').send({ name: 'Second', email, password: 'Other#456' }).expect(201);
    const [user] = await query('SELECT name FROM users WHERE email = ?', [email]);
    expect(user.name).toBe('Second');
    const users = await query('SELECT id FROM users WHERE email = ?', [email]);
    expect(users).toHaveLength(1);
  });

  test('rejects a body that is not valid JSON (400)', async () => {
    const res = await api().post('/api/auth/signup').set('Content-Type', 'application/json').send('{"name": ');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not valid JSON/);
  });
});

describe('POST /api/auth/verify-email', () => {
  test('a wrong code fails, the right code activates and logs in', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'Sara', email, password: GOOD_PASSWORD });
    const code = lastCodeFor(email);
    const wrong = code === '111111' ? '222222' : '111111';

    const bad = await api().post('/api/auth/verify-email').send({ email, code: wrong });
    expect(bad.status).toBe(400);

    const good = await api().post('/api/auth/verify-email').send({ email, code });
    expect(good.status).toBe(200);
    expect(good.body.token).toEqual(expect.any(String));
    expect(good.body.user).toEqual({ id: expect.any(String), name: 'Sara', email });
    expect(good.body.hasPin).toBe(false);

    const [user] = await query('SELECT status, email_verified_at FROM users WHERE email = ?', [email]);
    expect(user.status).toBe('active');
    expect(user.email_verified_at).not.toBeNull();

    const again = await api().post('/api/auth/verify-email').send({ email, code });
    expect(again.status).toBe(409);
  });

  test('stops after 5 wrong codes (429)', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'Sara', email, password: GOOD_PASSWORD });
    const code = lastCodeFor(email);
    const wrong = code === '111111' ? '222222' : '111111';
    for (let i = 0; i < 5; i++) {
      await api().post('/api/auth/verify-email').send({ email, code: wrong }).expect(400);
    }
    const res = await api().post('/api/auth/verify-email').send({ email, code });
    expect(res.status).toBe(429);
  });

  test('an expired code is refused (400)', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'Sara', email, password: GOOD_PASSWORD });
    await query(
      `UPDATE verification_codes vc JOIN users u ON u.id = vc.user_id
          SET vc.expires_at = UTC_TIMESTAMP() - INTERVAL 1 MINUTE WHERE u.email = ?`,
      [email]
    );
    const res = await api().post('/api/auth/verify-email').send({ email, code: lastCodeFor(email) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/expired/);
  });

  test('unknown email or badly formed code (400)', async () => {
    expect((await api().post('/api/auth/verify-email').send({ email: uniqueEmail(), code: '123456' })).status).toBe(400);
    expect((await api().post('/api/auth/verify-email').send({ email: uniqueEmail(), code: '12' })).status).toBe(400);
  });
});

describe('POST /api/auth/resend-code', () => {
  test('waits a minute between codes, then sends a new one that replaces the old one', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'Sara', email, password: GOOD_PASSWORD });
    const firstCode = lastCodeFor(email);

    const tooSoon = await api().post('/api/auth/resend-code').send({ email, purpose: 'signup' });
    expect(tooSoon.status).toBe(200);
    expect(emailCount(email)).toBe(1); // nothing new was sent

    await pretendCodesAreOld(email);
    await api().post('/api/auth/resend-code').send({ email, purpose: 'signup' }).expect(200);
    expect(emailCount(email)).toBe(2);
    const newCode = lastCodeFor(email);

    if (newCode !== firstCode) {
      await api().post('/api/auth/verify-email').send({ email, code: firstCode }).expect(400);
    }
    await api().post('/api/auth/verify-email').send({ email, code: newCode }).expect(200);
  });

  test('answers the same for an unknown email and sends nothing', async () => {
    const email = uniqueEmail();
    const res = await api().post('/api/auth/resend-code').send({ email, purpose: 'signup' });
    expect(res.status).toBe(200);
    expect(emailCount(email)).toBe(0);
  });

  test('rejects an unknown purpose (400)', async () => {
    const res = await api().post('/api/auth/resend-code').send({ email: uniqueEmail(), purpose: 'other' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with the right details (email is not case sensitive)', async () => {
    const parent = await createParent();
    const res = await api()
      .post('/api/auth/login')
      .send({ email: parent.email.toUpperCase(), password: GOOD_PASSWORD, deviceName: 'Pixel', platform: 'android' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: parent.user.id, name: 'Sara', email: parent.email });
    expect(res.body.hasPin).toBe(false);
    expect(JSON.stringify(res.body)).not.toMatch(/hash/i);
  });

  test('wrong password or unknown email gives the same 401', async () => {
    const parent = await createParent();
    const wrongPassword = await api().post('/api/auth/login').send({ email: parent.email, password: 'Wrong#123' });
    const unknown = await api().post('/api/auth/login').send({ email: uniqueEmail(), password: GOOD_PASSWORD });
    expect(wrongPassword.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPassword.body.error).toBe(unknown.body.error);
  });

  test('an account that is not verified yet gets 403 + needsVerification', async () => {
    const email = uniqueEmail();
    await api().post('/api/auth/signup').send({ name: 'Sara', email, password: GOOD_PASSWORD });
    const res = await api().post('/api/auth/login').send({ email, password: GOOD_PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.needsVerification).toBe(true);
  });

  test('missing fields (400)', async () => {
    expect((await api().post('/api/auth/login').send({})).status).toBe(400);
  });
});

describe('GET /api/auth/me and POST /api/auth/logout', () => {
  test('me works with a token and fails without one', async () => {
    const parent = await createParent();
    const me = await api().get('/api/auth/me').set(auth(parent.token));
    expect(me.status).toBe(200);
    expect(me.body).toEqual({ user: parent.user, hasPin: false });

    expect((await api().get('/api/auth/me')).status).toBe(401);
    expect((await api().get('/api/auth/me').set(auth('not-a-real-token'))).status).toBe(401);
    expect((await api().get('/api/auth/me').set({ Authorization: parent.token })).status).toBe(401); // no "Bearer"
  });

  test('logout ends this login on the server (204, then 401)', async () => {
    const parent = await createParent();
    await api().post('/api/auth/logout').set(auth(parent.token)).expect(204);
    expect((await api().get('/api/auth/me').set(auth(parent.token))).status).toBe(401);
    expect((await api().post('/api/auth/logout')).status).toBe(401);
  });
});

describe('forgot password: /forgot-password, /verify-reset-code, /reset-password', () => {
  async function startReset(parent) {
    await api().post('/api/auth/forgot-password').send({ email: parent.email }).expect(200);
    const res = await api().post('/api/auth/verify-reset-code').send({ email: parent.email, code: lastCodeFor(parent.email) });
    expect(res.status).toBe(200);
    return res.body.resetToken;
  }

  test('the full flow changes the password and logs out every device', async () => {
    const parent = await createParent();
    const resetToken = await startReset(parent);

    const reused = await api().post('/api/auth/reset-password').send({ resetToken, newPassword: GOOD_PASSWORD });
    expect(reused.status).toBe(400);
    expect(reused.body.error).toMatch(/haven't used before/);

    const res = await api().post('/api/auth/reset-password').send({ resetToken, newPassword: 'Brand#New9' });
    expect(res.status).toBe(200);

    expect((await api().get('/api/auth/me').set(auth(parent.token))).status).toBe(401);
    await api().post('/api/auth/login').send({ email: parent.email, password: GOOD_PASSWORD }).expect(401);
    await api().post('/api/auth/login').send({ email: parent.email, password: 'Brand#New9' }).expect(200);

    // The same reset token cannot be used twice.
    const twice = await api().post('/api/auth/reset-password').send({ resetToken, newPassword: 'Another#New9' });
    expect(twice.status).toBe(400);
  });

  test('an unknown email gets the same answer and no email', async () => {
    const email = uniqueEmail();
    const res = await api().post('/api/auth/forgot-password').send({ email });
    expect(res.status).toBe(200);
    expect(emailCount(email)).toBe(0);
  });

  test('a wrong reset code (400) and a fake reset token (400)', async () => {
    const parent = await createParent();
    await api().post('/api/auth/forgot-password').send({ email: parent.email });
    const code = lastCodeFor(parent.email);
    const wrong = code === '111111' ? '222222' : '111111';
    expect((await api().post('/api/auth/verify-reset-code').send({ email: parent.email, code: wrong })).status).toBe(400);
    expect((await api().post('/api/auth/reset-password').send({ resetToken: 'fake', newPassword: 'Brand#New9' })).status).toBe(400);
  });

  test('a reset token is not a login token (401)', async () => {
    const parent = await createParent();
    const resetToken = await startReset(parent);
    expect((await api().get('/api/auth/me').set(auth(resetToken))).status).toBe(401);
  });
});

describe('general', () => {
  test('an unknown endpoint gives 404 JSON', async () => {
    const res = await api().get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  test('GET /health', async () => {
    const res = await api().get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
