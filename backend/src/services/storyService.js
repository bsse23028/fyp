// STORY SERVICE - "Personalize my child's stories" (table: child_story_answers).
//
// The app keeps the answers as ONE object (see storyOptions.js in the app):
//   {
//     people:     { preferredName, mother, father, siblings: [names], others: [{ name, relation }] },
//     favourites: { animal, toy, food, colour, character, game },
//     interests:  { hobbies: [], place, storyTypes: [] },
//     everyday:   { hometown, activity, places: [], routine },
//     notes:      'special instructions'
//   }
// The database keeps ONE ROW PER ANSWER, linked to a question in story_fields.
// STORY_FIELDS below says which answer goes with which story_fields.code.

const { query } = require('../db/connection');

const STORY_FIELDS = [
  { section: 'people', key: 'preferredName', code: 'preferred_name' },
  { section: 'people', key: 'mother', code: 'mother' },
  { section: 'people', key: 'father', code: 'father' },
  { section: 'people', key: 'siblings', code: 'sibling' },
  { section: 'people', key: 'others', code: 'other_person' },
  { section: 'favourites', key: 'animal', code: 'fav_animal' },
  { section: 'favourites', key: 'toy', code: 'fav_toy' },
  { section: 'favourites', key: 'food', code: 'fav_food' },
  { section: 'favourites', key: 'colour', code: 'fav_colour' },
  { section: 'favourites', key: 'character', code: 'fav_character' },
  { section: 'favourites', key: 'game', code: 'fav_game' },
  { section: 'interests', key: 'hobbies', code: 'hobby' },
  { section: 'interests', key: 'place', code: 'fav_place' },
  { section: 'interests', key: 'storyTypes', code: 'story_type' },
  { section: 'everyday', key: 'hometown', code: 'hometown' },
  { section: 'everyday', key: 'activity', code: 'everyday_activity' },
  { section: 'everyday', key: 'places', code: 'familiar_place' },
  { section: 'everyday', key: 'routine', code: 'routine' },
  { section: null, key: 'notes', code: 'notes' }, // notes is not inside a section
];

// The same as EMPTY_STORY in the app.
function emptyStory() {
  return {
    people: { preferredName: '', mother: '', father: '', siblings: [], others: [] },
    favourites: { animal: '', toy: '', food: '', colour: '', character: '', game: '' },
    interests: { hobbies: [], place: '', storyTypes: [] },
    everyday: { hometown: '', activity: '', places: [], routine: '' },
    notes: '',
  };
}

// Where an answer lives inside the story object: story.people, story.favourites ... or story itself.
function holderOf(story, field) {
  return field.section ? story[field.section] : story;
}

// Replaces ALL story answers of a child with `story`. Empty answers are not saved.
// Must run inside a transaction (`run`).
async function saveStory(run, childId, story) {
  const fieldRows = await run('SELECT id, code FROM story_fields');
  const fieldIds = Object.fromEntries(fieldRows.map((row) => [row.code, row.id]));
  const relationRows = await run('SELECT id, name FROM relations');
  const relationIds = Object.fromEntries(relationRows.map((row) => [row.name.toLowerCase(), row.id]));

  const rows = []; // [child_id, field_id, value, relation_id, relation_text, sort_order]
  STORY_FIELDS.forEach((field) => {
    const holder = field.section ? story[field.section] || {} : story;
    const value = holder[field.key];
    const fieldId = fieldIds[field.code];
    if (value === undefined || value === null || !fieldId) return;

    if (field.code === 'other_person') {
      let position = 0;
      value.forEach((person) => {
        const name = (person.name || '').trim();
        if (!name) return;
        const relation = (person.relation || '').trim();
        const relationId = relationIds[relation.toLowerCase()] || null;
        // A relation from the list is saved as an id; one the parent typed is saved as text.
        rows.push([childId, fieldId, name, relationId, relationId ? null : relation || null, position++]);
      });
    } else if (Array.isArray(value)) {
      let position = 0;
      value.forEach((item) => {
        const text = item.trim();
        if (text) rows.push([childId, fieldId, text, null, null, position++]);
      });
    } else if (value.trim()) {
      rows.push([childId, fieldId, value.trim(), null, null, 0]);
    }
  });

  await run('DELETE FROM child_story_answers WHERE child_id = ?', [childId]);
  if (rows.length > 0) {
    await run(
      'INSERT INTO child_story_answers (child_id, field_id, value, relation_id, relation_text, sort_order) VALUES ?',
      [rows]
    );
  }
}

// Reads the stories of several children at once: { [childId]: story }.
async function loadStories(childIds) {
  const rows = await query(
    `SELECT a.child_id, f.code, a.value, a.relation_text, r.name AS relation_name
       FROM child_story_answers a
       JOIN story_fields f ON f.id = a.field_id
       LEFT JOIN relations r ON r.id = a.relation_id
      WHERE a.child_id IN (?)
      ORDER BY a.child_id, f.sort_order, a.sort_order, a.id`,
    [childIds]
  );

  const stories = {};
  rows.forEach((row) => {
    const field = STORY_FIELDS.find((f) => f.code === row.code);
    if (!field) return; // a question the app does not know (yet)
    if (!stories[row.child_id]) stories[row.child_id] = emptyStory();
    const holder = holderOf(stories[row.child_id], field);

    if (field.code === 'other_person') {
      holder.others.push({ name: row.value, relation: row.relation_name || row.relation_text || '' });
    } else if (Array.isArray(holder[field.key])) {
      holder[field.key].push(row.value);
    } else {
      holder[field.key] = row.value;
    }
  });
  return stories;
}

module.exports = { emptyStory, saveStory, loadStories };
