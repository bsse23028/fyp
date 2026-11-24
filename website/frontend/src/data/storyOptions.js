// STORY OPTIONS - the choices and helpers for "Personalize my child's stories".
//
// The idea: collect only things a story can really USE (a name, a favourite
// animal, a place ...). Every field is optional and every field is separate, so
// a story writer (later: the backend) can use each one on its own.
//
// A child's answers are saved on the child as `child.story`:
//   {
//     people:     { preferredName, mother, father, siblings: [names], others: [{ name, relation }] },
//     favourites: { animal, toy, food, colour, character, game },
//     interests:  { hobbies: [], place, storyTypes: [] },
//     everyday:   { hometown, activity, places: [], routine },
//     notes:      'special instructions'
//   }
// Values are saved in English (even when the app is in Urdu), so a story writer always
// gets the same words. To add a choice, add it to a list below (and a line in src/shared/i18n/ur.json).

export const ANIMALS = ['Cat', 'Dog', 'Rabbit', 'Bird', 'Parrot', 'Horse', 'Cow', 'Elephant', 'Fish', 'Lion'];
export const TOYS = ['Ball', 'Toy car', 'Doll', 'Building blocks', 'Teddy bear', 'Train', 'Kite', 'Book'];
export const FOODS = ['Biryani', 'Samosa', 'Mango', 'Ice cream', 'Pizza', 'Chicken', 'Rice', 'Apple'];
export const GAMES = ['Cricket', 'Hide and seek', 'Football', 'Puzzles', 'Dancing', 'Cycling', 'Playing outside', 'Card games'];
export const HOBBIES = ['Drawing', 'Cycling', 'Building blocks', 'Singing', 'Reading', 'Gardening', 'Cooking', 'Swimming'];
export const PLACES = ['Park', 'Garden', 'Beach', 'Village', 'Playground', 'Zoo', 'Market', 'Grandparents’ house'];
export const STORY_TYPES = ['Animals', 'Adventure', 'Nature', 'Everyday life', 'Funny', 'Friendship'];
export const EVERYDAY_ACTIVITIES = [
  'Playing outside',
  'Watching cartoons',
  'Helping in the kitchen',
  'Going to school',
  'Story time',
  'Playing with siblings',
];
export const FAMILIAR_PLACES = ['Home', 'School', 'Playground', 'Park', 'Market', 'Mosque', 'Grandparents’ house', 'Shop'];
export const ROUTINES = ['Bedtime story', 'Family dinner', 'Evening walk', 'Weekend trip', 'Cooking together', 'Visiting relatives'];
export const RELATIONS = ['Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Cousin', 'Friend', 'Teacher', 'Neighbour'];

// name = what the swatch says, hex = its colour
export const COLOURS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Brown', hex: '#A16207' },
  { name: 'Black', hex: '#1F2937' },
  { name: 'White', hex: '#FFFFFF' },
];

// Quick ideas for the "special instructions" box: tap one to add it.
export const NOTE_IDEAS = [
  'Use familiar Pakistani settings.',
  'Include simple daily-life situations.',
  'Avoid scary animals.',
  'Keep sentences short and simple.',
];

export const EMPTY_STORY = {
  people: { preferredName: '', mother: '', father: '', siblings: [], others: [] },
  favourites: { animal: '', toy: '', food: '', colour: '', character: '', game: '' },
  interests: { hobbies: [], place: '', storyTypes: [] },
  everyday: { hometown: '', activity: '', places: [], routine: '' },
  notes: '',
};

// Fills in anything missing, so older / partly filled data never crashes a screen.
export function withDefaults(story) {
  const s = story || {};
  return {
    people: { ...EMPTY_STORY.people, ...(s.people || {}) },
    favourites: { ...EMPTY_STORY.favourites, ...(s.favourites || {}) },
    interests: { ...EMPTY_STORY.interests, ...(s.interests || {}) },
    everyday: { ...EMPTY_STORY.everyday, ...(s.everyday || {}) },
    notes: s.notes || '',
  };
}

// The child's story answers. Profiles from the earlier version only had
// `about: { hobbies, hometown }`, so those two are carried over.
export function getStory(child) {
  if (child && child.story) return withDefaults(child.story);
  const old = (child && child.about) || {};
  const story = withDefaults(null);
  story.everyday.hometown = old.hometown || '';
  story.interests.hobbies = (old.hobbies || []).map((h) => h.charAt(0).toUpperCase() + h.slice(1));
  return story;
}

// Trims text and drops empty names, ready to be saved.
export function cleanStory(story) {
  const trim = (text) => (text || '').trim();
  const trimList = (list) => list.map(trim).filter(Boolean);
  const s = withDefaults(story);
  return {
    people: {
      preferredName: trim(s.people.preferredName),
      mother: trim(s.people.mother),
      father: trim(s.people.father),
      siblings: trimList(s.people.siblings),
      others: s.people.others
        .map((o) => ({ name: trim(o.name), relation: trim(o.relation) }))
        .filter((o) => o.name),
    },
    favourites: {
      animal: trim(s.favourites.animal),
      toy: trim(s.favourites.toy),
      food: trim(s.favourites.food),
      colour: trim(s.favourites.colour),
      character: trim(s.favourites.character),
      game: trim(s.favourites.game),
    },
    interests: {
      hobbies: trimList(s.interests.hobbies),
      place: trim(s.interests.place),
      storyTypes: trimList(s.interests.storyTypes),
    },
    everyday: {
      hometown: trim(s.everyday.hometown),
      activity: trim(s.everyday.activity),
      places: trimList(s.everyday.places),
      routine: trim(s.everyday.routine),
    },
    notes: trim(s.notes),
  };
}

// How many separate details were filled in (shown on the Edit profile menu).
export function countStoryDetails(child) {
  const s = cleanStory(getStory(child));
  let count = 0;
  const add = (value) => {
    if (Array.isArray(value)) count += value.length;
    else if (value) count += 1;
  };
  Object.values(s.people).forEach(add);
  Object.values(s.favourites).forEach(add);
  Object.values(s.interests).forEach(add);
  Object.values(s.everyday).forEach(add);
  add(s.notes);
  return count;
}

// One example sentence made from the answers, so a parent can SEE what they are for.
export function previewSentence(childName, story) {
  const s = cleanStory(story);
  const who = s.people.preferredName || childName;
  const friend = s.people.mother || s.people.siblings[0] || 'a friend';
  const place = (s.interests.place || 'park').toLowerCase();
  const thing = s.favourites.animal ? `a ${s.favourites.animal.toLowerCase()}` : 'a bird';
  return `${who} and ${friend} went to the ${place} and saw ${thing}.`;
}
