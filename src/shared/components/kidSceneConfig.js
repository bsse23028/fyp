// KID SCENE CONFIG - the numbers and colours of the animated kid backgrounds (KidScene.js).
// Positions are FRACTIONS of the screen (x 0 = left, 1 = right; y 0 = top, 1 = bottom).
// Change a scene by editing its block, or add a new block and pass its name: <KidScene scene="sunset" />.

export const KID_SCENES = {
  // a sunny day: blue sky, sun, clouds, green hills
  day: {
    sky: ['#BFE6FB', '#E3F4FC', '#F6FBF2'], // top -> bottom of the sky
    sun: { show: true, x: 0.82, y: 0.08, size: 74, color: '#FFD86B', glow: '#FFEFB0' },
    hills: [
      { color: '#BFE3A8', width: 1.5, height: 0.22, x: -0.25 }, // back hill (lighter)
      { color: '#A7D88F', width: 1.3, height: 0.17, x: 0.25 }, // front hill
    ],
    flowers: ['🌼', '🌷', '🌼'],
  },
  // for learning pages (lessons, reading): calmer - no sun, no flowers, low soft hills, clouds only
  lesson: {
    sky: ['#D3ECFA', '#EAF6FC', '#F8FBF4'],
    sun: { show: false, x: 0.8, y: 0.08, size: 60, color: '#FFD86B', glow: '#FFEFB0' },
    hills: [
      { color: '#D6EDC6', width: 1.5, height: 0.12, x: -0.25 },
      { color: '#C6E6B2', width: 1.3, height: 0.09, x: 0.3 },
    ],
    flowers: [],
  },
  // the spelling game: a calm evening without flowers (the letters lie low on the screen)
  spelling: {
    sky: ['#FFE3D1', '#FDF0E6', '#FAF5EE'],
    sun: { show: false, x: 0.18, y: 0.1, size: 60, color: '#FFC48A', glow: '#FFE2C4' },
    hills: [
      { color: '#E4D9F2', width: 1.5, height: 0.1, x: -0.2 },
      { color: '#D6C8EC', width: 1.3, height: 0.07, x: 0.3 },
    ],
    flowers: [],
  },
  // a soft evening: peach sky, no sun, lavender hills
  sunset: {
    sky: ['#FFD9C2', '#FDEBDD', '#FAF3EC'],
    sun: { show: true, x: 0.18, y: 0.1, size: 64, color: '#FFC48A', glow: '#FFE2C4' },
    hills: [
      { color: '#D9CCEF', width: 1.5, height: 0.2, x: -0.2 },
      { color: '#C6B6E6', width: 1.3, height: 0.15, x: 0.3 },
    ],
    flowers: ['🌸', '🌸'],
  },
};

export const KID_SCENE_MOTION = {
  cloudCount: 3, // how many clouds float across the sky
  cloudMinMs: 38000, // the fastest cloud takes this long to cross the screen (very slow on purpose)
  cloudMaxMs: 60000, // the slowest cloud
  cloudSize: [90, 130, 70], // width of each cloud (points)
  cloudY: [0.06, 0.16, 0.26], // height of each cloud (fraction of the screen)
  sunBreathMs: 3200, // one slow "breath" of the sun (grows a little and back)
  flowerSwayMs: 2600, // the flowers sway gently
};
