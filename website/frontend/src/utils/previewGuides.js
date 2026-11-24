// PREVIEW GUIDES - the one short sentence for PARENTS about the page they are on, shown in the yellow "Preview mode" strip
// ONLY while a parent explores KidBuddy. A real child using Child Mode never sees these lines. (The same sentences as the
// mobile app: app/navigation/previewGuides.js + each module's previewGuide; Urdu in i18n/ur.json.)
// Each line: [a test of the page address, the sentence].

const GUIDES = [
  [/^\/child$/, 'Your child picks a group here. Their buddy says each name out loud.'],
  [/^\/child\/group\//, 'The activities of this group. Tiles marked Coming soon are on the way.'],
  [/^\/child\/buddy$/, 'Your child can choose their own buddy here (tap the logo at the top).'],
  [/^\/child\/talk$/, 'Your child taps pictures to speak. Core words never move, so they learn where each word is.'],
  [/^\/child\/english$/, 'Reading and writing, in the 5 parts of the KidBuddy plan.'],
  [/^\/child\/english\/activities\//, 'Pick an activity. Each one practises letters and their sounds.'],
  [/^\/child\/english\/alphabet$/, 'The 26 letters. Stars show how each lesson went; the glowing letter is next.'],
  [/^\/child\/english\/alphabet\//, 'Look, listen, say, play, then a 5-question star check. Help is gentle, never a red ✗.'],
  [/^\/child\/english\/trace$/, 'Pick a letter to trace with a finger.'],
  [/^\/child\/english\/trace\//, 'The ink only follows the right path, so tracing is never “wrong”.'],
  [/^\/child\/english\/games\/bubbles$/, 'Pop the bubble with the letter you hear. Missed bubbles come back.'],
  [/^\/child\/english\/games\/pairs$/, 'Find each capital and small letter pair. Cards turn back softly.'],
  [/^\/child\/english\/stories$/, 'Short videos that bring a letter to life.'],
  [/^\/child\/english\/stories\//, 'A short letter video. It pauses when you leave the page.'],
  [/^\/child\/english\/spell$/, 'Pick a word to spell.'],
  [/^\/child\/english\/spell\//, 'Drag the letters into the word. After 3 tries the buddy helps.'],
  [/^\/child\/english\/read$/, 'Read Along: pick a topic, then a level.'],
  [/^\/child\/english\/read\/[^/]+$/, 'Easy, medium or hard sentences.'],
  [/^\/child\/english\/read\/[^/]+\/[^/]+\/done$/, 'The stars of this reading session (not saved in a preview).'],
  [/^\/child\/english\/read\/[^/]+\/[^/]+\/[^/]+\/turn$/, 'Your child says the glowing word, then taps “I said it”.'],
  [/^\/child\/english\/read\/[^/]+\/[^/]+\/[^/]+$/, 'The app reads and each word lights up. Then it is your child’s turn.'],
];

// The sentence for a page address (null = nothing to explain).
export function previewGuideFor(pathname) {
  const found = GUIDES.find(([test]) => test.test(pathname));
  return found ? found[1] : null;
}
