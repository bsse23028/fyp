// CHILD TESTS - /api/children/... (profiles, Child Mode, ownership)

const { api, auth, createParent, createChild, query } = require('./helpers');

const FULL_STORY = {
  people: {
    preferredName: 'Zaru',
    mother: 'Ayesha',
    father: 'Ali',
    siblings: ['Omar', '  ', 'Hira'],
    others: [
      { name: 'Dadi', relation: 'Grandmother' }, // from the list -> relation_id
      { name: 'Bushra', relation: 'Nanny' }, // typed by the parent -> relation_text
      { name: '', relation: 'Friend' }, // no name -> not saved
    ],
  },
  favourites: { animal: 'Cat', toy: '', food: 'Mango', colour: 'Blue', character: '', game: 'Cricket' },
  interests: { hobbies: ['Drawing', 'Singing'], place: 'Park', storyTypes: ['Animals'] },
  everyday: { hometown: 'Lahore', activity: 'Story time', places: ['Home', 'School'], routine: 'Bedtime story' },
  notes: 'Avoid scary animals.',
};

describe('GET /api/children', () => {
  test('a new parent has no children', async () => {
    const parent = await createParent();
    const res = await api().get('/api/children').set(auth(parent.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ children: [], activeId: null });
  });

  test('needs a login (401)', async () => {
    expect((await api().get('/api/children')).status).toBe(401);
  });
});

describe('POST /api/children', () => {
  test('creates a child with the app defaults', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    expect(child).toEqual({
      id: expect.stringMatching(/^\d+$/),
      name: 'Zara',
      ageBand: '4–6 years',
      avatar: 'rabbit',
      language: 'en',
      supports: [],
      // everything except the two camera-heavy activities, like defaultModules() in the app
      modules: [
        'Read-Along',
        'Reading Assist',
        'Phonics',
        'Spelling',
        'Vowel / Phoneme',
        'Emotion Trainer',
        'AAC Talk Board',
        'Social Stories',
        'Routines / Attention',
      ],
      story: {
        people: { preferredName: '', mother: '', father: '', siblings: [], others: [] },
        favourites: { animal: '', toy: '', food: '', colour: '', character: '', game: '' },
        interests: { hobbies: [], place: '', storyTypes: [] },
        everyday: { hometown: '', activity: '', places: [], routine: '' },
        notes: '',
      },
      reading: { date: null, starsToday: 0, sessions: 0 },
      activity: {},
    });
    const list = await api().get('/api/children').set(auth(parent.token));
    expect(list.body.activeId).toBe(child.id);
  });

  test('saves every field, including the story (empty answers are dropped)', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token, {
      name: '  Ali ',
      ageBand: '7-9', // the short code works too
      avatar: 'wolf',
      language: 'ur',
      supports: ['Reading', 'Numbers'],
      modules: ['Read-Along', 'Number Sense'],
      story: FULL_STORY,
    });
    expect(child).toMatchObject({
      name: 'Ali',
      ageBand: '7–9 years',
      avatar: 'wolf',
      language: 'ur',
      supports: ['Reading', 'Numbers'],
      modules: ['Read-Along', 'Number Sense'],
    });
    expect(child.story.people).toEqual({
      preferredName: 'Zaru',
      mother: 'Ayesha',
      father: 'Ali',
      siblings: ['Omar', 'Hira'],
      others: [
        { name: 'Dadi', relation: 'Grandmother' },
        { name: 'Bushra', relation: 'Nanny' },
      ],
    });
    expect(child.story.favourites).toEqual({ ...FULL_STORY.favourites });
    expect(child.story.interests).toEqual(FULL_STORY.interests);
    expect(child.story.everyday).toEqual(FULL_STORY.everyday);
    expect(child.story.notes).toBe('Avoid scary animals.');

    const relations = await query(
      `SELECT a.value, a.relation_id, a.relation_text FROM child_story_answers a
         JOIN story_fields f ON f.id = a.field_id WHERE a.child_id = ? AND f.code = 'other_person' ORDER BY a.sort_order`,
      [child.id]
    );
    expect(relations[0].relation_id).not.toBeNull();
    expect(relations[1]).toMatchObject({ relation_id: null, relation_text: 'Nanny' });
  });

  test.each([
    [{ ageBand: '4–6 years' }, 'nickname'],
    [{ name: 'Zara' }, 'age band'],
    [{ name: 'Zara', ageBand: '20-30' }, 'not an age band'],
    [{ name: 'Zara', ageBand: '4-6', avatar: 'dragon' }, 'not an avatar'],
    [{ name: 'Zara', ageBand: '4-6', language: 'fr' }, 'not a language'],
    [{ name: 'Zara', ageBand: '4-6', supports: ['Flying'] }, 'Unknown area of support: Flying'],
    [{ name: 'Zara', ageBand: '4-6', modules: ['Chess'] }, 'Unknown activity: Chess'],
    [{ name: 'Zara', ageBand: '4-6', supports: 'Reading' }, 'supports must be a list'],
    [{ name: 'Zara', ageBand: '4-6', story: { people: { siblings: 'Omar' } } }, 'story.people.siblings'],
    [{ name: 'x'.repeat(61), ageBand: '4-6' }, 'nickname'],
  ])('rejects bad data %# with 400', async (body, message) => {
    const parent = await createParent();
    const res = await api().post('/api/children').set(auth(parent.token)).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain(message);
  });

  test('a failed create saves nothing (transaction)', async () => {
    const parent = await createParent();
    await api().post('/api/children').set(auth(parent.token)).send({ name: 'Zara', ageBand: '4-6', supports: ['Nope'] }).expect(400);
    const rows = await query('SELECT id FROM children WHERE user_id = ?', [parent.user.id]);
    expect(rows).toHaveLength(0);
  });
});

describe('GET / PATCH / DELETE /api/children/:childId', () => {
  test('reads one child', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    const res = await api().get(`/api/children/${child.id}`).set(auth(parent.token));
    expect(res.status).toBe(200);
    expect(res.body.child).toEqual(child);
  });

  test('changes only the fields sent; lists and the story are replaced', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token, { supports: ['Reading'], story: FULL_STORY });

    const res = await api()
      .patch(`/api/children/${child.id}`)
      .set(auth(parent.token))
      .send({ avatar: 'panda', supports: ['Writing'], modules: [], story: { favourites: { animal: 'Dog' } } });
    expect(res.status).toBe(200);
    expect(res.body.child).toMatchObject({ name: 'Zara', avatar: 'panda', supports: ['Writing'], modules: [] });
    expect(res.body.child.story.favourites.animal).toBe('Dog');
    expect(res.body.child.story.people.mother).toBe(''); // the whole story was replaced
  });

  // What "Personalize my child's stories" does: PATCH { story: cleanStory(story) }.
  // When the app is opened again it calls GET /api/children - the story must come back the same.
  test('Personalize Stories: the saved story comes back when the app reopens', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    // The exact shape cleanStory() in src/shared/utils/storyOptions.js sends.
    const appStory = {
      people: {
        preferredName: 'Zaru',
        mother: 'Ayesha',
        father: '',
        siblings: ['Omar'],
        others: [
          { name: 'Dadi', relation: 'Grandmother' },
          { name: 'Bushra', relation: 'Nanny' },
          { name: 'Sana', relation: '' },
        ],
      },
      favourites: { animal: 'Cat', toy: '', food: 'Mango', colour: 'Blue', character: '', game: '' },
      interests: { hobbies: ['Drawing'], place: 'Park', storyTypes: ['Animals', 'Funny'] },
      everyday: { hometown: 'Lahore', activity: '', places: ['Home'], routine: 'Bedtime story' },
      notes: 'Keep sentences short and simple.',
    };

    const saved = await api().patch(`/api/children/${child.id}`).set(auth(parent.token)).send({ story: appStory });
    expect(saved.status).toBe(200);
    expect(saved.body.child.story).toEqual(appStory);

    // "Reopen the app": the list the app loads at start-up.
    const list = await api().get('/api/children').set(auth(parent.token));
    expect(list.status).toBe(200);
    expect(list.body.children.find((c) => c.id === child.id).story).toEqual(appStory);
  });

  test('PATCH: nothing to change (400), bad value (400)', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token);
    expect((await api().patch(`/api/children/${child.id}`).set(auth(parent.token)).send({})).status).toBe(400);
    expect((await api().patch(`/api/children/${child.id}`).set(auth(parent.token)).send({ avatar: 'dragon' })).status).toBe(400);
  });

  test('deletes a child and everything that belongs to it', async () => {
    const parent = await createParent();
    const child = await createChild(parent.token, { story: FULL_STORY });
    await api().post(`/api/children/${child.id}/struggle-words`).set(auth(parent.token)).send({ word: 'cat' }).expect(201);

    await api().delete(`/api/children/${child.id}`).set(auth(parent.token)).expect(204);
    expect((await api().get(`/api/children/${child.id}`).set(auth(parent.token))).status).toBe(404);
    expect((await query('SELECT id FROM struggle_words WHERE child_id = ?', [child.id])).length).toBe(0);
    expect((await query('SELECT id FROM child_story_answers WHERE child_id = ?', [child.id])).length).toBe(0);
  });

  test('an unknown or non-numeric id gives 404', async () => {
    const parent = await createParent();
    expect((await api().get('/api/children/999999999').set(auth(parent.token))).status).toBe(404);
    expect((await api().get('/api/children/abc').set(auth(parent.token))).status).toBe(404);
  });
});

describe('a parent can only reach their OWN children', () => {
  test('every child route answers 404 for another parent', async () => {
    const owner = await createParent();
    const stranger = await createParent();
    const child = await createChild(owner.token);
    const as = auth(stranger.token);
    const path = `/api/children/${child.id}`;

    expect((await api().get(path).set(as)).status).toBe(404);
    expect((await api().patch(path).set(as).send({ name: 'Hacked' })).status).toBe(404);
    expect((await api().delete(path).set(as)).status).toBe(404);
    expect((await api().post(`${path}/select`).set(as)).status).toBe(404);
    expect((await api().get(`${path}/progress`).set(as)).status).toBe(404);
    expect((await api().get(`${path}/struggle-words`).set(as)).status).toBe(404);
    expect((await api().get('/api/children').set(as)).body.children).toEqual([]);

    // Nothing was changed.
    const still = await api().get(path).set(auth(owner.token));
    expect(still.body.child.name).toBe('Zara');
  });
});

describe('POST /api/children/:childId/select (Child Mode)', () => {
  test('makes that child the active one', async () => {
    const parent = await createParent();
    const first = await createChild(parent.token, { name: 'First' });
    const second = await createChild(parent.token, { name: 'Second' });

    expect((await api().get('/api/children').set(auth(parent.token))).body.activeId).toBe(first.id);
    const res = await api().post(`/api/children/${second.id}/select`).set(auth(parent.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ activeId: second.id });
    expect((await api().get('/api/children').set(auth(parent.token))).body.activeId).toBe(second.id);
  });
});
