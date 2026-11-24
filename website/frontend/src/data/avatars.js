// AVATARS - the buddies a child can pick: the SAME four as the mobile app (src/shared/theme/avatars.js
// on the app's `local` branch): Bunny, Wolf, Bear, Panda. Pictures live in public/media/avatars
// (mascot-<id>.png = the whole buddy, logo-<id>.png = the buddy's "KidBuddy" logo, 640 x 315).
// The SERVER decides which ones may be chosen (GET /api/options -> avatars). Unknown ids fall back to the bunny.

const list = [
  ['rabbit', 'Bunny', 436 / 760, '#E4E1FA'],
  ['wolf', 'Wolf', 557 / 760, '#DCE6F0'],
  ['bear', 'Bear', 760 / 760, '#FAE4CA'],
  ['panda', 'Panda', 467 / 760, '#D2E9CC'],
];

export const AVATARS = list.map(([id, name, ratio, color]) => ({
  id,
  name,
  mascot: `/media/avatars/mascot-${id}.png`,
  logo: `/media/avatars/logo-${id}.png`,
  ratio,
  logoRatio: 640 / 315,
  color,
}));

export const DEFAULT_AVATAR = 'rabbit';

export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}
