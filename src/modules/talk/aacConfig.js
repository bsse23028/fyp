// AAC CONFIG - every number of the AAC board (screens/AACBoardScreen.js), each with a comment.
// Sizes are in screen points, times in milliseconds.

export const AAC = {
  // ----- the board -----
  SIDE_PADDING: 10, // space left and right of the board (small, so 6 columns fit on a phone)
  GAP: 5, // space between two buttons
  CELL_RADIUS: 14, // rounded corners of a word button
  CELL_BORDER: 2, // thickness of the coloured edge (the word type colour)
  SYMBOL_PART: 0.62, // the picture's size: a part of the button's width (core board)
  TOPIC_SYMBOL_PART: 0.7, // the picture's size on the big topic buttons
  LABEL_SIZE: 12, // the word under the picture (core board)
  TOPIC_LABEL_SIZE: 17, // the word under the picture (topic pages)

  // ----- the sentence strip (top) -----
  MAX_WORDS: 12, // the most words the strip keeps (older words are dropped)
  STRIP_HEIGHT: 76, // height of the sentence strip
  STRIP_SYMBOL: 34, // size of a small picture in the strip
  SPEAK_SIZE: 60, // the round Speak button

  // ----- voice -----
  SPEAK_ON_TAP: true, // true = a word is spoken as soon as it is tapped (most AAC apps do this)
  RATE: 0.8, // speaking speed (1 = normal)
};
