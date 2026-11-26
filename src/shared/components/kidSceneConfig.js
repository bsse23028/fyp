// KID SCENE CONFIG - the numbers and colours of the animated kid backgrounds (KidScene.js).
// Positions are FRACTIONS of the screen (x 0 = left, 1 = right; y 0 = top, 1 = bottom).
// Change a scene by editing its block, or add a new block and pass its name: <KidScene scene="sunset" />.
// Colours (rebrand 2026-11-20) come from the KidBuddy palette (PALETTE in theme.js): every sky is LIGHT
// (never dark) and each scene keeps to one calm colour family.

import { PALETTE } from '../theme/theme';

export const KID_SCENES = {
  // a sunny day: lavender sky, sunny sun, clouds, mint hills
  day: {
    sky: ['#EBDDF8', PALETTE.lavenderMist, PALETTE.paleLilac], // top -> bottom of the sky
    sun: { show: true, x: 0.82, y: 0.08, size: 74, color: PALETTE.sunny, glow: PALETTE.pastelYellow },
    hills: [
      { color: PALETTE.pastelMint, width: 1.5, height: 0.22, x: -0.25 }, // back hill (lighter)
      { color: '#B6E3DB', width: 1.3, height: 0.17, x: 0.25 }, // front hill (a little stronger mint)
    ],
    flowers: ['🌼', '🌷', '🌼'],
  },
  // for learning pages (lessons, reading): calmer - no sun, no flowers, low soft hills, clouds only
  lesson: {
    sky: [PALETTE.lavenderMist, '#F6ECFB', PALETTE.paleLilac],
    sun: { show: false, x: 0.8, y: 0.08, size: 60, color: PALETTE.sunny, glow: PALETTE.pastelYellow },
    hills: [
      { color: '#DDF2ED', width: 1.5, height: 0.12, x: -0.25 },
      { color: PALETTE.pastelMint, width: 1.3, height: 0.09, x: 0.3 },
    ],
    flowers: [],
  },
  // the spelling game: blush peach, without flowers (the letters lie low on the screen)
  spelling: {
    sky: [PALETTE.blushPeach, '#FBE8E2', '#FDF3EF'],
    sun: { show: false, x: 0.18, y: 0.1, size: 60, color: '#F9B98F', glow: '#FCDCC6' },
    hills: [
      { color: '#E8DEF8', width: 1.5, height: 0.1, x: -0.2 },
      { color: PALETTE.pastelLilac, width: 1.3, height: 0.07, x: 0.3 },
    ],
    flowers: [],
  },
  // a soft evening: pink-peach sky, a soft orange sun, lilac hills
  sunset: {
    sky: [PALETTE.softPink, PALETTE.blushPeach, '#FCEBE6'],
    sun: { show: true, x: 0.18, y: 0.1, size: 64, color: '#F9B98F', glow: '#FCDCC6' },
    hills: [
      { color: PALETTE.pastelLilac, width: 1.5, height: 0.2, x: -0.2 },
      { color: '#CBB8EE', width: 1.3, height: 0.15, x: 0.3 },
    ],
    flowers: ['🌸', '🌸'],
  },
};

export const KID_SCENE_MOTION = {
  skyMoves: false, // false = the sun and clouds are a still picture (calm, like the website); true = they move
  cloudCount: 3, // how many clouds float across the sky
  cloudMinMs: 38000, // the fastest cloud takes this long to cross the screen (very slow on purpose)
  cloudMaxMs: 60000, // the slowest cloud
  cloudSize: [90, 130, 70], // width of each cloud (points)
  cloudY: [0.06, 0.16, 0.26], // height of each cloud (fraction of the screen)
  sunBreathMs: 3200, // one slow "breath" of the sun (grows a little and back)
  flowerSwayMs: 2600, // the flowers sway gently
};
