// CHILD SERVICE - the child profiles of a parent (replaces childSlice.js saving on the phone).
//
// A child sent to the app has the SAME shape the app already uses:
//   {
//     id: '12', name: 'Zara', ageBand: '4–6 years', avatar: 'rabbit', language: 'en',
//     supports: ['Reading'], modules: ['Read-Along', ...],
//     story: { people: {...}, ... },                    see storyService.js
//     reading: { date, starsToday, sessions },          see progressService.js
//     activity: { '2026-10-12': { sessions, stars } }
//   }
// ids are sent as TEXT ('12'), exactly like the ids the app made before.
//
// Ownership: every function gets the parent's userId, and childAccess middleware has already
// checked that the child in the URL belongs to that parent.

const { query, withTransaction } = require('../db/connection');
const HttpError = require('../utils/HttpError');
const storyService = require('./storyService');
const progressService = require('./progressService');

const DEFAULT_AVATAR = 'rabbit';
const DEFAULT_LANGUAGE = 'en';

// ---------- ownership ----------

// Returns the child's id (a number) if it belongs to this parent, otherwise null.
async function findOwnChildId(userId, rawChildId) {
  if (!/^\d{1,18}$/.test(String(rawChildId))) return null;
  const rows = await query('SELECT id FROM children WHERE id = ? AND user_id = ?', [rawChildId, userId]);
  return rows.length > 0 ? rows[0].id : null;
}

// ---------- look-ups: turn the app's words into database ids ----------

async function findAgeBandId(run, ageBand) {
  const text = ageBand.trim();
  // The app sends the label ('4–6 years'); the short code ('4-6') works too.
  const rows = await run('SELECT id FROM age_bands WHERE label = ? OR code = ?', [text, text]);
  if (rows.length === 0) throw new HttpError(400, `"${text}" is not an age band.`);
  return rows[0].id;
}

async function findAvatarId(run, avatar) {
  const rows = await run('SELECT id FROM avatars WHERE code = ? AND is_active = 1', [avatar.trim()]);
  if (rows.length === 0) throw new HttpError(400, `"${avatar}" is not an avatar.`);
  return rows[0].id;
}

async function checkLanguage(run, language) {
  const rows = await run('SELECT code FROM languages WHERE code = ? AND is_active = 1', [language.trim()]);
  if (rows.length === 0) throw new HttpError(400, `"${language}" is not a language.`);
  return rows[0].code;
}

// Names -> ids for 'supports' or 'modules'. Unknown names are an error.
// (`table` is always written in this file, never taken from the request.)
async function findIdsByName(run, table, names, label) {
  const unique = [...new Set(names.map((name) => name.trim()))];
  if (unique.length === 0) return [];
  const rows = await run(`SELECT id, name FROM ${table} WHERE name IN (?)`, [unique]);
  const missing = unique.filter((name) => !rows.some((row) => row.name.toLowerCase() === name.toLowerCase()));
  if (missing.length > 0) throw new HttpError(400, `Unknown ${label}: ${missing.join(', ')}.`);
  return rows.map((row) => row.id);
}

// The activities switched on for a NEW child (as defaultModules() in the app).
async function defaultModuleIds(run) {
  const rows = await run('SELECT id FROM modules WHERE on_by_default = 1');
  return rows.map((row) => row.id);
}

// ---------- save the lists ----------

async function saveSupports(run, childId, supportIds) {
  await run('DELETE FROM child_supports WHERE child_id = ?', [childId]);
  if (supportIds.length > 0) {
    await run('INSERT INTO child_supports (child_id, support_id) VALUES ?', [supportIds.map((id) => [childId, id])]);
  }
}

async function saveModules(run, childId, moduleIds) {
  await run('DELETE FROM child_modules WHERE child_id = ?', [childId]);
  if (moduleIds.length > 0) {
    await run('INSERT INTO child_modules (child_id, module_id) VALUES ?', [moduleIds.map((id) => [childId, id])]);
  }
}

// ---------- read ----------

// Every child of this parent + which one is active: { children: [...], activeId }
async function listChildren(userId) {
  const rows = await query(
    `SELECT c.id, c.name, c.language_code, c.last_selected_at, ab.label AS age_band, av.code AS avatar
       FROM children c
       JOIN age_bands ab ON ab.id = c.age_band_id
       JOIN avatars av ON av.id = c.avatar_id
      WHERE c.user_id = ?
      ORDER BY c.id`,
    [userId]
  );
  if (rows.length === 0) return { children: [], activeId: null };

  const ids = rows.map((row) => row.id);
  const supportRows = await query(
    `SELECT cs.child_id, s.name FROM child_supports cs JOIN supports s ON s.id = cs.support_id
      WHERE cs.child_id IN (?) ORDER BY s.sort_order`,
    [ids]
  );
  const moduleRows = await query(
    `SELECT cm.child_id, m.name FROM child_modules cm JOIN modules m ON m.id = cm.module_id
      WHERE cm.child_id IN (?) ORDER BY m.sort_order`,
    [ids]
  );
  const stories = await storyService.loadStories(ids);
  const progress = await progressService.loadProgress(ids);

  const children = rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    ageBand: row.age_band,
    avatar: row.avatar,
    language: row.language_code,
    supports: supportRows.filter((s) => s.child_id === row.id).map((s) => s.name),
    modules: moduleRows.filter((m) => m.child_id === row.id).map((m) => m.name),
    story: stories[row.id] || storyService.emptyStory(),
    reading: progress[row.id].reading,
    activity: progress[row.id].activity,
  }));

  // The active child = the one chosen most recently ("Continue as Zara"), else the first one.
  let active = rows[0];
  rows.forEach((row) => {
    if (row.last_selected_at && (!active.last_selected_at || row.last_selected_at >= active.last_selected_at)) {
      active = row;
    }
  });
  return { children, activeId: String(active.id) };
}

async function getChild(userId, childId) {
  const { children } = await listChildren(userId);
  return children.find((child) => child.id === String(childId)) || null;
}

// ---------- create / update / delete ----------

async function createChild(userId, body) {
  const childId = await withTransaction(async (run) => {
    const ageBandId = await findAgeBandId(run, body.ageBand);
    const avatarId = await findAvatarId(run, body.avatar || DEFAULT_AVATAR);
    const language = await checkLanguage(run, body.language || DEFAULT_LANGUAGE);
    const supportIds = await findIdsByName(run, 'supports', body.supports || [], 'area of support');
    const moduleIds =
      body.modules === undefined ? await defaultModuleIds(run) : await findIdsByName(run, 'modules', body.modules, 'activity');

    const result = await run(
      'INSERT INTO children (user_id, name, age_band_id, avatar_id, language_code) VALUES (?, ?, ?, ?, ?)',
      [userId, body.name.trim(), ageBandId, avatarId, language]
    );
    await saveSupports(run, result.insertId, supportIds);
    await saveModules(run, result.insertId, moduleIds);
    if (body.story) await storyService.saveStory(run, result.insertId, body.story);
    return result.insertId;
  });
  return getChild(userId, childId);
}

// Changes only the fields that were sent. supports / modules / story replace the whole list.
async function updateChild(userId, childId, body) {
  await withTransaction(async (run) => {
    if (body.name !== undefined) {
      await run('UPDATE children SET name = ? WHERE id = ?', [body.name.trim(), childId]);
    }
    if (body.ageBand !== undefined) {
      await run('UPDATE children SET age_band_id = ? WHERE id = ?', [await findAgeBandId(run, body.ageBand), childId]);
    }
    if (body.avatar !== undefined) {
      await run('UPDATE children SET avatar_id = ? WHERE id = ?', [await findAvatarId(run, body.avatar), childId]);
    }
    if (body.language !== undefined) {
      await run('UPDATE children SET language_code = ? WHERE id = ?', [await checkLanguage(run, body.language), childId]);
    }
    if (body.supports !== undefined) {
      await saveSupports(run, childId, await findIdsByName(run, 'supports', body.supports, 'area of support'));
    }
    if (body.modules !== undefined) {
      await saveModules(run, childId, await findIdsByName(run, 'modules', body.modules, 'activity'));
    }
    if (body.story !== undefined) {
      await storyService.saveStory(run, childId, body.story);
    }
  });
  return getChild(userId, childId);
}

// Deletes the child for good. Everything that belongs to the child (progress, story answers,
// struggle words, custom topics ...) is removed by ON DELETE CASCADE in the schema.
async function deleteChild(userId, childId) {
  await query('DELETE FROM children WHERE id = ? AND user_id = ?', [childId, userId]);
}

// "Continue as Zara": this child becomes the active one.
async function selectChild(userId, childId) {
  await query('UPDATE children SET last_selected_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ?', [childId, userId]);
  return { activeId: String(childId) };
}

module.exports = {
  findOwnChildId,
  listChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  selectChild,
};
