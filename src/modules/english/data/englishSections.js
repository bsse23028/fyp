// ENGLISH SECTIONS - how the English ("Reading & Writing") hub is organised, following the FYP proposal's
// Modules 1-5 (Table 1.1). Every activity has ONE place:
//
//   1 Read-Along                -> the Read Along topics (ReadingTopics)
//   2 Reading Assist            -> Coming soon
//   3 Words & Phonics           -> its activity page: Alphabet lessons · Phonics (Coming soon)
//   4 Spelling & Letter Sounds  -> its activity page: Spelling · Bubble Pop · Match Pairs · Letter stories
//   5 Handwriting               -> Trace letters (TraceList)
//
// A module = { no, title, subtitle, icon (AppIcon name), accent (CATEGORY name), screen OR activities }
//   screen     = opens that screen straight away (the module has one activity)
//   activities = it opens the activity page (EnglishActivitiesScreen) with these tiles
//   neither    = "Coming soon"
// An activity = { title, subtitle, icon, accent, screen } (no screen = "Coming soon").

export const ENGLISH_MODULES = [
  {
    no: 1,
    title: 'Read-Along',
    subtitle: 'Read stories aloud',
    icon: 'book-open-page-variant',
    accent: 'reading',
    screen: 'ReadingTopics',
  },
  {
    no: 2,
    title: 'Reading Assist',
    subtitle: 'Easy-to-read text, read to me',
    icon: 'format-text',
    accent: 'calm',
  },
  {
    no: 3,
    title: 'Words & Phonics',
    subtitle: 'Letters and their sounds',
    icon: 'alphabetical-variant',
    accent: 'learning',
    activities: [
      { title: 'Alphabets', subtitle: 'Letters and their sounds', icon: 'alphabetical-variant', accent: 'learning', screen: 'AlphabetList' },
      { title: 'Phonics', subtitle: 'Sounds, syllables, words', icon: 'volume-high', accent: 'music' },
    ],
  },
  {
    no: 4,
    title: 'Spelling & Letter Sounds',
    subtitle: 'Build words, letter games',
    icon: 'puzzle',
    accent: 'games',
    activities: [
      { title: 'Spelling', subtitle: 'Drag letters to make a word', icon: 'alphabetical-variant', accent: 'art', screen: 'SpellingWords' },
      { title: 'Bubble Pop', subtitle: 'Pop the letter bubbles', icon: 'balloon', accent: 'games', screen: 'BubblePopGame' },
      { title: 'Match Pairs', subtitle: 'Find big and small letters', icon: 'cards', accent: 'calm', screen: 'MatchPairsGame' },
      { title: 'Letter stories', subtitle: 'Watch a letter come alive', icon: 'movie-open', accent: 'music', screen: 'StoryList' },
    ],
  },
  {
    no: 5,
    title: 'Handwriting',
    subtitle: 'Draw letters with your finger',
    icon: 'draw',
    accent: 'art',
    screen: 'TraceList',
  },
];

export function getEnglishModule(no) {
  return ENGLISH_MODULES.find((module) => module.no === no) || null;
}
