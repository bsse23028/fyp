// AVATARS - the buddies a child can pick: the SAME 11 as the mobile app (src/shared/theme/avatars.js):
// Bunny, Bear, Panda, Dino, Elephant, Fox, Kitty, Koala, Lion, Penguin, Puppy. Pictures live in public/media/avatars
// (mascot-<id>.png = the whole buddy, logo-<id>.png = the buddy + "KidBuddy" name). The pictures are the Cuddle Pals
// (soft round buddies, drawn as SVG and exported as transparent PNGs); the ids and names stay the same as the app and the server.
// The SERVER decides which ones may be chosen (GET /api/options -> avatars). Unknown ids (for example the old
// wolf) fall back to the bunny, like in the app.
// Each line: [id, name, mascot width / height, logo width / height, soft background colour]

const list = [
  ['rabbit', 'Bunny', 932 / 1000, 2363 / 840, '#E4E1FA'],
  ['bear', 'Bear', 1178 / 1000, 2540 / 840, '#D9F2EE'],
  ['panda', 'Panda', 1171 / 1000, 2535 / 840, '#ECE6F3'],
  ['dino', 'Dino', 1189 / 1000, 2548 / 840, '#E2F3D8'],
  ['elephant', 'Elephant', 1285 / 1000, 2617 / 840, '#FCE4E7'],
  ['fox', 'Fox', 1192 / 1000, 2551 / 840, '#FDE3D3'],
  ['kitty', 'Kitty', 1135 / 1000, 2509 / 840, '#FDF1CC'],
  ['koala', 'Koala', 1137 / 1000, 2511 / 840, '#E3E9F2'],
  ['lion', 'Lion', 1186 / 1000, 2547 / 840, '#FDEBD0'],
  ['penguin', 'Penguin', 1224 / 1000, 2573 / 840, '#E6E3F0'],
  ['puppy', 'Puppy', 1248 / 1000, 2592 / 840, '#DDEDFB'],
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
