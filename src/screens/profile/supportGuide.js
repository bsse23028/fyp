// SUPPORT GUIDE - helps a parent choose "Areas of support" and see which activities fit them.
// Used by EditChildSectionScreen ('support' and 'modules' sections). Only text and lists, no server.
//
//   SUPPORT_GROUPS   the areas of support in 3 categories, each area with a short explanation
//   DIAGNOSES        "If your child has been diagnosed with X, we recommend these areas" (per category)
//   MODULE_ABOUT     one short line about every activity
//
// The area names must match the server's names exactly (Reading, Writing, Numbers, ...).
// To add a diagnosis: add { name, about, recommend: [area names] } to the right group.
// `color` is a key of CATEGORY in shared/theme/theme.js.

export const SUPPORT_GROUPS = [
  {
    key: 'learning',
    title: 'Learning',
    icon: 'book-open-variant',
    color: 'reading',
    areas: [
      { name: 'Reading', about: 'Letters, sounds, phonics and reading words.' },
      { name: 'Writing', about: 'Holding a pencil, forming letters and spelling.' },
      { name: 'Numbers', about: 'Counting, number sense and simple maths.' },
    ],
    diagnoses: [
      { name: 'Dyslexia', about: 'Trouble linking letters to sounds.', recommend: ['Reading', 'Writing'] },
      { name: 'Dysgraphia', about: 'Trouble with handwriting and spelling.', recommend: ['Writing'] },
      { name: 'Dyscalculia', about: 'Trouble understanding numbers.', recommend: ['Numbers'] },
    ],
  },
  {
    key: 'communication',
    title: 'Communication',
    icon: 'chat-processing-outline',
    color: 'music',
    areas: [
      { name: 'Speech and language', about: 'Saying sounds and words, and understanding them.' },
      { name: 'Social communication', about: 'Feelings, taking turns and talking with others.' },
    ],
    diagnoses: [
      {
        name: 'Autism (ASD)',
        about: 'Differences in communication, social skills and routines.',
        recommend: ['Social communication', 'Speech and language', 'Attention and routine'],
      },
      {
        name: 'Speech or language delay',
        about: 'Talking later or less clearly than other children.',
        recommend: ['Speech and language', 'Social communication'],
      },
      { name: 'Non-verbal / minimally verbal', about: 'Uses few or no spoken words.', recommend: ['Speech and language'] },
    ],
  },
  {
    key: 'everyday',
    title: 'Everyday life',
    icon: 'calendar-check-outline',
    color: 'calm',
    areas: [
      { name: 'Attention and routine', about: 'Focusing, waiting and following the steps of the day.' },
      { name: 'Daily living', about: 'Washing, dressing, eating and other daily tasks.' },
    ],
    diagnoses: [
      { name: 'ADHD', about: 'Trouble with focus, sitting still or waiting.', recommend: ['Attention and routine'] },
      {
        name: 'Intellectual disability',
        about: 'Learns new skills more slowly.',
        recommend: ['Daily living', 'Attention and routine', 'Speech and language'],
      },
      {
        name: 'Global developmental delay',
        about: 'Reaches several milestones later.',
        recommend: ['Speech and language', 'Daily living', 'Attention and routine'],
      },
    ],
  },
];

// One short line about each activity (shown under its name in "Activities").
export const MODULE_ABOUT = {
  'Read-Along': 'Reads aloud while the app listens.',
  'Reading Assist': 'Help with reading words and sentences.',
  Phonics: 'Letter sounds and blending.',
  Spelling: 'Builds words letter by letter.',
  Handwriting: 'Traces letters, checked with the camera.',
  'Vowel / Phoneme': 'Practises saying sounds clearly.',
  'Emotion Trainer': 'Names and shows feelings.',
  'Number Sense': 'Counting and comparing numbers.',
  'AAC Talk Board': 'Talks by tapping pictures.',
  'Social Stories': 'Short stories about everyday situations.',
  'Routines / Attention': 'Step-by-step daily routines.',
};

// The areas of support that are not in any group above (a new one from the server) go in "Other".
export function groupsFor(serverAreas) {
  const known = SUPPORT_GROUPS.flatMap((g) => g.areas.map((a) => a.name));
  const groups = SUPPORT_GROUPS.map((g) => ({ ...g, areas: g.areas.filter((a) => serverAreas.includes(a.name)) }));
  const others = serverAreas.filter((name) => !known.includes(name));
  if (others.length > 0) {
    groups.push({ key: 'other', title: 'Other', icon: 'dots-horizontal', color: 'games', areas: others.map((name) => ({ name, about: '' })), diagnoses: [] });
  }
  return groups;
}

// The activities that match the chosen areas, each with the areas it helps ("why it is recommended").
export function recommendedFor(modules, supports) {
  return modules
    .map((m) => ({ ...m, because: (m.supports || []).filter((s) => supports.includes(s)) }))
    .filter((m) => m.because.length > 0);
}
