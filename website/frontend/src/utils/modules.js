// MODULES - links the activities a parent switches on (child.modules, saved on the server, the names come
// from GET /api/options) to what the child can open in Child Mode.
//
//   ENGLISH_SECTIONS   each English hub section and the activity that turns it on
//   HOME_AREAS         each Child Home tile and the activities that turn it on
//   BUILT              activities the website already has a page for
//
// Preview mode (the demo child has no modules) shows everything.

export const ENGLISH_SECTIONS = {
  alphabet: ['Phonics'],
  trace: ['Handwriting'],
  games: ['Phonics'],
  stories: ['Phonics'],
  words: ['Spelling'],
  read: ['Read-Along', 'Reading Assist'],
};

export const HOME_AREAS = {
  english: ['Read-Along', 'Reading Assist', 'Phonics', 'Spelling', 'Handwriting'],
  numbers: ['Number Sense'],
  feelings: ['Emotion Trainer', 'Social Stories'],
  talk: ['AAC Talk Board'],
  myday: ['Routines / Attention'],
  sounds: ['Vowel / Phoneme'],
};

// Activities that already have a page in Child Mode.
export const BUILT = ['Read-Along', 'Reading Assist', 'Phonics', 'Spelling', 'Handwriting'];

// true when the child may use something that needs one of `names`.
export function isOn(child, names) {
  if (!child || child.isDemo) return true;
  const modules = child.modules || [];
  return names.some((name) => modules.includes(name));
}
