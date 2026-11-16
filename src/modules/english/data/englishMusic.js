// ENGLISH MUSIC - the background song of the English module (the ABC song).
// It starts when the child opens any English screen and stops when the child leaves English
// (Child Home, Parent Mode ...). The song loops.
//   file          the song (assets/sounds)
//   volume        loudness on the menu screens (0 = silent, 1 = full)
//   quietVolume   loudness on the screens where the child has to LISTEN (letter sounds, reading, spelling),
//                 so the song does not cover the voice. 0 = no song on those screens.
//   screens       every screen where the song plays (StruggleWords is a Parent screen, so it is not here)
//   quietScreens  the ones that use quietVolume

export const ENGLISH_MUSIC = {
  file: require('../../../../assets/sounds/ABC-Song-Singing-Bell.mp3'),
  volume: 0.25,
  quietVolume: 0.01,
  screens: [
    'EnglishHub',
    'AlphabetList',
    'LetterLesson',
    'WordsHub',
    'SpellingWords',
    'SpellingGame',
    'ReadingTopics',
    'ReadingLevel',
    'ReadingAlong',
    'ReadingYourTurn',
    'ReadingSummary',
  ],
  quietScreens: ['LetterLesson', 'SpellingGame', 'ReadingAlong', 'ReadingYourTurn'],
};
