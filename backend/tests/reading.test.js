// READING + OPTIONS TESTS - /api/reading/topics, /api/children/:childId/topics, /api/options

const crypto = require('crypto');
const { api, auth, createParent, createChild } = require('./helpers');

const CUSTOM_TOPIC = {
  title: 'Zara at the park',
  icon: '🌳',
  tint: 'sagePale',
  levels: {
    easy: [
      { words: ['Zara', 'runs', 'fast.'], focus: 0, ur: { words: ['زارا', 'تیز', 'دوڑتی', 'ہے۔'], focus: 0 } },
      { words: ['She', 'sees', 'a', 'cat.'], focus: 3, ur: { words: ['اسے', 'بلی', 'نظر', 'آتی', 'ہے۔'], focus: 1 } },
    ],
  },
};

describe('GET /api/reading/topics', () => {
  test('returns the 5 built-in topics in the app shape (focus counts from 0)', async () => {
    const parent = await createParent();
    const res = await api().get('/api/reading/topics').set(auth(parent.token));
    expect(res.status).toBe(200);

    expect(res.body.levels.map((l) => l.id)).toEqual(['easy', 'medium', 'hard']);
    expect(res.body.levels[0]).toEqual({ id: 'easy', label: 'Easy', stars: 1, tint: 'sagePale', color: 'sage' });
    expect(res.body.topics.map((t) => t.id)).toEqual(['animals', 'food', 'family', 'weather', 'school']);

    const animals = res.body.topics[0];
    expect(animals).toMatchObject({ title: 'Animals', icon: '🐶', tint: 'bluePale', isCustom: false });
    expect(Object.keys(animals.levels)).toEqual(['easy', 'medium', 'hard']);
    expect(animals.levels.easy).toHaveLength(3);
    expect(animals.levels.easy[0]).toEqual({
      words: ['The', 'cat', 'sat', 'on', 'the', 'mat.'],
      focus: 1,
      ur: { words: ['بلی', 'چٹائی', 'پر', 'بیٹھی۔'], focus: 0 },
    });
  });

  test('needs a login (401); another parent’s childId gives 404', async () => {
    expect((await api().get('/api/reading/topics')).status).toBe(401);
    const owner = await createParent();
    const stranger = await createParent();
    const child = await createChild(owner.token);
    expect((await api().get(`/api/reading/topics?childId=${child.id}`).set(auth(stranger.token))).status).toBe(404);
    expect((await api().get('/api/reading/topics?childId=abc').set(auth(owner.token))).status).toBe(404);
  });
});

describe('POST /api/children/:childId/topics (custom topic)', () => {
  test('saves a topic that only that child sees, and it can be read along', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const other = await createChild(parent.token, { name: 'Ali' });

    const res = await api().post(`/api/children/${child.id}/topics`).set(auth(parent.token)).send(CUSTOM_TOPIC);
    expect(res.status).toBe(201);
    expect(res.body.topic).toEqual({
      id: expect.stringMatching(/^custom-/),
      title: 'Zara at the park',
      icon: '🌳',
      tint: 'sagePale',
      isCustom: true,
      levels: { easy: CUSTOM_TOPIC.levels.easy },
    });
    const topicId = res.body.topic.id;

    const forChild = await api().get(`/api/reading/topics?childId=${child.id}`).set(auth(parent.token));
    expect(forChild.body.topics.map((t) => t.id)).toContain(topicId);
    expect(forChild.body.topics[forChild.body.topics.length - 1].id).toBe(topicId); // after the built-in ones

    const forOther = await api().get(`/api/reading/topics?childId=${other.id}`).set(auth(parent.token));
    expect(forOther.body.topics.map((t) => t.id)).not.toContain(topicId);

    const sessionBody = { clientSessionId: crypto.randomUUID(), stars: 3, topicId, level: 'easy' };
    await api().post(`/api/children/${child.id}/sessions`).set(auth(parent.token)).send(sessionBody).expect(201);
    // The other child cannot use it.
    const otherSession = await api()
      .post(`/api/children/${other.id}/sessions`)
      .set(auth(parent.token))
      .send({ ...sessionBody, clientSessionId: crypto.randomUUID() });
    expect(otherSession.status).toBe(400);
  });

  test.each([
    [{ ...CUSTOM_TOPIC, title: '' }, 'title'],
    [{ ...CUSTOM_TOPIC, levels: {} }, 'at least one level'],
    [{ ...CUSTOM_TOPIC, levels: { expert: CUSTOM_TOPIC.levels.easy } }, 'not a level'],
    [{ ...CUSTOM_TOPIC, levels: { easy: [{ words: ['Hi.'], focus: 0 }] } }, '.ur'],
    [{ ...CUSTOM_TOPIC, levels: { easy: [{ words: ['Hi.'], focus: 5, ur: { words: ['ہیلو'], focus: 0 } }] } }, 'focus'],
    [{ ...CUSTOM_TOPIC, levels: { easy: [{ words: ['two words'], ur: { words: ['ہیلو'] } }] } }, 'single words'],
  ])('rejects bad data %# with 400', async (body, message) => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const res = await api().post(`/api/children/${child.id}/topics`).set(auth(parent.token)).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(message);
  });

  test('another parent cannot add a topic (404)', async () => {
    const owner = await createParent();
    const stranger = await createParent();
    const child = await createChild(owner.token);
    expect((await api().post(`/api/children/${child.id}/topics`).set(auth(stranger.token)).send(CUSTOM_TOPIC)).status).toBe(404);
  });
});

describe('GET /api/options', () => {
  test('is public and returns every choice list from the database', async () => {
    const res = await api().get('/api/options');
    expect(res.status).toBe(200);
    expect(res.body.ageBands.map((a) => a.label)).toEqual(['4–6 years', '7–9 years', '10–12 years']);
    expect(res.body.avatars.map((a) => a.code)).toEqual(['panda', 'rabbit', 'wolf', 'bear']);
    expect(res.body.languages).toEqual([
      { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRtl: true },
    ]);
    expect(res.body.supports).toHaveLength(7);
    expect(res.body.modules).toHaveLength(11);
    expect(res.body.modules[0]).toEqual({
      code: 'read-along',
      name: 'Read-Along',
      sensor: 'Mic',
      isAvailable: true,
      onByDefault: true,
      supports: ['Reading'],
    });
    expect(res.body.modules.find((m) => m.code === 'spelling').supports).toEqual(['Reading', 'Writing']);
    expect(res.body.relations.map((r) => r.name)).toContain('Grandmother');
    expect(res.body.storyFields).toHaveLength(19);
    expect(res.body.readingLevels).toHaveLength(3);
  });
});
