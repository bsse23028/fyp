// TALKING OBJECT CONFIG - every number you may want to tweak for TalkingObject.js lives here.
//
// HOW TO READ THE NUMBERS: most of them are FRACTIONS of the object's size, so they work for small and
// big pictures alike. Example: eyeY: 0.42 means "the eyes sit 42% down from the top of the picture".
//   eyeY 0.42 -> 0.35 moves the eyes UP a little.      eyeGap 0.20 -> 0.25 puts the eyes further apart.
//
// To fix ONE picture (for example a fish whose face looks off), add or change its line in OVERRIDES at the
// bottom. Only write the numbers you want to change; everything else comes from DEFAULT_FACE.

import { CALM } from '../theme/theme';

// ---------- the standard face, arms and feet ----------
export const DEFAULT_FACE = {
  emojiScale: 0.82, // emoji size compared to the box (0.82 = 82% of the box)

  eyeY: 0.42, // eyes: how far down from the top (0 = top, 1 = bottom)
  eyeGap: 0.2, // eyes: distance between the two eye centres
  eyeSize: 0.14, // eyes: size of one white eye circle
  pupilSize: 0.55, // pupil size compared to the eye (0.55 = a bit more than half)
  faceX: 0, // the whole face moved sideways (-0.1 = a little to the left, 0.1 = right)

  mouthY: 0.6, // mouth: how far down from the top
  mouthWidth: 0.16, // mouth: width of the smile
  mouthHeight: 0.08, // mouth: height of the smile / open mouth

  armY: 0.58, // arms: where the shoulders are (from the top)
  armSpread: 0.42, // arms: how far the shoulders are from the middle (0.5 = right at the box edge)
  armLength: 0.3, // arms: length of one arm
  armThickness: 0.05, // arms: thickness of the "noodle"
  handSize: 0.11, // hands: size of the round mitten
  armRestAngle: 22, // arms: how far they hang out sideways when resting (degrees)

  footY: 0.9, // feet: where the top of the feet is (from the top)
  footGap: 0.2, // feet: distance between the two feet
  footWidth: 0.16, // feet: width of one oval foot
  footHeight: 0.08, // feet: height of one oval foot

  ownFace: false, // true = the emoji already has a face: draw NO eyes and mouth, only arms and feet
  arms: true, // false = draw no arms
  feet: true, // false = draw no feet
};

// ---------- colours ----------
export const TALKING_COLORS = {
  eyeWhite: '#FFFFFF',
  pupil: CALM.text,
  eyeShine: '#FFFFFF',
  mouth: CALM.text,
  tongue: '#F3A0A8',
  arm: CALM.coral,
  hand: CALM.coral,
  foot: CALM.coral,
  shadow: '#3D2B1F',
};

// ---------- motion ----------
export const TALKING_MOTION = {
  blinkMs: 150, // one blink (eye closes and opens again)
  blinkEveryMin: 2500, // the shortest wait between two blinks (ms)
  blinkEveryMax: 5000, // the longest wait between two blinks (ms)
  pupilMove: 0.25, // how far the pupils look toward the last touch (fraction of the eye size)
  pupilBackMs: 2500, // after this long the pupils look straight ahead again (ms)
  talkPerSecond: 4, // how many times per second the mouth opens while talking
  swayDegrees: 3, // the tiny idle arm sway (degrees)
  swayMs: 3200, // one slow idle sway (ms)
  waveDegrees: 25, // waving: how far the hand swings each way (degrees)
  waveRaise: 145, // waving: how high the arm is lifted (degrees from hanging down)
  danceDegrees: 10, // dancing: body wiggle left and right (degrees)
  hopHeight: 0.1, // a small hop (fraction of the size)
  jumpHeight: 0.22, // a big jump (fraction of the size)
};

// ---------- per-picture fixes (key = the emoji exactly as in alphabetData.js) ----------
// Animals and people already have a face in the emoji: ownFace = true (only arms and feet are added).
const OWN_FACE = { ownFace: true };

export const OVERRIDES = {
  // already have their own face
  '🐜': OWN_FACE, '🐱': OWN_FACE, '🐶': OWN_FACE, '🦆': OWN_FACE, '🐘': OWN_FACE, '🐸': OWN_FACE,
  '🐐': OWN_FACE, '🦁': OWN_FACE, '🐵': OWN_FACE, '🐙': OWN_FACE, '🐷': OWN_FACE, '🐧': OWN_FACE,
  '👸': OWN_FACE, '🐰': OWN_FACE, '🐯': OWN_FACE, '🐢': OWN_FACE, '🐳': OWN_FACE, '🦊': OWN_FACE,
  '🦓': OWN_FACE, '👃': OWN_FACE,
  '🐟': { ownFace: true, feet: false }, // a fish has no feet: only little arms (fins)
  '🐍': { ownFace: true, feet: false, armY: 0.7 }, // a thin snake: low arms, no feet

  // objects whose shape needs the face somewhere else
  '🍎': { eyeY: 0.5, mouthY: 0.66 }, // the stem is on top, the round part is lower
  '🍌': { eyeY: 0.45, eyeGap: 0.14, eyeSize: 0.11, mouthY: 0.58, armSpread: 0.32 }, // thin and curved
  '🍇': { eyeY: 0.42, mouthY: 0.58 },
  '🎩': { eyeY: 0.45, mouthY: 0.62, armY: 0.68 },
  '🏠': { eyeY: 0.6, eyeSize: 0.12, mouthY: 0.76, armY: 0.7 }, // eyes on the wall, under the roof
  '🍦': { eyeY: 0.3, eyeGap: 0.16, mouthY: 0.42, armY: 0.5, armSpread: 0.28 }, // face on the scoop, narrow cone
  '🏝️': { eyeY: 0.7, eyeSize: 0.1, mouthY: 0.82, armY: 0.74 }, // face on the sand
  '🧃': { eyeY: 0.5, eyeGap: 0.16, mouthY: 0.65, armSpread: 0.3 },
  '👖': { eyeY: 0.24, eyeSize: 0.11, mouthY: 0.36, armY: 0.3, armSpread: 0.36 }, // face at the waist
  '🪁': { eyeY: 0.4, mouthY: 0.54 },
  '🔑': { eyeY: 0.36, eyeGap: 0.14, eyeSize: 0.1, mouthY: 0.48, armSpread: 0.3 }, // thin key
  '🍋': { eyeY: 0.45, mouthY: 0.6 },
  '🌙': { faceX: -0.12, eyeGap: 0.12, eyeSize: 0.1, mouthWidth: 0.12 }, // crescent: face on the thick left part
  '🥜': { eyeY: 0.42, eyeGap: 0.16, eyeSize: 0.12 },
  '🍊': { eyeY: 0.48, mouthY: 0.64 },
  '❓': { eyeY: 0.3, eyeGap: 0.14, eyeSize: 0.11, mouthY: 0.42, armY: 0.5, armSpread: 0.26 }, // thin mark
  '🌈': { eyeY: 0.3, eyeSize: 0.1, mouthY: 0.4, armY: 0.55, armSpread: 0.45 }, // face on the top of the arc
  '🌳': { eyeY: 0.36, mouthY: 0.5, armY: 0.56 }, // face on the leaves
  '☂️': { eyeY: 0.3, eyeGap: 0.22, mouthY: 0.4, armY: 0.42, armSpread: 0.4 }, // face on the umbrella top
  '🚗': { eyeY: 0.5, mouthY: 0.64, armY: 0.62 },
  '🚐': { eyeY: 0.5, mouthY: 0.64, armY: 0.62 },
  '🎻': { eyeY: 0.5, eyeGap: 0.12, eyeSize: 0.09, mouthY: 0.6, armSpread: 0.26 }, // thin and tilted
  '⌚': { eyeGap: 0.16, eyeSize: 0.12, mouthY: 0.58 }, // face on the watch face
  '📦': { eyeY: 0.55, mouthY: 0.7 },
  '🪀': { eyeY: 0.48, mouthY: 0.62 },
};

// The same emoji can be typed with or without an invisible "variation selector" (U+FE0F);
// looking pictures up without it makes the overrides always match.
const plain = (emoji) => String(emoji || '').replace(/️/g, '');
const LOOKUP = {};
Object.keys(OVERRIDES).forEach((key) => {
  LOOKUP[plain(key)] = OVERRIDES[key];
});

export function faceFor(emoji, extra) {
  return { ...DEFAULT_FACE, ...(LOOKUP[plain(emoji)] || {}), ...(extra || {}) };
}
