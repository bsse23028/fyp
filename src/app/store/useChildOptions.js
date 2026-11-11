// USE CHILD OPTIONS - the choice lists of the child-profile forms.
//
//   const { ageBands, languages, supports, modules, relations, avatars,
//           defaultModules, suggestModules } = useChildOptions();
//
// The lists come from the server (GET /api/options, loaded at start-up into
// state.child.options - see childSlice.js and ChildLoader.js) and are turned into the
// SAME simple shapes the screens used before:
//   ageBands   ['4–6 years', ...]
//   languages  [{ id: 'en', label: 'English' }, { id: 'ur', label: 'اردو' }]
//   supports   ['Reading', ...]
//   modules    [{ name: 'Read-Along', sensor: 'Mic', supports: ['Reading'] }, ...]
//   relations  ['Grandmother', ...]
//   avatars    the buddies from shared/theme/avatars.js that the server allows
//              (the pictures live in the app, the server only knows their codes)
//
// DEMO_MODE FALLBACK: if the lists could not be loaded and DEMO_MODE is on, the old lists
// in shared/utils/childOptions.js (and RELATIONS in storyOptions.js) are used instead.
// With DEMO_MODE off the app waits for the server (AppNavigator shows "Retry").

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AVATARS } from '../../shared/theme/avatars';
import { AGE_BANDS, LANGUAGES, MODULES, SUPPORT_OPTIONS, defaultModules } from '../../shared/utils/childOptions';
import { RELATIONS } from '../../shared/utils/storyOptions';

// The lists when the server's lists are not available (DEMO_MODE only).
const FALLBACK = {
  ageBands: AGE_BANDS,
  languages: LANGUAGES,
  supports: SUPPORT_OPTIONS,
  modules: MODULES,
  defaultModuleNames: defaultModules(),
  relations: RELATIONS,
  avatars: AVATARS,
};

// Turns the server's answer into the shapes above.
function fromServer(options) {
  const avatarCodes = options.avatars.map((a) => a.code);
  return {
    ageBands: options.ageBands.map((band) => band.label),
    languages: options.languages.map((lang) => ({ id: lang.code, label: lang.nativeName })),
    supports: options.supports.map((support) => support.name),
    modules: options.modules.map((m) => ({ name: m.name, sensor: m.sensor || '', supports: m.supports })),
    defaultModuleNames: options.modules.filter((m) => m.onByDefault).map((m) => m.name),
    relations: options.relations.map((relation) => relation.name),
    avatars: AVATARS.filter((avatar) => avatarCodes.includes(avatar.id)),
  };
}

export function useChildOptions() {
  const options = useSelector((state) => state.child.options);

  // Only rebuilt when the server's lists change.
  return useMemo(() => {
    const lists = options ? fromServer(options) : FALLBACK;
    return {
      ...lists,
      // Activities switched on for a NEW child.
      defaultModules: () => lists.defaultModuleNames,
      // Activities that match the chosen areas of support.
      suggestModules: (supports) =>
        supports.length === 0
          ? lists.defaultModuleNames
          : lists.modules.filter((m) => m.supports.some((s) => supports.includes(s))).map((m) => m.name),
    };
  }, [options]);
}
