// MODULES - the list of learning modules in the app.
//
// Every module is ONE folder inside src/modules/ and describes itself with an index.js:
//   {
//     name:         'english',           the name of its Redux slice (state.english)
//     reducer:      englishReducer,      its Redux Toolkit slice   (optional)
//     reducers:     { englishAlphabet: ... }   more slices, by state name (optional)
//     load:         loadSomething,       a thunk that reads its saved data at start-up (optional)
//     onChildSelected: (childId) => thunk  runs once a child is chosen for Child Mode (optional)
//     screens:      [ { name, component, options } ... ],   its screens (options = optional navigator options, e.g. a fade)
//     translations: ur.json,             its own Urdu words        (optional)
//     music:        { file, volume, quietVolume, screens, quietScreens }   a background song (optional)
//
//     THE PUBLIC DOOR (the only things the rest of the app may use from a module):
//     entry:        'EnglishHub',        the ONE screen Child Home opens for this module
//     progress:     (state, childId) => ({ title, done, total, text })   how far a child is (optional)
//     parentTools:  [ { icon, title, desc, screen, accent } ]   cards for the Plan tab (optional)
//   }
// App screens use the helpers at the bottom of this file (moduleEntry, selectModuleProgress,
// MODULE_PARENT_TOOLS) and never import a file from inside a module folder.
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

// The background song of every module that has one (played by app/navigation/ModuleMusic.js).
export const MODULE_MUSIC = MODULES.filter((module) => module.music).map((module) => module.music);

// Every screen of every module, ready for the navigator.
export const MODULE_SCREENS = MODULES.flatMap((module) => module.screens);

// ---------- the public door, used by the app's own screens ----------

// The one screen to open for a module (null = this module is not in the app yet -> "Coming soon").
export function moduleEntry(name) {
  const module = MODULES.find((m) => m.name === name);
  return module && module.entry ? module.entry : null;
}

// How far a child is in every module that reports progress: [{ module, title, done, total, text }].
export function selectModuleProgress(state, childId) {
  return MODULES.filter((m) => m.progress).map((m) => ({ module: m.name, ...m.progress(state, childId) }));
}

// Use it with useSelector so a screen only redraws when a number really changes:
//   const progress = useSelector((state) => selectModuleProgress(state, child.id), sameProgress);
export function sameProgress(a, b) {
  return a.length === b.length && a.every((item, i) => item.done === b[i].done && item.total === b[i].total && item.text === b[i].text);
}

// The Plan-tab cards of every module.
export const MODULE_PARENT_TOOLS = MODULES.flatMap((module) => module.parentTools || []);
