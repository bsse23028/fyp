// PREVIEW GUIDES - the one short sentence for PARENTS about the page they are on, shown in the yellow
// "Preview mode" strip (shared/components/PreviewBanner.js) ONLY while a parent explores KidBuddy.
// A real child using Child Mode never sees these lines.
//
//   APP_GUIDE    the app's own Child Mode screens (below)
//   modules      each learning module adds its own (its index.js: previewGuide), see src/modules/index.js
// Key = the screen name, value = the sentence (translated; Urdu in shared/i18n/ur.json or the module's ur.json).

import { MODULE_PREVIEW_GUIDE } from '../../modules';

const APP_GUIDE = {
  ChildHome: 'Your child picks a group here. Their buddy says each name out loud.',
  LearningGroup: 'The activities of this group. Tiles marked Coming soon are on the way.',
  EditAvatar: 'Your child can choose their own buddy here (tap the logo at the top).',
};

const ALL = { ...APP_GUIDE, ...MODULE_PREVIEW_GUIDE };

// The sentence for a screen (null = nothing to explain).
export function previewGuideFor(routeName) {
  return ALL[routeName] || null;
}
