// AVATARS - the buddies a child can pick when the profile is created.
//
// Each avatar has a mascot picture (the full character) and a logo picture
// (the character's head + the "KidBuddy" name). Once a child is chosen, the
// header logo and every mascot in the app switch to that avatar's pictures.
//
// TO ADD OR REPLACE A BUDDY:
//   1. put  mascot-<name>.png  and  logo-<name>.png  in assets/images/avatars/
//      (transparent PNGs; the logo is 640 x 315, with the head on the left)
//   2. add one block below. `ratio` = picture width / picture height.
//
// The 4 buddies below use TEMPORARY art. The logos were made by cutting the
// head out of each mascot and placing it next to the KidBuddy name.

export const AVATARS = [
  {
    id: 'rabbit',
    name: 'Bunny',
    mascot: require('../../../assets/images/avatars/mascot-rabbit.png'),
    logo: require('../../../assets/images/avatars/logo-rabbit.png'),
    ratio: 436 / 760,
    color: '#E4E1FA',
  },
  {
    id: 'wolf',
    name: 'Wolf',
    mascot: require('../../../assets/images/avatars/mascot-wolf.png'),
    logo: require('../../../assets/images/avatars/logo-wolf.png'),
    ratio: 557 / 760,
    color: '#DCE6F0',
  },
  {
    id: 'bear',
    name: 'Bear',
    mascot: require('../../../assets/images/avatars/mascot-bear.png'),
    logo: require('../../../assets/images/avatars/logo-bear.png'),
    ratio: 760 / 760,
    color: '#FAE4CA',
  },
  {
    id: 'panda',
    name: 'Panda',
    mascot: require('../../../assets/images/avatars/mascot-panda.png'),
    logo: require('../../../assets/images/avatars/logo-panda.png'),
    ratio: 467 / 760,
    color: '#D2E9CC',
  },
];

// The rabbit is the default (login, sign-up, parent mode ...).
export const DEFAULT_AVATAR = 'rabbit';

// Finds an avatar by its id. Unknown / missing id -> the rabbit.
export function getAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

// width / height of every logo picture
export const LOGO_RATIO = 640 / 315;
