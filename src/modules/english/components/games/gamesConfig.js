// GAMES CONFIG - every number of the letter games (Bubble Pop and Match Pairs) in one place.
// Times are in milliseconds, sizes in points.

export const BUBBLE_GAME = {
  ROUNDS: 3, // how many letters one game has (a new target letter each round)
  POPS_PER_ROUND: 4, // how many right bubbles the child pops to finish a round
  BUBBLES: 7, // bubbles floating at the same time (more = busier; keep it calm)
  RIGHT_SHARE: 0.45, // about this part of the bubbles carry the target letter
  SIZE_MIN: 84, // the smallest bubble
  SIZE_MAX: 104, // the biggest bubble
  RISE_MIN_MS: 9000, // the fastest bubble takes this long to float from bottom to top (slow on purpose)
  RISE_MAX_MS: 13000, // the slowest bubble
  SWAY: 18, // how far a bubble sways left and right while it floats
  SWAY_MS: 2400, // one sway
  LETTER_SCALE: 0.2, // letter picture size inside a bubble (of the 512 canvas)
  HINT_AFTER_MS: 5000, // the right bubbles glow after this long without a find
  ROUND_PAUSE_MS: 2400, // celebration time between two rounds
};

export const MATCH_GAME = {
  PAIRS: 4, // how many capital/small pairs (8 cards)
  PEEK_MS: 2600, // at the start the cards show their faces this long, then turn over (helps toddlers)
  FLIP_MS: 260, // one card turning over
  MISS_SHOW_MS: 1300, // two different cards stay open this long, then turn back
  HELP_AFTER_MISSES: 3, // after this many misses in a row, one pair glows as a hint
  CARD_GAP: 12, // space between cards
  LETTER_SCALE_PER_POINT: 0.0026, // letter picture size compared to the card width
  BACK_COLORS: ['#B9D9F2', '#F6C9B7', '#C9E5BE', '#E0D3F5'], // the soft colours of the card backs
};
