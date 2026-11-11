// PROGRESS TESTS - reading sessions, progress, struggle words

const crypto = require('crypto');
const { api, auth, createParent, createChild, query } = require('./helpers');

const today = () => new Date().toISOString().slice(0, 10);

function session(fields = {}) {
  return { clientSessionId: crypto.randomUUID(), stars: 3, topicId: 'animals', level: 'easy', language: 'en', sessionDate: today(), ...fields };
}

describe('POST /api/children/:childId/sessions', () => {
  test('saves a session and adds the stars to today', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const path = `/api/children/${child.id}/sessions`;

    const first = await api().post(path).set(auth(parent.token)).send(session());
    expect(first.status).toBe(201);
    expect(first.body).toEqual({
      duplicate: false,
      reading: { date: today(), starsToday: 3, sessions: 1 },
      activity: { [today()]: { sessions: 1, stars: 3 } },
    });

    const second = await api().post(path).set(auth(parent.token)).send(session({ stars: 2, topicId: 'food', level: 'hard', language: 'ur' }));
    expect(second.status).toBe(201);
    expect(second.body.reading).toEqual({ date: today(), starsToday: 5, sessions: 2 });

    const [details] = await query(
      `SELECT COUNT(*) AS n FROM reading_session_details d JOIN activity_sessions s ON s.id = d.session_id WHERE s.child_id = ?`,
      [child.id]
    );
    expect(details.n).toBe(2);
  });

  test('the same clientSessionId twice does not double the stars (200 duplicate)', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const body = session();
    await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(body).expect(201);
    const retry = await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(body);
    expect(retry.status).toBe(200);
    expect(retry.body.duplicate).toBe(true);
    expect(retry.body.reading.starsToday).toBe(3);
  });

  test('the app date is optional (the server uses today in UTC)', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const body = session();
    delete body.sessionDate;
    delete body.language;
    const res = await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(body);
    expect(res.status).toBe(201);
    expect(res.body.reading.date).toBe(today());
  });

  test.each([
    [{ clientSessionId: 'not-a-uuid' }, 'clientSessionId'],
    [{ stars: -1 }, 'stars'],
    [{ stars: 2.5 }, 'stars'],
    [{ level: 'expert' }, 'level'],
    [{ language: 'fr' }, 'language'],
    [{ sessionDate: '2001-01-01' }, 'sessionDate'],
    [{ sessionDate: '2026-02-30' }, 'sessionDate'],
    [{ topicId: 'space' }, 'Unknown topic or level'],
  ])('rejects bad data %# with 400', async (fields, message) => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const res = await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(session(fields));
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(message);
  });

  test('another parent cannot add stars (404)', async () => {
    const owner = await createParent();
    const stranger = await createParent();
    const child = await createChild(owner.token);
    expect((await api().post(`/api/children/${child.id}/sessions`).set(auth(stranger.token)).send(session())).status).toBe(404);
  });
});

describe('GET /api/children/:childId/progress', () => {
  test('returns reading + activity, also shown on the child profile', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(session({ stars: 1 }));

    const res = await api().get(`/api/children/${child.id}/progress`).set(auth(parent.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ reading: { date: today(), starsToday: 1, sessions: 1 }, activity: { [today()]: { sessions: 1, stars: 1 } } });

    const profile = await api().get(`/api/children/${child.id}`).set(auth(parent.token));
    expect(profile.body.child.reading).toEqual(res.body.reading);
    expect(profile.body.child.activity).toEqual(res.body.activity);
  });
});

describe('struggle words', () => {
  test('adding a word, then the same word again (any case) counts it', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const path = `/api/children/${child.id}/struggle-words`;

    const first = await api().post(path).set(auth(parent.token)).send({ word: 'lightning', topic: 'Weather' });
    expect(first.status).toBe(201);
    expect(first.body.word).toMatchObject({ word: 'lightning', count: 1, topic: 'Weather', topicId: 'weather', language: 'en' });

    const again = await api().post(path).set(auth(parent.token)).send({ word: 'Lightning' });
    expect(again.status).toBe(200);
    expect(again.body.word).toMatchObject({ word: 'lightning', count: 2, topic: 'Weather' });

    await api().post(path).set(auth(parent.token)).send({ word: 'cat', topic: 'animals' }).expect(201);
    await api().post(path).set(auth(parent.token)).send({ word: 'بلی', language: 'ur' }).expect(201);

    const list = await api().get(path).set(auth(parent.token));
    expect(list.status).toBe(200);
    // The hardest word (highest count) comes first.
    expect(list.body.words[0]).toMatchObject({ word: 'lightning', count: 2 });
    expect(list.body.words.map((w) => w.word).sort()).toEqual(['cat', 'lightning', 'بلی'].sort());

    const urdu = await api().get(`${path}?language=ur`).set(auth(parent.token));
    expect(urdu.body.words.map((w) => w.word)).toEqual(['بلی']);
  });

  test.each([
    [{}, 'word is missing'],
    [{ word: 'x'.repeat(81) }, 'word is missing'],
    [{ word: 'cat', topic: 'Space' }, 'Unknown topic: Space'],
    [{ word: 'cat', language: 'fr' }, 'language'],
  ])('rejects bad data %# with 400', async (body, message) => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const res = await api().post(`/api/children/${child.id}/struggle-words`).set(auth(parent.token)).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(message);
  });

  test('an unknown language filter gives 400', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    expect((await api().get(`/api/children/${child.id}/struggle-words?language=fr`).set(auth(parent.token))).status).toBe(400);
  });
});
