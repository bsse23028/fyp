// LETTER IMAGES - the picture file of every letter and every word picture of the spelling game.
// React Native cannot load an image from a changing path, so each file needs its own require() line.
// The sizes come from assets/manifest.json: every letter is drawn on the same 512 x 512 canvas with the
// same font size and baseline, and `bbox` says where the letter sits on that canvas. Because of this,
// ALL letters must always be shown at the SAME scale (never crop or resize one letter on its own).
//
// TO ADD A LETTER PICTURE: put the PNG in assets/letters/, add its entry to assets/manifest.json and
//   add one require() line to LETTER_FILES below.
// TO ADD A WORD PICTURE: put the PNG in assets/words/ and add one line to WORD_ART (the name is the
//   word's id in spellingWords.js).

import manifest from '../../../../assets/manifest.json';

const LETTER_FILES = {
  // small letters
  a: require('../../../../assets/letters/lower/a.png'),
  b: require('../../../../assets/letters/lower/b.png'),
  c: require('../../../../assets/letters/lower/c.png'),
  d: require('../../../../assets/letters/lower/d.png'),
  e: require('../../../../assets/letters/lower/e.png'),
  f: require('../../../../assets/letters/lower/f.png'),
  g: require('../../../../assets/letters/lower/g.png'),
  h: require('../../../../assets/letters/lower/h.png'),
  i: require('../../../../assets/letters/lower/i.png'),
  j: require('../../../../assets/letters/lower/j.png'),
  k: require('../../../../assets/letters/lower/k.png'),
  l: require('../../../../assets/letters/lower/l.png'),
  m: require('../../../../assets/letters/lower/m.png'),
  n: require('../../../../assets/letters/lower/n.png'),
  o: require('../../../../assets/letters/lower/o.png'),
  p: require('../../../../assets/letters/lower/p.png'),
  q: require('../../../../assets/letters/lower/q.png'),
  r: require('../../../../assets/letters/lower/r.png'),
  s: require('../../../../assets/letters/lower/s.png'),
  t: require('../../../../assets/letters/lower/t.png'),
  u: require('../../../../assets/letters/lower/u.png'),
  v: require('../../../../assets/letters/lower/v.png'),
  w: require('../../../../assets/letters/lower/w.png'),
  x: require('../../../../assets/letters/lower/x.png'),
  y: require('../../../../assets/letters/lower/y.png'),
  z: require('../../../../assets/letters/lower/z.png'),
  // capital letters
  A: require('../../../../assets/letters/upper/A.png'),
  B: require('../../../../assets/letters/upper/B.png'),
  C: require('../../../../assets/letters/upper/C.png'),
  D: require('../../../../assets/letters/upper/D.png'),
  E: require('../../../../assets/letters/upper/E.png'),
  F: require('../../../../assets/letters/upper/F.png'),
  G: require('../../../../assets/letters/upper/G.png'),
  H: require('../../../../assets/letters/upper/H.png'),
  I: require('../../../../assets/letters/upper/I.png'),
  J: require('../../../../assets/letters/upper/J.png'),
  K: require('../../../../assets/letters/upper/K.png'),
  L: require('../../../../assets/letters/upper/L.png'),
  M: require('../../../../assets/letters/upper/M.png'),
  N: require('../../../../assets/letters/upper/N.png'),
  O: require('../../../../assets/letters/upper/O.png'),
  P: require('../../../../assets/letters/upper/P.png'),
  Q: require('../../../../assets/letters/upper/Q.png'),
  R: require('../../../../assets/letters/upper/R.png'),
  S: require('../../../../assets/letters/upper/S.png'),
  T: require('../../../../assets/letters/upper/T.png'),
  U: require('../../../../assets/letters/upper/U.png'),
  V: require('../../../../assets/letters/upper/V.png'),
  W: require('../../../../assets/letters/upper/W.png'),
  X: require('../../../../assets/letters/upper/X.png'),
  Y: require('../../../../assets/letters/upper/Y.png'),
  Z: require('../../../../assets/letters/upper/Z.png'),
};

// The side length of the square canvas every letter is drawn on (512).
export const LETTER_CANVAS = manifest.canvas.width;

// How far down the canvas the writing line is (the line every letter stands on).
export const LETTER_BASELINE = manifest.baseline_y;

// LETTER_ART['a'] = { image, x, y, width, height, color, light }
//   x, y, width, height = where the letter sits on the canvas (in canvas pixels)
//   color / light       = the letter's main and light colour (for glows and flashes)
export const LETTER_ART = {};
manifest.letters.forEach((entry) => {
  const [left, top, right, bottom] = entry.bbox;
  LETTER_ART[entry.letter] = {
    image: LETTER_FILES[entry.letter],
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    color: entry.main_colour,
    light: entry.light_colour,
  };
});

export const WORD_ART = {
  umbrella: require('../../../../assets/words/umbrella.png'),
  cake: require('../../../../assets/words/cake.png'),
};
