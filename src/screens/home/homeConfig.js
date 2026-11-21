// HOME CONFIG - every number and switch of the Child Home screen lives here, each with a comment.
// Sizes are in screen points, times in milliseconds.

import { CALM, PALETTE } from '../../shared/theme/theme';

export const HOME = {
  // ----- switches -----
  USE_BLUR: true, // true = real blur behind the glass (expo-blur); false = only a see-through white layer (use this if it lags or looks bad)
  BLUR_INTENSITY: 30, // how strong the blur is (1 to 100)
  BLUR_CARDS: false, // true = the six module cards are blurred too (prettier, but heavier for the phone)
  SHOW_SHAPES: false, // true = the big soft drifting shapes behind everything (off = the flat inspo look)
  USE_SHEET: true, // true = "What shall we learn?" and the module tiles sit on the rounded pale sheet (inspo look)

  // ----- the buddy (hero) -----
  BUDDY_SIZE: 150, // height of the buddy
  HERO_GAP: 14, // space between the buddy and the speech bubble / stars chip
  BUBBLE_DELAY: 250, // after the buddy has arrived and waved, wait this long before the greeting bubble appears

  // ----- the module cards -----
  CARD_WIDTH: '47%', // width of one card (two columns with a generous gap between them)
  CARD_HEIGHT: 168, // smallest height of a card
  CARD_GAP: 18, // space under each row of cards
  CARD_DISC: 92, // size of the round coloured disc behind the icon
  CARD_STAGGER: 80, // the cards come in one after another, this far apart (6 cards = well under 1 second)
  CARD_BOB: 4, // how far an icon bobs up while idle
  CARD_BOB_TIME: 2500, // one bob up and down
  CARD_ICON_HOP: 12, // how high the icon hops on a tap
  CARD_WOBBLE: 3, // the shy wobble of a module that is not built yet, in degrees
  CARD_NAV_DELAY: 250, // after a tap, wait this long before opening the module, so the animation is seen

  // ----- spacing -----
  SIDE_PADDING: 20, // space left and right of the content
  SECTION_GAP: 18, // space between the hero and the module tiles
};

// The large soft shapes behind everything. Each one only drifts around its OWN spot.
// (5 shapes + 6 bobbing card icons + the buddy = 12 things moving at most; keep it calm.)
//   size, top / start / end / bottom = where it sits; color; dx, dy = how far it drifts;
//   duration = one full loop (6000 to 10000); opacity = how visible it is
export const HOME_SHAPES = [
  { size: 220, top: -70, start: -70, color: PALETTE.pastelMint, dx: 8, dy: 10, duration: 9000, opacity: 0.7 },
  { size: 150, top: '16%', end: -50, color: PALETTE.blushPeach, dx: 6, dy: 9, duration: 7400, opacity: 0.6 },
  { size: 120, top: '40%', start: -40, color: CALM.yellowPale, dx: 7, dy: 8, duration: 8400, opacity: 0.6 },
  { size: 170, top: '56%', end: -60, color: PALETTE.blushPeach, dx: 6, dy: 8, duration: 9600, opacity: 0.6 },
  { size: 240, bottom: -110, start: -60, color: PALETTE.pastelMint, dx: 9, dy: 10, duration: 10000, opacity: 0.6 },
];
