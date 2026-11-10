// CHILD OPTIONS - the choices a parent can pick for a child profile.
// Used by "Create child profile" and by the "Edit profile" sections.
// To add an option, add it to the list here.

export const AGE_BANDS = ['4–6 years', '7–9 years', '10–12 years'];

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ur', label: 'اردو' },
];

export const SUPPORT_OPTIONS = [
  'Reading',
  'Writing',
  'Numbers',
  'Speech and language',
  'Attention and routine',
  'Social communication',
  'Daily living',
];

// Every activity. `sensor` is only an information badge. `supports` says which
// areas of support suggest it (used by "Suggest from areas of support").
export const MODULES = [
  { name: 'Read-Along', sensor: 'Mic', supports: ['Reading'] },
  { name: 'Reading Assist', sensor: '', supports: ['Reading'] },
  { name: 'Phonics', sensor: '', supports: ['Reading'] },
  { name: 'Spelling', sensor: '', supports: ['Reading', 'Writing'] },
  { name: 'Handwriting', sensor: 'Camera', supports: ['Writing'] },
  { name: 'Vowel / Phoneme', sensor: 'Mic', supports: ['Speech and language'] },
  { name: 'Emotion Trainer', sensor: 'Camera', supports: ['Social communication'] },
  { name: 'Number Sense', sensor: 'Camera', supports: ['Numbers'] },
  { name: 'AAC Talk Board', sensor: '', supports: ['Speech and language', 'Social communication'] },
  { name: 'Social Stories', sensor: '', supports: ['Social communication'] },
  { name: 'Routines / Attention', sensor: '', supports: ['Attention and routine', 'Daily living'] },
];

// Activities switched on for a NEW child: everything except the two camera-heavy ones (as in Figma).
export function defaultModules() {
  return MODULES.filter((m) => m.name !== 'Handwriting' && m.name !== 'Number Sense').map((m) => m.name);
}

// Activities that match the chosen areas of support.
export function suggestModules(supports) {
  if (supports.length === 0) return defaultModules();
  return MODULES.filter((m) => m.supports.some((s) => supports.includes(s))).map((m) => m.name);
}

// Add or remove one item from a list.
export function toggleInList(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
