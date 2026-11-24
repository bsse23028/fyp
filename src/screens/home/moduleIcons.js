// MODULE ICONS - the picture of each module card on Child Home.
// While `image` is null the card draws the module's emoji very large instead.
//
// TO ADD AN ILLUSTRATED ICON:
//   1. put the picture in assets/icons/ (a square transparent PNG, about 512 x 512), for example
//      assets/icons/english.png
//   2. change that module's line below from   image: null   to the require() line shown next to it.
// IMPORTANT: only write a require() for a file that really exists. A require() of a missing file stops
// the app from starting (React Native loads every picture by a fixed line, never by a changing path).

export const MODULE_ICONS = {
  reading: { image: null }, // image: require('../../../assets/icons/reading.png'),
  numbers: { image: null }, // image: require('../../../assets/icons/numbers.png'),
  feelings: { image: null }, // image: require('../../../assets/icons/feelings.png'),
  talk: { image: null }, // image: require('../../../assets/icons/talk.png'),
  myday: { image: null }, // image: require('../../../assets/icons/myday.png'),
  sounds: { image: null }, // image: require('../../../assets/icons/sounds.png'),
};
