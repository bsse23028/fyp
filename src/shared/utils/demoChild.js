// DEMO CHILD - "Buddy", the built-in child used only by Preview mode (Explore KidBuddy).
// It lives only in this file: it is never saved, never sent to the server and never added to the child list.

export const DEMO_CHILD = Object.freeze({
  id: 'preview-buddy',
  name: 'Buddy',
  ageBand: '',
  avatar: 'rabbit',
  language: 'en',
  supports: [],
  modules: [],
  story: {},
  reading: null,
  activity: {},
  isDemo: true,
});
