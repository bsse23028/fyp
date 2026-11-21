// TRACE CONFIG - every number of the tracing screen (LetterTraceScreen + TraceCanvas) in one place.
// Sizes marked "(grid)" are in the letter grid of data/traceStrokes.js (the box is 100 wide, 115 tall),
// so they grow and shrink with the canvas. Times are in milliseconds.

export const TRACE = {
  // ----- canvas size on screen -----
  CANVAS_WIDTH_FRACTION: 0.8, // canvas width compared to the screen width
  CANVAS_MAX_WIDTH: 340, // never wider than this (points)
  CANVAS_MAX_HEIGHT_FRACTION: 0.5, // never taller than this part of the screen height

  // ----- how the letter road looks (grid) -----
  ROAD_OUTLINE: 19, // the soft grey edge of the "road" the finger follows
  ROAD_WIDTH: 15, // the white road itself
  INK_WIDTH: 10, // the colour line the child draws
  GUIDE_WIDTH: 1.3, // the dashed guide line in the middle of the road
  GUIDE_DASH: [1.6, 3.2], // dash length, gap length
  ARROW_EVERY: 26, // a small arrow on the guide every this much road (grid)
  ARROW_SIZE: 3.2, // arrow size (grid)
  END_RING: 3.6, // the dashed "finish here" ring at the end of a stroke (grid)

  // ----- how forgiving the tracing is -----
  STEP: 1.5, // the road is checked every this much (grid) - smaller = smoother
  TOLERANCE: 14, // how far the finger may be from the road and still count (grid)
  LOOK_AHEAD: 16, // how many road steps ahead the finger may jump (stops cutting corners)
  FINISH_AT: 0.93, // a stroke counts as done at 93% of its length
  DOT_TOLERANCE: 16, // touching this close to a dot finishes it (grid)

  // ----- numbered start badges (points on screen) -----
  BADGE_SIZE: 34, // the round number badge at the start of each stroke
  BADGE_COLORS: ['#E85A64', '#F08A4B', '#8A33CF', '#2F7F73'], // stroke 1, 2, 3, 4 (palette colours, readable with white numbers)

  // ----- the pointing-hand helper -----
  HINT_FIRST_MS: 1500, // the hand shows the first stroke this long after the letter appears
  HINT_IDLE_MS: 4500, // and again after this long without a touch
  HINT_MAX: 3, // at most this many times per stroke
  HINT_SPEED: 22, // ms per grid unit (bigger = slower hand)
  HINT_SIZE: 38, // size of the 👆 hand (points)

  // ----- pacing -----
  STROKE_PAUSE_MS: 450, // pause after a finished stroke before the next one starts
  LETTER_CELEBRATE_MS: 2600, // celebration time after a letter before the small letter comes
  NEXT_LETTER_FLIP_MS: 320, // the canvas shrinks and grows back when the letter changes
};
