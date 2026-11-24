// AVATARS - the buddies a child can pick: the SAME 11 as the mobile app (src/shared/theme/avatars.js):
// Bunny, Bear, Panda, Dino, Elephant, Fox, Kitty, Koala, Lion, Penguin, Puppy. Pictures live in public/media/avatars
// (mascot-<id>.png = the whole buddy, logo-<id>.png = the buddy's head + "KidBuddy" name).
// The SERVER decides which ones may be chosen (GET /api/options -> avatars). Unknown ids (for example the old
// wolf) fall back to the bunny, like in the app.
// Each line: [id, name, mascot width / height, logo width / height, soft background colour]

const list = [
  ['rabbit', 'Bunny', 900 / 1260, 2422 / 840, '#E4E1FA'],
  ['bear', 'Bear', 900 / 1260, 2594 / 840, '#D9F2EE'],
  ['panda', 'Panda', 900 / 1260, 2594 / 840, '#ECE6F3'],
  ['dino', 'Dino', 900 / 1260, 2594 / 840, '#E2F3D8'],
  ['elephant', 'Elephant', 1140 / 1260, 2974 / 840, '#FCE4E7'],
  ['fox', 'Fox', 900 / 1260, 2422 / 840, '#FDE3D3'],
  ['kitty', 'Kitty', 900 / 1260, 2594 / 840, '#FDF1CC'],
  ['koala', 'Koala', 900 / 1260, 2802 / 840, '#E3E9F2'],
  ['lion', 'Lion', 900 / 1260, 2586 / 840, '#FDEBD0'],
  ['penguin', 'Penguin', 900 / 1260, 2594 / 840, '#E6E3F0'],
  ['puppy', 'Puppy', 900 / 1260, 2704 / 840, '#DDEDFB'],
];

export const AVATARS = list.map(([id, name, ratio, logoRatio, color]) => ({
  id,
  name,
  mascot: `/media/avatars/mascot-${id}.png`,
  logo: `/media/avatars/logo-${id}.png`,
  ratio,
  logoRatio,
  color,
}));

export const DEFAULT_AVATAR = 'rabbit';

export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}
