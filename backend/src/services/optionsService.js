// OPTIONS SERVICE - the lists the app shows in its forms (replaces childOptions.js, the
// avatar list, the relation list and the reading levels). They come from the lookup tables
// filled by 02_seed.sql, so adding an option is one INSERT, no app update needed.

const { query } = require('../db/connection');
const { getLevels } = require('./readingService');

async function getOptions() {
  const languages = await query(
    'SELECT code, name, native_name, is_rtl FROM languages WHERE is_active = 1 ORDER BY code'
  );
  const ageBands = await query('SELECT code, label, min_age, max_age FROM age_bands ORDER BY sort_order');
  const avatars = await query('SELECT code, name FROM avatars WHERE is_active = 1 ORDER BY sort_order');
  const supports = await query('SELECT code, name FROM supports ORDER BY sort_order');
  const modules = await query(
    `SELECT m.id, m.code, m.name, se.name AS sensor, m.is_available, m.on_by_default
       FROM modules m LEFT JOIN sensors se ON se.id = m.sensor_id
      ORDER BY m.sort_order`
  );
  const moduleSupports = await query(
    `SELECT ms.module_id, s.name FROM module_supports ms JOIN supports s ON s.id = ms.support_id
      ORDER BY s.sort_order`
  );
  const relations = await query('SELECT code, name FROM relations ORDER BY sort_order');
  const storyFields = await query(
    'SELECT code, section, label, is_multi, has_relation FROM story_fields ORDER BY sort_order'
  );

  return {
    languages: languages.map((l) => ({ code: l.code, name: l.name, nativeName: l.native_name, isRtl: !!l.is_rtl })),
    ageBands: ageBands.map((a) => ({ code: a.code, label: a.label, minAge: a.min_age, maxAge: a.max_age })),
    avatars,
    supports,
    modules: modules.map((m) => ({
      code: m.code,
      name: m.name,
      sensor: m.sensor || '',
      isAvailable: !!m.is_available,
      onByDefault: !!m.on_by_default,
      supports: moduleSupports.filter((ms) => ms.module_id === m.id).map((ms) => ms.name),
    })),
    relations,
    storyFields: storyFields.map((f) => ({
      code: f.code,
      section: f.section,
      label: f.label,
      isMulti: !!f.is_multi,
      hasRelation: !!f.has_relation,
    })),
    readingLevels: await getLevels(),
  };
}

module.exports = { getOptions };
