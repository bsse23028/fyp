// VOICE CONFIG - the character voices. The phone's voice (expo-speech) can only change PITCH (high/low)
// and RATE (fast/slow), so every character is one pitch + rate pair:
//   pitch 1.0 = normal, 1.5 = high and squeaky, 0.7 = deep;   rate 1.0 = normal speed, 0.7 = slow.
// Letter names and letter sounds always use `teacher` (clear and calm) so children hear them correctly.
// To give a character another voice, change its line in BUDDY_VOICES or PICTURE_VOICES.

export const VOICES = {
  teacher: { pitch: 1.05, rate: 0.78 }, // clear, calm teaching voice (letters, sounds, instructions)
  human: { pitch: 1.0, rate: 0.85 }, // a friendly grown-up (people pictures: queen ...)
  cartoon: { pitch: 1.35, rate: 0.9 }, // bright and bouncy (objects: apple, ball, car ...)
  bunny: { pitch: 1.45, rate: 0.88 }, // light and squeaky
  bear: { pitch: 0.75, rate: 0.74 }, // deep, slow and cosy (heavy)
  wolf: { pitch: 0.95, rate: 0.82 }, // warm middle voice (dog / fox pictures; no wolf buddy any more)
  panda: { pitch: 1.2, rate: 0.8 }, // soft and round
  kitty: { pitch: 1.6, rate: 0.9 }, // high and sweet
  puppy: { pitch: 1.3, rate: 0.92 }, // happy and bouncy
  penguin: { pitch: 1.5, rate: 0.95 }, // quick and chirpy
  tiny: { pitch: 1.8, rate: 0.95 }, // tiny creatures (ant, fish, frog ...)
  big: { pitch: 0.62, rate: 0.7 }, // big animals (elephant, whale, lion ...)
};

// The voice of each buddy avatar.
export const BUDDY_VOICES = {
  rabbit: 'bunny',
  bear: 'bear',
  panda: 'panda',
  dino: 'wolf',
  elephant: 'big',
  fox: 'wolf',
  kitty: 'kitty',
  koala: 'panda',
  lion: 'big',
  penguin: 'penguin',
  puppy: 'puppy',
};

// The voice of a picture friend (key = the emoji in alphabetData.js). Not listed = 'cartoon'.
export const PICTURE_VOICES = {
  '🐘': 'big', '🐳': 'big', '🦁': 'big', '🐯': 'big', '🦓': 'big', '🐐': 'big',
  '🐜': 'tiny', '🐟': 'tiny', '🐸': 'tiny', '🦆': 'tiny', '🐧': 'tiny', '🐰': 'tiny', '🐱': 'tiny',
  '🐶': 'wolf', '🦊': 'wolf', '🐵': 'bunny', '🐷': 'panda', '🐙': 'panda', '🐢': 'bear', '🐍': 'wolf',
  '👸': 'human', '👃': 'human',
};

const plain = (emoji) => String(emoji || '').replace(/️/g, '');
const PICTURE_LOOKUP = {};
Object.keys(PICTURE_VOICES).forEach((key) => {
  PICTURE_LOOKUP[plain(key)] = PICTURE_VOICES[key];
});

export function voiceOf(name) {
  return VOICES[name] || VOICES.teacher;
}

export function buddyVoice(avatarId) {
  return voiceOf(BUDDY_VOICES[avatarId] || 'bunny');
}

export function pictureVoice(emoji) {
  return voiceOf(PICTURE_LOOKUP[plain(emoji)] || 'cartoon');
}
