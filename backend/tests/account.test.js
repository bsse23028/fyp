// ACCOUNT TESTS - /api/account/... (name, password, Parent PIN)

const { api, auth, GOOD_PASSWORD, lastCodeFor, createParent, query } = require('./helpers');

describe('PATCH /api/account (name)', () => {
  test('changes the name', async () => {
    const parent = await createParent();
    const res = await api().patch('/api/account').set(auth(parent.token)).send({ name: '  Sara Khan ' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: parent.user.id, name: 'Sara Khan', email: parent.email });
  });

  test('rejects an empty name (400) and a missing login (401)', async () => {
    const parent = await createParent();
    expect((await api().patch('/api/account').set(auth(parent.token)).send({ name: '   ' })).status).toBe(400);
    expect((await api().patch('/api/account').send({ name: 'X' })).status).toBe(401);
  });
});

describe('POST /api/account/verify-password', () => {
  test('says whether the password is right', async () => {
    const parent = await createParent();
    const right = await api().post('/api/account/verify-password').set(auth(parent.token)).send({ password: GOOD_PASSWORD });
    const wrong = await api().post('/api/account/verify-password').set(auth(parent.token)).send({ password: 'Nope#1234' });
    expect(right.body).toEqual({ valid: true });
    expect(wrong.body).toEqual({ valid: false });
    expect((await api().post('/api/account/verify-password').set(auth(parent.token)).send({})).status).toBe(400);
  });
});

describe('change password (send-code, verify-code, PUT /password)', () => {
  test('the full flow, with every failure on the way', async () => {
    const parent = await createParent();
    const otherLogin = await api().post('/api/auth/login').send({ email: parent.email, password: GOOD_PASSWORD });

    await api().post('/api/account/password/send-code').set(auth(parent.token)).expect(200);
    const tooSoon = await api().post('/api/account/password/send-code').set(auth(parent.token));
    expect(tooSoon.status).toBe(429);

    const code = lastCodeFor(parent.email);
    const wrong = code === '111111' ? '222222' : '111111';
    expect((await api().post('/api/account/password/verify-code').set(auth(parent.token)).send({ code: wrong })).status).toBe(400);
    const verified = await api().post('/api/account/password/verify-code').set(auth(parent.token)).send({ code });
    expect(verified.status).toBe(200);

    const change = (body) => api().put('/api/account/password').set(auth(parent.token)).send(body);
    const wrongOld = await change({ oldPassword: 'Wrong#123', newPassword: 'Brand#New9', code });
    expect(wrongOld.status).toBe(400);
    expect(wrongOld.body.error).toMatch(/old password/);
    expect((await change({ oldPassword: GOOD_PASSWORD, newPassword: GOOD_PASSWORD, code })).status).toBe(400);
    expect((await change({ oldPassword: GOOD_PASSWORD, newPassword: 'weak', code })).status).toBe(400);
    expect((await change({ oldPassword: GOOD_PASSWORD, newPassword: 'Brand#New9', code: wrong })).status).toBe(400);

    const ok = await change({ oldPassword: GOOD_PASSWORD, newPassword: 'Brand#New9', code });
    expect(ok.status).toBe(200);

    // This phone stays logged in, the other login is ended.
    expect((await api().get('/api/auth/me').set(auth(parent.token))).status).toBe(200);
    expect((await api().get('/api/auth/me').set(auth(otherLogin.body.token))).status).toBe(401);

    // The code was used up.
    expect((await change({ oldPassword: 'Brand#New9', newPassword: 'Third#Pass9', code })).status).toBe(400);
    await api().post('/api/auth/login').send({ email: parent.email, password: 'Brand#New9' }).expect(200);

    // The old password is kept in the history (not deleted).
    const rows = await query('SELECT is_current FROM user_passwords WHERE user_id = ? ORDER BY id', [parent.user.id]);
    expect(rows.map((r) => r.is_current)).toEqual([null, 1]);
  });
});

describe('Parent PIN', () => {
  test('create, check, change, and the PIN is stored hashed', async () => {
    const parent = await createParent();
    const pinApi = (method, path) => api()[method](`/api/account/pin${path}`).set(auth(parent.token));

    expect((await pinApi('get', '')).body).toEqual({ hasPin: false, lockedUntil: null });
    expect((await pinApi('post', '/verify').send({ pin: '1234' })).status).toBe(404); // no PIN yet
    expect((await pinApi('post', '').send({ pin: '12a4' })).status).toBe(400);

    expect((await pinApi('post', '').send({ pin: '1234' })).status).toBe(201);
    expect((await pinApi('post', '').send({ pin: '5555' })).status).toBe(409);
    const [saved] = await query('SELECT pin_hash FROM parent_pins WHERE user_id = ?', [parent.user.id]);
    expect(saved.pin_hash).toMatch(/^\$2[aby]\$/);

    expect((await pinApi('post', '/verify').send({ pin: '1234' })).body).toEqual({ valid: true });
    const wrong = await pinApi('post', '/verify').send({ pin: '9999' });
    expect(wrong.body).toEqual({ valid: false, attemptsLeft: 4, lockedUntil: null });

    const login = await api().post('/api/auth/login').send({ email: parent.email, password: GOOD_PASSWORD });
    expect(login.body.hasPin).toBe(true);

    expect((await pinApi('put', '').send({ oldPin: '0000', newPin: '4321' })).status).toBe(400);
    expect((await pinApi('put', '').send({ oldPin: '1234', newPin: '1234' })).status).toBe(400);
    expect((await pinApi('put', '').send({ oldPin: '1234' })).status).toBe(400);
    expect((await pinApi('put', '').send({ oldPin: '1234', newPin: '4321' })).status).toBe(200);
    expect((await pinApi('post', '/verify').send({ pin: '4321' })).body.valid).toBe(true);
  });

  test('5 wrong PINs lock it (429); "Forgot PIN" with the password unlocks it', async () => {
    const parent = await createParent();
    const pinApi = (method, path) => api()[method](`/api/account/pin${path}`).set(auth(parent.token));
    await pinApi('post', '').send({ pin: '1234' }).expect(201);

    for (let i = 1; i <= 4; i++) {
      expect((await pinApi('post', '/verify').send({ pin: '0000' })).body.attemptsLeft).toBe(5 - i);
    }
    const fifth = await pinApi('post', '/verify').send({ pin: '0000' });
    expect(fifth.body.valid).toBe(false);
    expect(fifth.body.lockedUntil).toEqual(expect.any(String));

    const locked = await pinApi('post', '/verify').send({ pin: '1234' }); // even the right PIN
    expect(locked.status).toBe(429);
    expect((await pinApi('put', '').send({ oldPin: '1234', newPin: '4321' })).status).toBe(429);
    expect((await pinApi('get', '')).body.lockedUntil).toEqual(expect.any(String));

    expect((await pinApi('post', '/reset').send({ password: 'Wrong#123', newPin: '2468' })).status).toBe(400);
    expect((await pinApi('post', '/reset').send({ password: GOOD_PASSWORD, newPin: '24' })).status).toBe(400);
    expect((await pinApi('post', '/reset').send({ password: GOOD_PASSWORD, newPin: '2468' })).status).toBe(200);
    expect((await pinApi('post', '/verify').send({ pin: '2468' })).body.valid).toBe(true);
  });

  test('"Forgot PIN" also works when no PIN exists yet', async () => {
    const parent = await createParent();
    await api().post('/api/account/pin/reset').set(auth(parent.token)).send({ password: GOOD_PASSWORD, newPin: '1357' }).expect(200);
    expect((await api().get('/api/account/pin').set(auth(parent.token))).body.hasPin).toBe(true);
  });

  test('PIN routes need a login (401)', async () => {
    expect((await api().get('/api/account/pin')).status).toBe(401);
  });
});
