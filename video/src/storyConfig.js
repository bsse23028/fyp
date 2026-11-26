// STORY CONFIG - every number of the letter story video (LetterStory.jsx).
// Times are FRAMES (30 frames = 1 second). Sizes are pixels in the 720 x 720 video.

export const STORY = {
  SIZE: 720, // the video is a square, 720 x 720
  FPS: 30,
  LENGTH: 7 * 30, // 7 seconds

  // the big letter
  BIG_IN: 6, // the capital pops in at this frame
  BIG_SIZE: 420, // size of the capital picture
  SMALL_IN: 45, // the small letter slides in at this frame
  SMALL_SIZE: 360,
  BOB: 10, // how far the letters bob up and down while they wait
  MOVE_UP: 92, // the letters move up and get smaller at this frame (to make room for the pictures)
  MOVE_UP_SCALE: 0.55, // ... to this size

  // the pictures
  PICTURE_1_IN: 108,
  PICTURE_2_IN: 140,
  PICTURE_SIZE: 150, // emoji size

  // the happy ending
  PARTY: 176, // confetti + jump at this frame
  CONFETTI: 34, // number of confetti pieces

  // sounds (frames when they start)
  SOUND_BIG: 18, // the letter's recorded sound after the capital lands
  SOUND_SMALL: 60, // ... after the small letter lands
  SOUND_PICTURE_1: 118,
  SOUND_PICTURE_2: 150,
  SOUND_VOLUME: 1,
  EFFECT_VOLUME: 0.5,

  // colours
  SKY: ['#BFE6FB', '#E3F4FC', '#F6FBF2'],
  HILLS: ['#BFE3A8', '#A7D88F'],
  SUN: '#FFD86B',
  CONFETTI_COLORS: ['#F0857A', '#F4A54A', '#FFD86B', '#76BE7E', '#6FA8E0', '#B9AEE0'],
};
