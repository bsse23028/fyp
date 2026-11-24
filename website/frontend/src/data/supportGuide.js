// SUPPORT GUIDE - (copied from the mobile app: src/screens/profile/supportGuide.js) helps a parent choose "Areas of support" and see which activities fit them.
// Used by the profile's 'Areas of support' and 'Activities' pages (EditSectionPage). Only text and lists, no server.
//
//   SUPPORT_GROUPS   the areas of support in 3 categories, each area with a short explanation, and
//                    the diagnoses of that category: "If your child has been diagnosed with X, we recommend ..."
//   MODULE_ABOUT     one short line about every activity
//
// THE DIAGNOSES FOLLOW THE FYP PROPOSAL: the 7 conditions of Section 1 (dyslexia, dysgraphia, dyscalculia,
// IDD, ASD, ADHD, communication disorders) and, in `modules`, exactly the modules of Table 1.1
// "Proposed KidBuddy modules and the condition domains they serve". `recommend` = the areas of support
// those modules belong to (so the activities list can recommend them too).
//
// The area and activity names must match the server's names exactly (Reading, Read-Along, ...).
// To add a diagnosis: add { name, about, recommend: [area names], modules: [activity names] } to the right group.
// `color` = the tone of the group (reading / music / calm / games) used by the pages.

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
      {
        name: 'Dyslexia',
        about: 'Difficulty with reading: letter and word reversals, slow reading, spelling errors.',
        recommend: ['Reading', 'Writing'],
        modules: ['Read-Along', 'Reading Assist', 'Phonics', 'Spelling', 'Handwriting'],
      },
      {
        name: 'Dysgraphia',
        about: 'Difficulty with writing: letter formation, spacing and pencil control.',
        recommend: ['Writing', 'Reading'],
        modules: ['Handwriting', 'Spelling', 'Phonics', 'Read-Along', 'Reading Assist'],
      },
      {
        name: 'Dyscalculia',
        about: 'A weak number sense: judging amounts and linking numbers to them.',
        recommend: ['Numbers'],
        modules: ['Number Sense'],
      },
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
        about: 'Differences in social communication; recognising emotions and expressing needs.',
        recommend: ['Social communication', 'Speech and language', 'Attention and routine'],
        modules: ['Emotion Trainer', 'AAC Talk Board', 'Social Stories', 'Vowel / Phoneme', 'Routines / Attention'],
      },
      {
        name: 'Communication disorder',
        about: 'Difficulty with speech sounds, language or fluency (for example stuttering).',
        recommend: ['Speech and language', 'Reading'],
        modules: ['Vowel / Phoneme', 'AAC Talk Board', 'Read-Along', 'Reading Assist', 'Phonics', 'Spelling'],
      },
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
      {
        name: 'ADHD',
        about: 'Difficulty with attention, working memory, routines and time.',
        recommend: ['Attention and routine', 'Social communication', 'Speech and language'],
        modules: ['Routines / Attention', 'Social Stories', 'Emotion Trainer', 'Vowel / Phoneme'],
      },
      {
        name: 'Intellectual developmental disability (IDD)',
        about: 'Difficulty with reasoning and everyday independence such as self-care.',
        recommend: ['Daily living', 'Attention and routine', 'Social communication'],
        modules: ['Routines / Attention', 'AAC Talk Board', 'Social Stories'],
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

// Every diagnosis of every group, in one list.
export const ALL_DIAGNOSES = SUPPORT_GROUPS.flatMap((g) => g.diagnoses);

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

// The activities to offer after saving the areas of support:
//   - for every diagnosis the parent chose (and whose areas are all still ticked): exactly its proposal modules
//   - for areas ticked by hand (not from a diagnosis): the activities of those areas
// `serverModules` = the activity list from the server, so only real activity names come back.
export function activitiesToOffer(serverModules, supports, chosenDiagnoses) {
  const names = serverModules.map((m) => m.name);
  const active = ALL_DIAGNOSES.filter(
    (d) => chosenDiagnoses.includes(d.name) && d.recommend.every((area) => supports.includes(area))
  );
  const fromDiagnoses = active.flatMap((d) => d.modules);
  const coveredAreas = active.flatMap((d) => d.recommend);
  const handAreas = supports.filter((area) => !coveredAreas.includes(area));
  const fromAreas = recommendedFor(serverModules, handAreas).map((m) => m.name);
  return [...new Set([...fromDiagnoses, ...fromAreas])].filter((name) => names.includes(name));
}
