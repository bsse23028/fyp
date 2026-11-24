// LEARNING GROUPS - how Child Home is organised, following the FYP proposal (Table 1.1: the 11 KidBuddy
// modules). Child Home shows SIX calm group tiles; every group holds its proposal modules.
//
//   group  = one tile on Child Home: { id, label, iconName, accent, open, modules }
//            open = the ONE screen the tile opens:
//              - 'hub'  -> its group page (LearningGroupScreen) listing its modules ("Coming soon" if not built)
//              - a module name ('english', 'talk') -> that learning module's own entry screen (src/modules)
//   module = one proposal module: { no (the number in the proposal), title, subtitle, iconName, module }
//            module = the learning module in src/modules that builds it (leave it out = "Coming soon")
//
// A module counts as BUILT when its learning module exists in src/modules (moduleEntry returns a screen).
// A child only sees the modules the parent switched on in Edit profile -> Activities (visibleGroups below).
// TO SWITCH A MODULE ON LATER: build it as src/modules/<name>, register it in src/modules/index.js and put
// `module: '<name>'` on its line below. Nothing else has to change.

import { moduleEntry } from '../../modules';
import { activityOn } from '../../shared/utils/childActivities';
import { CATEGORY } from '../../shared/theme/theme';

export const LEARNING_GROUPS = [
  {
    id: 'reading',
    label: 'Reading & Writing',
    iconName: 'book-open-variant',
    accent: CATEGORY.reading,
    open: 'english', // the English hub (Alphabets, Trace, Games, Stories, Words, Sentences)
    modules: [
      { no: 1, title: 'Read-Along', subtitle: 'Read aloud, struggle words come back', iconName: 'book-open-page-variant', module: 'english' },
      { no: 2, title: 'Reading Assist', subtitle: 'Easy-to-read text, read to me', iconName: 'format-text' },
      { no: 3, title: 'Words & Phonics', subtitle: 'Sounds, syllables, words', iconName: 'alphabetical-variant', module: 'english' },
      { no: 4, title: 'Spelling & Letter Sounds', subtitle: 'Build words, letter sounds', iconName: 'puzzle', module: 'english' },
      { no: 5, title: 'Handwriting', subtitle: 'Trace and form letters', iconName: 'draw', module: 'english' },
    ],
  },
  {
    id: 'sounds',
    label: 'Speech Sounds',
    iconName: 'microphone',
    accent: CATEGORY.music,
    open: 'hub',
    modules: [{ no: 6, title: 'Vowels & Sounds', subtitle: 'Say sounds like the mouth shows (with Urdu)', iconName: 'account-voice' }],
  },
  {
    id: 'feelings',
    label: 'Feelings & Stories',
    iconName: 'heart',
    accent: CATEGORY.calm,
    open: 'hub',
    modules: [
      { no: 7, title: 'Feelings Faces', subtitle: 'Name and show feelings', iconName: 'emoticon-happy-outline' },
      { no: 10, title: 'Social Stories', subtitle: 'Choose what to do, see what happens', iconName: 'book-account' },
    ],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    iconName: 'numeric',
    accent: CATEGORY.learning,
    open: 'hub',
    modules: [{ no: 8, title: 'Number Sense', subtitle: 'Counting, number line, blocks, clocks', iconName: 'abacus' }],
  },
  {
    id: 'talk',
    label: 'Talk',
    iconName: 'chat',
    accent: CATEGORY.art,
    open: 'talk', // straight to the AAC board (one module, one tap)
    modules: [{ no: 9, title: 'Talk Board (AAC)', subtitle: 'Tap pictures to speak', iconName: 'chat', module: 'talk' }],
  },
  {
    id: 'myday',
    label: 'My Day',
    iconName: 'weather-sunny',
    accent: CATEGORY.games,
    open: 'hub',
    modules: [{ no: 11, title: 'Routines & Life Skills', subtitle: 'My day, self-care steps, thinking games', iconName: 'calendar-check' }],
  },
];

// The screen a module opens (null = not built yet).
export function moduleScreen(item) {
  return item.module ? moduleEntry(item.module) : null;
}

// Is anything in this group built yet?
export function groupIsBuilt(group) {
  return group.modules.some((item) => moduleScreen(item));
}

// The screen (and its params) the group's Child Home tile opens.
export function groupTarget(group) {
  if (group.open === 'hub') return { screen: 'LearningGroup', params: { groupId: group.id } };
  const screen = moduleEntry(group.open);
  return screen ? { screen } : { screen: 'LearningGroup', params: { groupId: group.id } };
}

export function getGroup(id) {
  return LEARNING_GROUPS.find((group) => group.id === id) || null;
}

// The groups THIS child may see: each group keeps only the modules the parent switched on
// (shared/utils/childActivities.js), and a group with none left is hidden.
export function visibleGroups(child) {
  return LEARNING_GROUPS.map((group) => ({ ...group, modules: group.modules.filter((item) => activityOn(child, item.no)) })).filter(
    (group) => group.modules.length > 0
  );
}
