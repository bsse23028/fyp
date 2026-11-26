// BUDDY CONFIG - every number you may want to tweak for the buddy's wave and walk (BuddyCharacter.js).
//
// HOW TO READ THE NUMBERS
//   Positions are FRACTIONS of the buddy picture: x 0 = left edge, 1 = right edge; y 0 = top, 1 = bottom.
//   Example: shoulder { x: 0.7, y: 0.72 } = 70% from the left, 72% down.
//   Sizes are fractions of the buddy's HEIGHT: handSize 0.12 on a 76 px buddy = a 9 px hand.
//   To move the waving hand of the bear a little higher: bear.hand.y 0.46 -> 0.42.
//
// The waving arm is a small arm + a round mitten drawn ON TOP of the picture. It turns around the
// shoulder and points to `hand` when it starts. Where the picture already has a raised arm (rabbit,
// bear), `hand` sits right over that paw so it looks like the paw itself is waving.

export const BUDDY_CONFIG = {
  // full body, lavender; the right arm is already raised (paw near the motion lines)
  rabbit: {
    shoulder: { x: 0.66, y: 0.74 }, // where the waving arm starts
    hand: { x: 0.78, y: 0.67 }, // where the waving hand is at the start (over the drawn raised paw)
    handSize: 0.13, // size of the round mitten
    armThickness: 0.06, // thickness of the arm segment
    handColor: '#CFCBF4', // the rabbit's lavender fur
    armColor: '#CFCBF4',
    feet: { show: false, color: '#CFCBF4', y: 0.96, gap: 0.35, width: 0.16, height: 0.06 }, // the picture has feet
    shadowWidth: 0.8, // floor shadow width compared to the picture width
    flipWhenWalkingLeft: true, // mirror the picture when walking to the left (looks natural for this one)
  },
  // full body, grey head, dark suit; both arms hang down with white paws
  wolf: {
    shoulder: { x: 0.72, y: 0.66 },
    hand: { x: 0.86, y: 0.54 },
    handSize: 0.1,
    armThickness: 0.07,
    handColor: '#F4F4F6', // white paw
    armColor: '#3B3E47', // the dark suit sleeve
    feet: { show: false, color: '#F4F4F6', y: 0.95, gap: 0.3, width: 0.14, height: 0.05 },
    shadowWidth: 0.75,
    flipWhenWalkingLeft: true,
  },
  // full body, tan; the right arm is already raised and waving (lots of empty space around the bear)
  bear: {
    shoulder: { x: 0.7, y: 0.52 },
    hand: { x: 0.79, y: 0.46 },
    handSize: 0.09,
    armThickness: 0.05,
    handColor: '#E9B57A', // the bear's tan fur
    armColor: '#E9B57A',
    feet: { show: false, color: '#E9B57A', y: 0.9, gap: 0.2, width: 0.1, height: 0.04 },
    shadowWidth: 0.5,
    flipWhenWalkingLeft: true,
  },
  // full body, black arms holding the backpack straps
  panda: {
    shoulder: { x: 0.8, y: 0.5 },
    hand: { x: 0.92, y: 0.4 },
    handSize: 0.1,
    armThickness: 0.08,
    handColor: '#34343C', // black paw
    armColor: '#34343C',
    feet: { show: false, color: '#34343C', y: 0.97, gap: 0.3, width: 0.15, height: 0.05 },
    shadowWidth: 0.75,
    flipWhenWalkingLeft: true,
  },
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
