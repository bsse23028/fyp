// HOME CONFIG - every number and switch of the Child Home screen lives here, each with a comment.
// Sizes are in screen points, times in milliseconds.

import { CALM } from '../../shared/theme/theme';

export const HOME = {
  // ----- switches -----
  USE_BLUR: true, // true = real blur behind the glass (expo-blur); false = only a see-through white layer (use this if it lags or looks bad)
  BLUR_INTENSITY: 30, // how strong the blur is (1 to 100)
  BLUR_CARDS: false, // true = the six module cards are blurred too (prettier, but heavier for the phone)
  NAV_POSITION: 'top', // where the quick-start glass bar sits: 'top' (under the header) or 'bottom' (floating at the bottom)

  // ----- the buddy (hero) -----
  BUDDY_SIZE: 150, // height of the buddy
  HERO_GAP: 14, // space between the buddy and the speech bubble / stars chip
  BUBBLE_DELAY: 250, // after the buddy has arrived and waved, wait this long before the greeting bubble appears

  // ----- the quick-start glass bar -----
  BAR_BUTTON: 68, // size of one round button in the bar (tap target; never below 56)
  BAR_ICON: 30, // size of the icon inside a button
  BAR_PADDING: 10, // space between the bar's edge and its buttons
  BAR_SIDE_MARGIN: 16, // space between the bar and the screen edges
  BAR_NAV_DELAY: 220, // after a tap, wait this long before opening the section, so the hop is seen
  BAR_ICON_HOP: 8, // how high the icon hops on a tap
  BAR_GLOW_TIME: 1600, // one slow glow of the "continue here" hint (in and out = twice this)

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
  SECTION_GAP: 18, // space between the bar, the hero and the module tiles
  BOTTOM_BAR_SPACE: 104, // extra empty space at the end of the page when the bar floats at the bottom
};

// The large soft shapes behind everything. Each one only drifts around its OWN spot.
// (5 shapes + 6 bobbing card icons + the buddy = 12 things moving at most; keep it calm.)
//   size, top / start / end / bottom = where it sits; color; dx, dy = how far it drifts;
//   duration = one full loop (6000 to 10000); opacity = how visible it is
export const HOME_SHAPES = [
  { size: 220, top: -70, start: -70, color: CALM.skyPale, dx: 8, dy: 10, duration: 9000, opacity: 0.7 },
  { size: 150, top: '16%', end: -50, color: CALM.coralPale, dx: 6, dy: 9, duration: 7400, opacity: 0.6 },
  { size: 120, top: '40%', start: -40, color: CALM.yellowPale, dx: 7, dy: 8, duration: 8400, opacity: 0.6 },
  { size: 170, top: '56%', end: -60, color: CALM.lavenderPale, dx: 6, dy: 8, duration: 9600, opacity: 0.6 },
  { size: 240, bottom: -110, start: -60, color: CALM.sagePale, dx: 9, dy: 10, duration: 10000, opacity: 0.6 },
];

// The three buttons of the quick-start bar. `screen` = the first screen of that English section
// (they skip the English hub, so the child needs one tap). `icon` = an Ionicons name, or 'abc' for the letters.
export const QUICK_START = [
  { id: 'alphabets', label: 'Alphabets', icon: 'abc', screen: 'AlphabetList', color: CALM.primaryDark },
  { id: 'words', label: 'Words', icon: 'image', screen: 'WordsHub', color: '#9A5338' },
  { id: 'sentences', label: 'Sentences', icon: 'book', screen: 'ReadingTopics', color: '#2E6A8A' },
];
