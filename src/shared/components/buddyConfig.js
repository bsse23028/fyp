// BUDDY CONFIG - every number you may want to tweak for the buddy's wave and walk (BuddyCharacter.js).
//
// The "Cuddle Pals" buddies have no raised paw, so a wave is the WHOLE buddy rocking from side to side
// (the same as on the website). Every buddy moves the same way.

// ---------- how the buddy moves (same for every avatar) ----------
export const BUDDY_MOTION = {
  waveMs: 1400, // one whole wave (two rocks to each side, then straight again)
  waveDegrees: 8, // how far the body rocks to each side while waving (degrees)

  flipWhenWalkingLeft: true, // mirror the picture when walking to the left
  walkMsPerPoint: 9, // walking speed: milliseconds per point of distance
  walkMinMs: 1200, // a walk never takes less than this (ms)
  walkMaxMs: 1800, // ... or more than this (ms)
  dragBackMinMs: 700, // the waddle back home after a drag can be a bit quicker
  stepMs: 280, // one step (the body rocks to one side)
  stepTilt: 5, // how far the body rocks each step (degrees)
  stepHop: 6, // the tiny hop of every step (points)
  slowDownMs: 250, // the walk gently slows down in this last part

  idleThinkMs: 8000, // after this long without any touch, the buddy does a small "think" tilt
  idleThinkTimes: 2, // ... at most this many times until the child touches again
};
