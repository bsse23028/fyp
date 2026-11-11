// MODULES - the list of learning modules in the app.
//
// Every module is ONE folder inside src/modules/ and describes itself with an index.js:
//   {
//     name:         'english',           the name of its Redux slice (state.english)
//     reducer:      englishReducer,      its Redux Toolkit slice   (optional)
//     load:         loadSomething,       a thunk that reads its saved data at start-up (optional)
//     onChildSelected: (childId) => thunk  runs once a child is chosen for Child Mode (optional)
//     screens:      [ { name, component } ... ],   its screens, added to the navigator
//     translations: ur.json,             its own Urdu words        (optional)
//   }
//
// ADD A NEW MODULE (for example Numbers) IN 2 STEPS:
//   1. copy the folder modules/english  ->  modules/numbers  and change its content
//   2. import it below and add it to the MODULES list
// The navigator, the Redux store and the translations pick it up from here.
// Nothing else in the app has to change.

import { addTranslations } from '../shared/i18n/translate';
import english from './english';
// import numbers from './numbers';
// import feelings from './feelings';

export const MODULES = [english /*, numbers, feelings */];

// Register the Urdu words of every module (runs once, when the app starts).
MODULES.forEach((module) => {
  if (module.translations) addTranslations(module.translations);
});

// Every screen of every module, ready for the navigator.
export const MODULE_SCREENS = MODULES.flatMap((module) => module.screens);
