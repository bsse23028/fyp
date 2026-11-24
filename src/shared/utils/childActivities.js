// CHILD ACTIVITIES - which of the 11 proposal modules a child may see in Child Mode.
//
// The parent switches activities on / off in Edit profile -> Activities (saved as child.modules,
// the server's activity names). Child Mode only shows the ones that are ON:
//   Child Home        a group tile only when at least one of its modules is on
//   a group page      only its modules that are on
//   Reading & Writing only its modules (1-5) that are on
//
// In Explore KidBuddy (the demo child, isDemo) EVERYTHING is shown, so a parent can try it all.
//
// ACTIVITY_BY_NO links the proposal module number (Table 1.1) to the activity name in the profile.
// If an activity is renamed on the server, change its name here.

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
  if (!child || child.isDemo) return true; // no child (should not happen) or Explore mode: show everything
  return (child.modules || []).includes(ACTIVITY_BY_NO[no]);
}
