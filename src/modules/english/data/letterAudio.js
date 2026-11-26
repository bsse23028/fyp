// LETTER AUDIO - the recorded phonics SOUND of each letter (a = "a" as in apple, b = "b" ...).
// The clips are the free "44 Phonics Sounds Audio Pack" from Phonicademy (phonicademy.com), in assets/audio/.
// React Native cannot load a file from a changing path, so each letter needs its own require() line.
// One line per letter: if a letter plays the wrong sound, change only its line.
//   Every letter uses the file with its own name (a.mp3 ... z.mp3). c and k are the same sound.
//   q has NO file yet: add assets/audio/q.mp3 and change its line to require('../../../../assets/audio/q.mp3').
// A letter set to null (or a clip that fails to play) falls back to the phone's voice (expo-speech).
// NOTE: do not DELETE a file that is listed here (the app would not start); to test the fallback, change
// the letter's line to   a: null,
// The pack only has letter SOUNDS. Letter NAMES ("ay", "bee") are still spoken by the phone's voice.

export const LETTER_AUDIO = {
  a: require('../../../../assets/audio/a.mp3'),
  b: require('../../../../assets/audio/b.mp3'),
  c: require('../../../../assets/audio/c.mp3'),
  d: require('../../../../assets/audio/d.mp3'),
  e: require('../../../../assets/audio/e.mp3'),
  f: require('../../../../assets/audio/f.mp3'),
  g: require('../../../../assets/audio/g.mp3'),
  h: require('../../../../assets/audio/h.mp3'),
  i: require('../../../../assets/audio/i.mp3'),
  j: require('../../../../assets/audio/j.mp3'),
  k: require('../../../../assets/audio/k.mp3'),
  l: require('../../../../assets/audio/l.mp3'),
  m: require('../../../../assets/audio/m.mp3'),
  n: require('../../../../assets/audio/n.mp3'),
  o: require('../../../../assets/audio/o.mp3'),
  p: require('../../../../assets/audio/p.mp3'),
  q: require('../../../../assets/audio/qu.mp3'),
  r: require('../../../../assets/audio/r.mp3'),
  s: require('../../../../assets/audio/s.mp3'),
  t: require('../../../../assets/audio/t.mp3'),
  u: require('../../../../assets/audio/u.mp3'),
  v: require('../../../../assets/audio/v.mp3'),
  w: require('../../../../assets/audio/w.mp3'),
  x: require('../../../../assets/audio/x.mp3'),
  y: require('../../../../assets/audio/y.mp3'),
  z: require('../../../../assets/audio/z.mp3'),
};
