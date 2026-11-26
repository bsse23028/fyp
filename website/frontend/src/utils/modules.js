// MODULES - how Child Mode is organised, the same as the mobile app (it follows the FYP proposal, Table 1.1:
// the 11 KidBuddy modules). Ported from the app's childActivities.js, learningGroups.js and englishSections.js.
//
//   ACTIVITY_BY_NO   proposal module number (1-11) -> the activity name saved on the child (child.modules,
//                    the server's names from GET /api/options)
//   activityOn       is module `no` switched on for this child? (Preview / the demo child = everything)
//   LEARNING_GROUPS  Child Home = SIX group tiles, each holding its proposal modules
//   visibleGroups    the groups THIS child may see: only modules that are switched on, empty groups hidden
//   ENGLISH_MODULES  the "Reading & Writing" hub = proposal Modules 1-5
//   BUILT_ACTIVITIES the activity names that already have a page in Child Mode
//
// A module is BUILT when it has a `module` (the learning module that builds it: 'english' or 'talk').
// To switch a module on later: build its page and put `module: '<name>'` on its line. Nothing else changes.

export const ACTIVITY_BY_NO = {
  1: 'Read-Along',
  2: 'Reading Assist',
  3: 'Phonics',
  4: 'Spelling',
  5: 'Handwriting',
  6: 'Vowel / Phoneme',
  7: 'Emotion Trainer',
  8: 'Number Sense',
  9: 'AAC Talk Board',
  10: 'Social Stories',
  11: 'Routines / Attention',
};

// Is proposal module `no` switched on for this child?
export function activityOn(child, no) {
  if (!child || child.isDemo) return true; // no child, or Explore KidBuddy: show everything
  return (child.modules || []).includes(ACTIVITY_BY_NO[no]);
}

// The page each learning module opens.
export const MODULE_ENTRY = {
  english: '/child/english',
  talk: '/child/talk',
};

// icon = an Icon name, tone = the Child Home tile colour (kh-module.<tone>)
export const LEARNING_GROUPS = [
  {
    id: 'reading',
    label: 'Reading & Writing',
    icon: 'book-open-variant',
    tone: 'blue',
    open: 'english', // straight to the English hub (modules 1-5)
    modules: [
      { no: 1, title: 'Read-Along', subtitle: 'Read aloud, struggle words come back', icon: 'book-open-page-variant-outline', module: 'english' },
      { no: 2, title: 'Reading Assist', subtitle: 'Easy-to-read text, read to me', icon: 'format-text' },
      { no: 3, title: 'Words & Phonics', subtitle: 'Sounds, syllables, words', icon: 'alphabetical-variant', module: 'english' },
      { no: 4, title: 'Spelling & Letter Sounds', subtitle: 'Build words, letter sounds', icon: 'puzzle-outline', module: 'english' },
      { no: 5, title: 'Handwriting', subtitle: 'Trace and form letters', icon: 'draw', module: 'english' },
    ],
  },
  {
    id: 'sounds',
    label: 'Speech Sounds',
    icon: 'volume-high',
    tone: 'sky',
    open: 'hub',
    modules: [{ no: 6, title: 'Vowels & Sounds', subtitle: 'Say sounds like the mouth shows (with Urdu)', icon: 'account-voice' }],
  },
  {
    id: 'feelings',
    label: 'Feelings & Stories',
    icon: 'heart-outline',
    tone: 'coral',
    open: 'hub',
    modules: [
      { no: 7, title: 'Feelings Faces', subtitle: 'Name and show feelings', icon: 'emoticon-happy-outline' },
      { no: 10, title: 'Social Stories', subtitle: 'Choose what to do, see what happens', icon: 'book-account' },
    ],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    icon: 'numeric',
    tone: 'gold',
    open: 'hub',
    modules: [{ no: 8, title: 'Number Sense', subtitle: 'Counting, number line, blocks, clocks', icon: 'abacus' }],
  },
  {
    id: 'talk',
    label: 'Talk',
    icon: 'chat-outline',
    tone: 'sage',
    open: 'talk', // straight to the AAC board (one module, one tap)
    modules: [{ no: 9, title: 'Talk Board (AAC)', subtitle: 'Tap pictures to speak', icon: 'chat-outline', module: 'talk' }],
  },
  {
    id: 'myday',
    label: 'My Day',
    icon: 'weather-sunny',
    tone: 'purple',
    open: 'hub',
    modules: [{ no: 11, title: 'Routines & Life Skills', subtitle: 'My day, self-care steps, thinking games', icon: 'calendar-check' }],
  },
];

// The page a module opens (null = not built yet).
export function moduleScreen(item) {
  return item.module ? MODULE_ENTRY[item.module] : null;
}

// Is anything in this group built yet?
export function groupIsBuilt(group) {
  return group.modules.some((item) => moduleScreen(item));
}

// Where the group's Child Home tile goes.
export function groupTarget(group) {
  if (group.open !== 'hub' && MODULE_ENTRY[group.open]) return MODULE_ENTRY[group.open];
  return `/child/group/${group.id}`;
}

export function getGroup(id) {
  return LEARNING_GROUPS.find((group) => group.id === id) || null;
}

// The groups THIS child may see: each keeps only the modules the parent switched on, and a group with none left is hidden.
export function visibleGroups(child) {
  return LEARNING_GROUPS.map((group) => ({ ...group, modules: group.modules.filter((item) => activityOn(child, item.no)) })).filter(
    (group) => group.modules.length > 0
  );
}

// ---------- the English ("Reading & Writing") hub = proposal Modules 1-5 ----------
// A module = { no, title, subtitle, icon, tone, to OR activities }
//   to          = opens that page straight away (the module has one activity)
//   activities  = opens the activities page /child/english/activities/:no with these tiles
//   neither     = "Coming soon"
// An activity = { title, subtitle, icon, tone, to } (no `to` = "Coming soon").
export const ENGLISH_MODULES = [
  { no: 1, title: 'Read-Along', subtitle: 'Read stories aloud', icon: 'book-open-page-variant-outline', tone: 'berry', to: '/child/english/read' },
  { no: 2, title: 'Reading Assist', subtitle: 'Easy-to-read text, read to me', icon: 'format-text', tone: 'sky' },
  {
    no: 3,
    title: 'Words & Phonics',
    subtitle: 'Letters and their sounds',
    icon: 'alphabetical-variant',
    tone: 'leaf',
    activities: [
      { title: 'Alphabets', subtitle: 'Letters and their sounds', icon: 'alphabetical-variant', tone: 'leaf', to: '/child/english/alphabet' },
      { title: 'Phonics', subtitle: 'Sounds, syllables, words', icon: 'volume-high', tone: 'sky' },
    ],
  },
  {
    no: 4,
    title: 'Spelling & Letter Sounds',
    subtitle: 'Build words, letter games',
    icon: 'puzzle-outline',
    tone: 'sun',
    activities: [
      { title: 'Spelling', subtitle: 'Drag letters to make a word', icon: 'alphabetical-variant', tone: 'berry', to: '/child/english/spell' },
      { title: 'Bubble Pop', subtitle: 'Pop the letter bubbles', icon: 'balloon', tone: 'sun', to: '/child/english/games/bubbles' },
      { title: 'Match Pairs', subtitle: 'Find big and small letters', icon: 'cards-outline', tone: 'sky', to: '/child/english/games/pairs' },
      { title: 'Letter stories', subtitle: 'Watch a letter come alive', icon: 'movie-open-outline', tone: 'leaf', to: '/child/english/stories' },
    ],
  },
  { no: 5, title: 'Handwriting', subtitle: 'Draw letters with your finger', icon: 'draw', tone: 'berry', to: '/child/english/trace' },
];

export function getEnglishModule(no) {
  return ENGLISH_MODULES.find((module) => module.no === Number(no)) || null;
}

// Which proposal module each English page belongs to (so a switched-off module is not reachable, even by a saved link).
export const ENGLISH_PAGE_MODULE = {
  read: 1,
  alphabet: 3,
  spell: 4,
  games: 4,
  stories: 4,
  trace: 5,
};

// Activities that already have a page in Child Mode (shown "In Child Mode" on the Progress page).
export const BUILT_ACTIVITIES = ['Read-Along', 'Phonics', 'Spelling', 'Handwriting', 'AAC Talk Board'];
