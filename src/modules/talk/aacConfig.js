// AAC CONFIG - every number of the AAC board (screens/AACBoardScreen.js), each with a comment.
// Sizes are in screen points, times in milliseconds.

export const AAC = {
  // ----- the board -----
  SIDE_PADDING: 8, // space left and right of the board (small, so 6 columns fit on a phone)
  GAP: 5, // space between two buttons
  CELL_RADIUS: 14, // rounded corners of a word button
  CELL_BORDER: 2.5, // thickness of the coloured edge (the word type colour)
  LABEL_SIZE: 11, // the word under the picture (full core board, small buttons)
  TOPIC_LABEL_SIZE: 16, // the word under the picture (big buttons + topic folders)
  FOLDER_LABEL_SIZE: 14, // the name under a folder picture
  MAX_CELL_RATIO: 1.3, // a button is never taller than this times its width
  MIN_CELL_RATIO: 1.15, // in the views that scroll (All words, Topics, a folder) a button is at least this times its width tall

  // ----- quick words row -----
  QUICK_HEIGHT: 66, // height of the always-visible row (yes, no, please ...)

  // ----- the sentence strip (top) -----
  MAX_WORDS: 12, // the most words the strip keeps (older words are dropped)
  STRIP_HEIGHT: 100, // height of the sentence strip (room for the two small buttons, one above the other)
  STRIP_SYMBOL: 34, // size of a small picture in the strip
  SPEAK_SIZE: 64, // the round Speak button
  SMALL_BUTTON: 44, // the delete-last and clear buttons beside it

  // ----- page arrows / back (under the switch) -----
  ARROW_SIZE: 48, // the round arrow buttons

  // ----- start-up -----
  START_BIG: true, // true = the board opens with BIG buttons (3 pages); the child / parent can switch to all words

  // ----- voice -----
  SPEAK_ON_TAP: true, // true = a word is spoken as soon as it is tapped (most AAC apps do this)
  RATE: 0.8, // speaking speed (1 = normal)
};
