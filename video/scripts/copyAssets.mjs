// COPY ASSETS - copies the app's pictures and sounds into video/public/ (Remotion can only read files
// from its own public/ folder). Run it from the video/ folder:   npm run assets
// It copies: the letter pictures (assets/letters), the recorded letter sounds (assets/audio) and a few
// sound effects (assets/sounds). The copies are not committed (see video/.gitignore).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '..', '..');
const pub = path.resolve(here, '..', 'public');

function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    const source = path.join(from, name);
    if (fs.statSync(source).isDirectory()) copyDir(source, path.join(to, name), filter);
    else if (filter(name)) fs.copyFileSync(source, path.join(to, name));
  }
}

copyDir(path.join(app, 'assets', 'letters'), path.join(pub, 'letters'), (n) => n.endsWith('.png'));
copyDir(path.join(app, 'assets', 'audio'), path.join(pub, 'audio'), (n) => n.endsWith('.mp3'));
// the q sound file is called qu.mp3 in the app
const qu = path.join(pub, 'audio', 'qu.mp3');
if (fs.existsSync(qu)) fs.copyFileSync(qu, path.join(pub, 'audio', 'q.mp3'));
const sounds = ['pop.wav', 'twinkle.wav', 'chime.wav', 'xylophone.wav', 'whistle-up.wav', 'boing.wav'];
copyDir(path.join(app, 'assets', 'sounds'), path.join(pub, 'sounds'), (n) => sounds.includes(n));

console.log('Copied letters, letter sounds and sound effects into video/public/');
