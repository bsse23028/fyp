// AVATARS - the buddies a child can pick when the profile is created.
//
// Each avatar has a mascot picture (the full character) and a logo picture
// (the character's head + the "KidBuddy" name). Once a child is chosen, the
// header logo and every mascot in the app switch to that avatar's pictures.
//
// TO ADD OR REPLACE A BUDDY:
//   1. put  mascot-<id>.png  and  logo-<id>.png  in assets/images/avatars/
//      (transparent PNGs; the logo has the head on the left and the name on the right)
//   2. add one block below:
//        ratio      = mascot width / mascot height
//        logoRatio  = logo width / logo height
//        color      = the soft background behind the buddy (picker tiles, child list)
//   3. optional: its waving paw in shared/components/buddyConfig.js, its voice in
//      shared/utils/voiceConfig.js, and its Urdu name in shared/i18n/ur.json
//   4. the SERVER must also know the id (its avatar list), or the buddy is hidden in the
//      picker (see app/store/useChildOptions.js).
//
// The art is the 2026-11-20 rebrand. All mascots are 900 x 1260 (the elephant 1140 x 1260),
// with the feet at the same height, so every buddy looks the same size.
// The ids rabbit / bear / panda are the ones the server already knows.

export const AVATARS = [
  {
    id: 'rabbit',
    name: 'Bunny',
    mascot: require('../../../assets/images/avatars/mascot-rabbit.png'),
    logo: require('../../../assets/images/avatars/logo-rabbit.png'),
    ratio: 900 / 1260,
    logoRatio: 2422 / 840,
    color: '#E4E1FA',
  },
  {
    id: 'bear',
    name: 'Bear',
    mascot: require('../../../assets/images/avatars/mascot-bear.png'),
    logo: require('../../../assets/images/avatars/logo-bear.png'),
    ratio: 900 / 1260,
    logoRatio: 2594 / 840,
    color: '#D9F2EE',
  },
  {
    id: 'panda',
    name: 'Panda',
    mascot: require('../../../assets/images/avatars/mascot-panda.png'),
    logo: require('../../../assets/images/avatars/logo-panda.png'),
    ratio: 900 / 1260,
    logoRatio: 2594 / 840,
    color: '#ECE6F3',
  },
  {
    id: 'dino',
    name: 'Dino',
    mascot: require('../../../assets/images/avatars/mascot-dino.png'),
    logo: require('../../../assets/images/avatars/logo-dino.png'),
    ratio: 900 / 1260,
    logoRatio: 2594 / 840,
    color: '#E2F3D8',
  },
  {
    id: 'elephant',
    name: 'Elephant',
    mascot: require('../../../assets/images/avatars/mascot-elephant.png'),
    logo: require('../../../assets/images/avatars/logo-elephant.png'),
    ratio: 1140 / 1260,
    logoRatio: 2974 / 840,
    color: '#FCE4E7',
  },
  {
    id: 'fox',
    name: 'Fox',
    mascot: require('../../../assets/images/avatars/mascot-fox.png'),
    logo: require('../../../assets/images/avatars/logo-fox.png'),
    ratio: 900 / 1260,
    logoRatio: 2422 / 840,
    color: '#FDE3D3',
  },
  {
    id: 'kitty',
    name: 'Kitty',
    mascot: require('../../../assets/images/avatars/mascot-kitty.png'),
    logo: require('../../../assets/images/avatars/logo-kitty.png'),
    ratio: 900 / 1260,
    logoRatio: 2594 / 840,
    color: '#FDF1CC',
  },
  {
    id: 'koala',
    name: 'Koala',
    mascot: require('../../../assets/images/avatars/mascot-koala.png'),
    logo: require('../../../assets/images/avatars/logo-koala.png'),
    ratio: 900 / 1260,
    logoRatio: 2802 / 840,
    color: '#E3E9F2',
  },
  {
    id: 'lion',
    name: 'Lion',
    mascot: require('../../../assets/images/avatars/mascot-lion.png'),
    logo: require('../../../assets/images/avatars/logo-lion.png'),
    ratio: 900 / 1260,
    logoRatio: 2586 / 840,
    color: '#FDEBD0',
  },
  {
    id: 'penguin',
    name: 'Penguin',
    mascot: require('../../../assets/images/avatars/mascot-penguin.png'),
    logo: require('../../../assets/images/avatars/logo-penguin.png'),
    ratio: 900 / 1260,
    logoRatio: 2594 / 840,
    color: '#E6E3F0',
  },
  {
    id: 'puppy',
    name: 'Puppy',
    mascot: require('../../../assets/images/avatars/mascot-puppy.png'),
    logo: require('../../../assets/images/avatars/logo-puppy.png'),
    ratio: 900 / 1260,
    logoRatio: 2704 / 840,
    color: '#DDEDFB',
  },
];

// The rabbit is the default (login, sign-up, parent mode ...).
export const DEFAULT_AVATAR = 'rabbit';

// Finds an avatar by its id. Unknown / missing id (for example the old 'wolf') -> the rabbit.
export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

// width / height of a logo when an avatar has no logoRatio of its own
export const LOGO_RATIO = 2594 / 840;

// The new logos are wider than the old ones: in the top bar a logo is never wider than this
// (points). A wider one is drawn a little lower instead, so the buttons on the right still fit.
export const HEADER_LOGO_MAX_WIDTH = 130;
