// SPELLING CONFIG - every number of the spelling game lives here, so it can be tuned on a real phone.
// Sizes are in screen points (dp) unless a comment says "canvas pixels" (the 512 x 512 letter pictures).
// Times are in milliseconds, angles in degrees.

export const SPELLING = {
  // ----- how the word is written -----
  ALL_CAPS: false, // true = every word in CAPITAL letters (CAKE); false = as written in spellingWords.js (cake, Faiqa)
  SHOW_EYES: false, // true = each letter gets two little blinking eyes (a simple first version, see LetterEyes.js)
  EYE_SIZE: 0.2, // size of one eye, as a part of the letter's height
  EYE_GAP: 0.25, // space between the two eyes, as a part of one eye
  EYES_Y: 0.4, // how far down the letter the eyes sit (0 = top, 1 = bottom)

  // ----- the word in the middle (the pale placeholder letters) -----
  WORD_SIDE_PADDING: 4, // empty space left and right of the word
  WORD_LETTER_GAP: 14, // space between two letters of the word, in canvas pixels
  MAX_LETTER_SCALE: 0.42, // biggest size of a letter picture (1 = 512 points). Long words get smaller by themselves
  WORD_CENTER: 0.5, // where the word sits between top (0) and bottom (1) of the game area
  WORD_MAX_HEIGHT: 0.36, // the word is never taller than this part of the game area (matters on a wide, low screen)
  PLACEHOLDER_TINT: '#B8AA9A', // pale warm grey of an empty placeholder letter
  PLACEHOLDER_OPACITY: 0.4, // how see-through an empty placeholder is
  HINT_TINT: '#F3CF6B', // soft yellow glow of the placeholder that is the hint
  MAGNET_GLOW: 0.85, // how strong a placeholder glows (in its letter's light colour) while its letter is near

  // ----- the loose letters (scattered above and below the word) -----
  BAND_GAP: 14, // space kept between the word and the loose letters
  BOARD_PADDING: 6, // space kept between the loose letters and the edge of the game area
  REST_TILT: 14, // a loose letter leans by a random angle up to this
  TOUCH_EXTRA: 0.2, // the touch area of a letter is its shape plus this much (0.2 = 20 percent)
  MIN_TOUCH: 56, // ...and never smaller than this
  SHADOW_WIDTH: 0.8, // the soft shadow under a letter: its width as a part of the letter's width
  SHADOW_HEIGHT: 0.1, // ...and its height as a part of the letter's height
  SHADOW_COLOR: 'rgba(70, 50, 30, 0.2)', // shadow colour (soft warm brown)

  // ----- picking up and holding a letter (it feels like soft jelly) -----
  HOLD_SCALE: 1.3, // the letter pops to this size when picked up
  LIFT_ABOVE: 26, // the held letter is drawn this far above the finger, so the finger does not hide it
  SHADOW_HELD_SCALE: 1.35, // the shadow of a held letter grows to this (and gets lighter)
  HOLD_REPEAT_SOUND: 1500, // the letter sound is said once more when the letter is held this long
  JELLY_MIN: 0.8, // "breathing": the letter gets as thin / short as this ...
  JELLY_MAX: 1.25, // ... and as fat / tall as this (width and height swing against each other)
  JELLY_SWING: 600, // one breath from fat to thin
  WOBBLE_ANGLE: 10, // the held letter wobbles left and right by this much
  WOBBLE_SWING: 460, // one wobble from left to right
  STRETCH_MIN: 0.7, // moving fast: the letter gets as thin as this across its direction ...
  STRETCH_MAX: 1.35, // ... and as long as this along its direction
  STRETCH_PER_SPEED: 0.9, // how strongly finger speed stretches the letter (bigger = stretchier)
  FOLLOW_TENSION: 320, // how quickly the letter catches up with the finger (bigger = tighter)
  FOLLOW_FRICTION: 22, // how much it is slowed (smaller = more wobbly trailing)

  // ----- the magnet (near the CORRECT placeholder) -----
  MAGNET_DISTANCE: 1.0, // closer than this many letter heights to its own placeholder = "in the magnet"
  MAGNET_MIN: 56, // ... but the magnet never reaches less far than this (small letters of long words)
  MAGNET_CALM_TIME: 180, // how fast the jelly calms down inside the magnet
  DROP_SLACK: 22, // a drop this close to a WRONG placeholder counts as a wrong try (elsewhere it does not count)

  // ----- letting go -----
  LAND_TENSION: 110, // sliding into the placeholder: bigger = faster
  LAND_FRICTION: 6, // ... smaller = more overshoot
  LAND_SQUASH: 0.6, // the squash on landing (0 = none, 1 = strongest)
  LAND_HOP: 0.14, // after landing the letter does one small hop this high (a part of its height)
  FLASH_OPACITY: 0.85, // the colour flash that "fills" the shape on landing: how strong
  FLASH_IN: 110, // ... how fast it appears
  FLASH_OUT: 320, // ... and fades
  RING_WIDTH: 4, // thickness of the ring that grows out of a landed letter
  RING_GROW: 1.6, // the ring grows to this many times the letter's size
  RING_TIME: 520, // how long the ring takes to grow and fade
  HOME_TENSION: 70, // gliding back home after a wrong drop: bigger = faster
  HOME_FRICTION: 5, // ... smaller = more "boing"
  HINT_AFTER_MISSES: 2, // this many wrong drops of one letter -> its placeholder pulses
  HELP_AFTER_MISSES: 3, // this many wrong drops -> the letter goes to its place by itself
  HELP_DELAY: 1100, // wait before the letter places itself
  HOP_HEIGHT: 0.3, // a hop is this high (a part of the letter's height)

  // ----- the end of a word -----
  PICTURE_SIZE: 150, // the word's picture when it pops OUT of the finished word (its big size)
  PICTURE_SMALL: 0.45, // afterwards it shrinks to this part of its size and sits on top of the word
  PICTURE_PERCH: 0.2, // how much the small picture overlaps the top of the word (a part of its small size)
  WORD_SOLID_COLOR: '#36489F', // the ONE colour the finished word turns into (navy from the letter palette)
  SOLID_TIME: 380, // how long the letters take to turn into that colour
  PICTURE_DANCE_ANGLE: 5, // the picture sways by this much
  FINISH_DELAY: 500, // after the last letter lands, before the word is read
  SPELL_OUT_LETTERS: true, // true = say every letter name first ("c, a, k, e"), then the word
  LETTER_GAP: 150, // pause between two spelled-out letters
  WORD_BOUNCES: 2, // when the word is finished, the whole word bounces this many times
  WORD_BOUNCE_GAP: 520, // time between two bounces of the word
  BUTTONS_DELAY: 900, // after the last bounce, before the Again / Next buttons appear

  // ----- the sentence part (after the word) -----
  SENTENCE_ON: true, // false = no sentence part: the game ends after the word
  SENTENCE_DELAY: 1500, // after the word's "Yaaay!" starts, before the word moves up and the sentence appears
  HEADER_SCALE: 0.5, // the finished word shrinks to this size when it moves to the top
  HEADER_PAD: 4, // space between the top of the game area and the small word (with its picture)
  HEADER_GAP: 12, // space between the small word and the sentence
  SENTENCE_TOP: 6, // space above the first row of the sentence
  SENTENCE_MAX_SCALE: 0.2, // biggest size of the sentence's letters (1 = 512 points); long words make it smaller
  SENTENCE_SPACE: 110, // the space between two words, in canvas pixels
  SENTENCE_MAX_ROWS: 2, // the sentence is made smaller until it fits on this many rows
  SENTENCE_ROW_GAP: 10, // space between two rows of the sentence
  SENTENCE_MAX_HEIGHT: 0.55, // the rows may fill this part of the sentence area (the rest is for the loose words)
  SENTENCE_DOT: 40, // size of the full stop, in canvas pixels
  SENTENCE_DOT_COLOR: '#4A4039', // colour of the full stop (dark warm brown, like the letter rims)
  SENTENCE_READ_DELAY: 500, // after the last word lands, before the sentence is read
};
