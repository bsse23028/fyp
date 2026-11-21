// BUDDY CONFIG - every number you may want to tweak for the buddy's wave and walk (BuddyCharacter.js).
//
// HOW TO READ THE NUMBERS
//   Positions are FRACTIONS of the buddy picture: x 0 = left edge, 1 = right edge; y 0 = top, 1 = bottom.
//   Example: shoulder { x: 0.7, y: 0.72 } = 70% from the left, 72% down.
//   Sizes are fractions of the buddy's HEIGHT: handSize 0.12 on a 76 px buddy = a 9 px hand.
//   To move the waving hand of the bear a little higher: bear.hand.y 0.46 -> 0.42.
//
// The waving arm is a small arm + a round mitten drawn ON TOP of the picture. It turns around the
// shoulder and points to `hand` when it starts. All the new (2026-11-20) mascots already have their
// right arm raised, so `hand` sits right over that paw and it looks like the paw itself is waving.
//
// The new mascots are all drawn the same way (same canvas, the paw in the same place), so they share
// ONE shape below and only their fur colour is different. To fine-tune one buddy, give it its own
// numbers, for example:  fox: { ...shape(900, '#F08A4B'), hand: { x: 0.78, y: 0.68 } },

// The paw is at the same spot on a 900-wide picture; a wider picture (the elephant, 1140) has the
// same buddy in the middle, so the x numbers are moved to keep the paw in place.
function shape(pictureWidth, furColor) {
  const toX = (x900) => (x900 + (pictureWidth - 900) / 2) / pictureWidth; // a spot on the 900 picture -> a fraction
  return {
    shoulder: { x: toX(600), y: 0.73 }, // where the waving arm starts
    hand: { x: toX(695), y: 0.694 }, // where the waving hand is at the start (over the drawn raised paw)
    handSize: 0.13, // size of the round mitten (a part of the buddy's height)
    armThickness: 0.06, // thickness of the arm segment
    handColor: furColor, // the colour of the mitten (= the paw)
    armColor: furColor,
    feet: { show: false, color: furColor, y: 0.96, gap: 0.3, width: 0.15, height: 0.05 }, // the pictures have feet
    shadowWidth: (500 / pictureWidth) * 1.1, // floor shadow width compared to the picture width
    flipWhenWalkingLeft: true, // mirror the picture when walking to the left
  };
}

export const BUDDY_CONFIG = {
  rabbit: shape(900, '#9E8BD9'), // lavender
  bear: shape(900, '#9ED9CF'), // mint
  panda: shape(900, '#3D1F5C'), // dark purple paws
  dino: shape(900, '#A9DB8E'), // green
  elephant: shape(1140, '#F7B9C0'), // pink, wider picture (big ears)
  fox: shape(900, '#F08A4B'), // orange
  kitty: shape(900, '#F7C744'), // yellow
  koala: shape(900, '#A9BCD6'), // grey-blue
  lion: shape(900, '#F7C744'), // yellow body (the mane is orange)
  penguin: shape(900, '#3D1F5C'), // dark purple flippers
  puppy: shape(900, '#8EC1EC'), // blue
};

// ---------- how the buddy moves (same for every avatar) ----------
export const BUDDY_MOTION = {
  waveMs: 1400, // one whole wave (lift, 3 waves, back down)
  waveDegrees: 25, // how far the hand swings each way (degrees)
  waveLean: 4, // the body leans toward the waving hand (degrees)

  walkMsPerPoint: 9, // walking speed: milliseconds per point of distance
  walkMinMs: 1200, // a walk never takes less than this (ms)
  walkMaxMs: 1800, // ... or more than this (ms)
  dragBackMinMs: 700, // the waddle back home after a drag can be a bit quicker
  stepMs: 280, // one step (the body rocks to one side)
  stepTilt: 5, // how far the body rocks each step (degrees)
  stepHop: 6, // the tiny hop of every step (points)
  footLift: 5, // how high a drawn foot lifts (points), only if feet.show is true
  slowDownMs: 250, // the walk gently slows down in this last part

  idleThinkMs: 8000, // after this long without any touch, the buddy does a small "think" tilt
  idleThinkTimes: 2, // ... at most this many times until the child touches again
};

export function buddyConfigFor(avatarId) {
  return BUDDY_CONFIG[avatarId] || BUDDY_CONFIG.rabbit;
}
