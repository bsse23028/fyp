// CHILD VALIDATION - checks the body of create / update child profile.
//
// The body uses the SAME shape the app already uses for a child:
//   {
//     name: 'Zara', ageBand: '4–6 years', avatar: 'rabbit', language: 'en',
//     supports: ['Reading'], modules: ['Read-Along'],
//     story: { people: {...}, favourites: {...}, interests: {...}, everyday: {...}, notes: '' }
//   }
// Here we only check TYPES and LENGTHS. Whether 'Reading' or 'rabbit' really exist is checked
// against the database in services/childService.js.

const { isText, isOptionalText, isTextList, isPlainObject } = require('./rules');
const { onlyProblems } = require('./authValidation');

// Every story answer and its limit. single = one text, list = several texts.
const STORY_SHAPE = {
  people: { preferredName: 'single', mother: 'single', father: 'single', siblings: 'list', others: 'others' },
  favourites: { animal: 'single', toy: 'single', food: 'single', colour: 'single', character: 'single', game: 'single' },
  interests: { hobbies: 'list', place: 'single', storyTypes: 'list' },
  everyday: { hometown: 'single', activity: 'single', places: 'list', routine: 'single' },
};
const MAX_ANSWER_LENGTH = 100;
const MAX_LIST_ITEMS = 20;
const MAX_NOTES_LENGTH = 1000;

function storyProblems(story) {
  if (!isPlainObject(story)) return ['story must be an object.'];
  const problems = [];

  Object.keys(STORY_SHAPE).forEach((section) => {
    const answers = story[section];
    if (answers === undefined) return; // a missing section simply means "nothing filled in"
    if (!isPlainObject(answers)) {
      problems.push(`story.${section} must be an object.`);
      return;
    }
    Object.entries(STORY_SHAPE[section]).forEach(([key, kind]) => {
      const value = answers[key];
      if (value === undefined) return;
      const where = `story.${section}.${key}`;
      if (kind === 'single' && !isOptionalText(value, MAX_ANSWER_LENGTH)) {
        problems.push(`${where} must be text of ${MAX_ANSWER_LENGTH} characters at most.`);
      }
      if (kind === 'list' && !(Array.isArray(value) && value.length <= MAX_LIST_ITEMS && value.every((v) => isOptionalText(v, MAX_ANSWER_LENGTH)))) {
        problems.push(`${where} must be a list of at most ${MAX_LIST_ITEMS} short texts.`);
      }
      if (kind === 'others') {
        const ok =
          Array.isArray(value) &&
          value.length <= MAX_LIST_ITEMS &&
          value.every((o) => isPlainObject(o) && isOptionalText(o.name, MAX_ANSWER_LENGTH) && isOptionalText(o.relation, 40));
        if (!ok) problems.push(`${where} must be a list of { name, relation }.`);
      }
    });
  });

  if (story.notes !== undefined && !isOptionalText(story.notes, MAX_NOTES_LENGTH)) {
    problems.push(`story.notes must be text of ${MAX_NOTES_LENGTH} characters at most.`);
  }
  return problems;
}

// Checks the fields that are present. `required` = the fields a NEW child must have.
function childFieldProblems(body, required) {
  const has = (field) => body[field] !== undefined;
  const problems = [];

  if (has('name') || required) {
    if (!isText(body.name, 60)) problems.push('Enter your child’s nickname (60 characters at most).');
  }
  if (has('ageBand') || required) {
    if (!isText(body.ageBand, 30)) problems.push('Choose an age band.');
  }
  if (has('avatar') && !isText(body.avatar, 20)) problems.push('Choose an avatar.');
  if (has('language') && !isText(body.language, 2)) problems.push('Choose a language.');
  if (has('supports') && !isTextList(body.supports, 20, 60)) problems.push('supports must be a list of areas of support.');
  if (has('modules') && !isTextList(body.modules, 30, 60)) problems.push('modules must be a list of activities.');
  if (has('story')) problems.push(...storyProblems(body.story));
  return problems;
}

function checkCreateChild(body) {
  return onlyProblems(childFieldProblems(body, true));
}

function checkUpdateChild(body) {
  const editable = ['name', 'ageBand', 'avatar', 'language', 'supports', 'modules', 'story'];
  if (!editable.some((field) => body[field] !== undefined)) {
    return [`Send at least one field to change: ${editable.join(', ')}.`];
  }
  return onlyProblems(childFieldProblems(body, false));
}

module.exports = { checkCreateChild, checkUpdateChild };
