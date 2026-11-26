// RENDER ALL - renders the letter story videos into the app's assets/videos/ folder and then writes
// src/modules/english/data/letterVideos.js (the app's list of videos), so the app only ever loads videos
// that really exist. Run it from the video/ folder:
//   npm run render:all           every letter A-Z (takes a while)
//   npm run render:all -- A B C  only these letters
// Already rendered letters are skipped; add --again to render them again.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '..', '..');
const out = path.join(app, 'assets', 'videos');
const args = process.argv.slice(2);
const again = args.includes('--again');
const asked = args.filter((a) => /^[A-Za-z]$/.test(a)).map((a) => a.toUpperCase());
const letters = asked.length ? asked : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

fs.mkdirSync(out, { recursive: true });
execSync('node scripts/copyAssets.mjs', { stdio: 'inherit', cwd: path.resolve(here, '..') });

for (const letter of letters) {
  const file = path.join(out, `${letter.toLowerCase()}.mp4`);
  if (!again && fs.existsSync(file)) {
    console.log(`${letter}: already rendered (use --again to redo)`);
    continue;
  }
  console.log(`Rendering ${letter} ...`);
  execSync(`npx remotion render LetterStory "${file}" --props="{\\"letter\\":\\"${letter}\\"}" --crf=28`, {
    stdio: 'inherit',
    cwd: path.resolve(here, '..'),
  });
}

// the app's list: one require() line per video that exists
const rendered = fs
  .readdirSync(out)
  .filter((n) => /^[a-z]\.mp4$/.test(n))
  .sort();
const lines = rendered.map((n) => `  ${n[0].toUpperCase()}: require('../../../../assets/videos/${n}'),`);
const list = `// LETTER VIDEOS - the letter story videos made with Remotion (the video/ folder).
// THIS FILE IS WRITTEN BY  video/scripts/renderAll.mjs  - do not edit it by hand.
// A letter that is not listed has no video yet (its tile shows "Coming soon").

export const LETTER_VIDEOS = {
${lines.join('\n')}
};
`;
fs.writeFileSync(path.join(app, 'src', 'modules', 'english', 'data', 'letterVideos.js'), list);
console.log(`Done. ${rendered.length} video(s) listed in src/modules/english/data/letterVideos.js`);
