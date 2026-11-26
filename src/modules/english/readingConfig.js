// READING CONFIG - the sizes of the Read Along screens (Reading Time and Your turn), each with a comment.
// Sizes are in screen points. The look follows the website's reading page, in the app's own colours.

export const READING = {
  // ----- the passage on Reading Time -----
  WORD_SIZE: 36, // size of the words
  WORD_SIZE_SMALL: 30, // size of the words on a small phone
  SMALL_PHONE_HEIGHT: 720, // a screen lower than this counts as a small phone
  LINE_HEIGHT: 1.5, // line height as a part of the word size (bigger = more room between lines)

  // ----- the sentence on Your turn -----
  TURN_WORD_SIZE: 32, // size of the words

  // ----- the glowing word (both screens) -----
  WORD_RADIUS: 12, // rounded corners of the glow
  WORD_PADDING: 8, // space left and right inside the glow (every word has it, so words never jump)
  UNDERLINE: 6, // thickness of the gold line under the glowing word

  // ----- the progress bars at the top (one per sentence) -----
  BAR_WIDTH: 44, // widest one bar can be (they get narrower when there are many sentences)
  BAR_HEIGHT: 10, // height of a bar
  BAR_GAP: 8, // space between two bars

  // ----- the buttons under the passage -----
  NEXT_HEIGHT: 60, // height of the Next sentence button
  ACTIONS_GAP: 20, // space between the microphone and the Next sentence button
};
