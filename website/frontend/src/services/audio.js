// AUDIO - the voice, the sound effects and the background song of the website.
//
//   speak('Apple')            English teaching voice (slow), like the app's speech.js
//   speakUi('Pick a topic')   in the chosen language (Urdu voice when the browser has one)
//   speakAsync(text)          a promise that ends when the voice is done (with a safety timer)
//   cheer()                   a random happy phrase in a higher voice
//   playSound('pop')          a short effect from /media/sounds (the app's generated WAVs)
//   playMusic() / stopMusic() the ABC song behind the English pages (quiet, loops)
//   setSoundEnabled(false)    the master switch: mutes effects, music AND the voice
//
// The voice is the browser's built-in speech (Web Speech API). The recorded phonics clips of the
// mobile app are NOT copied to the website: their licence forbids publishing them as standalone
// files, so letter sounds use the voice here (the app does the same when a clip is missing).

import { KEYS, loadData, saveData } from '../utils/misc';
import { getCurrentLanguage, translate } from '../i18n/translate';

let soundEnabled = loadData(KEYS.sound, true);
const listeners = new Set();

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(on) {
  soundEnabled = Boolean(on);
  saveData(KEYS.sound, soundEnabled);
  if (!soundEnabled) {
    stopSpeaking();
    stopMusic();
  }
  listeners.forEach((fn) => fn(soundEnabled));
}

export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---------- the voice ----------
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

function pickVoice(lang) {
  if (!synth) return null;
  const voices = synth.getVoices();
  const prefix = lang.split('-')[0];
  return voices.find((v) => v.lang === lang) || voices.find((v) => v.lang && v.lang.startsWith(prefix)) || null;
}

export function hasVoiceFor(lang) {
  return Boolean(pickVoice(lang === 'ur' ? 'ur-PK' : 'en-US'));
}

export function stopSpeaking() {
  if (synth) synth.cancel();
}

// options: { lang, rate, pitch, onStart, onBoundary, onEnd }
export function say(text, options = {}) {
  if (!synth || !soundEnabled || !text) {
    if (options.onEnd) setTimeout(options.onEnd, 0);
    return;
  }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = options.lang || 'en-US';
  utterance.lang = lang;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.rate = options.rate || 0.85;
  utterance.pitch = options.pitch || 1.1;
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onBoundary) utterance.onboundary = options.onBoundary;
  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }
  synth.speak(utterance);
}

export function speak(text) {
  say(text, { lang: 'en-US', rate: 0.8 });
}

export function speakUi(text, params) {
  const shown = translate(text, params);
  const urdu = getCurrentLanguage() === 'ur';
  say(shown, { lang: urdu ? 'ur-PK' : 'en-US', rate: 0.9 });
}

export function speakAsync(text, options = {}) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    setTimeout(finish, 900 + String(text).length * 110);
    say(text, { ...options, onEnd: finish });
  });
}

// speakUi that waits until the voice is done (the lesson chains a hint after a line, like the app)
export function speakUiAsync(text, params) {
  const urdu = getCurrentLanguage() === 'ur';
  return speakAsync(translate(text, params), { lang: urdu ? 'ur-PK' : 'en-US', rate: 0.9 });
}

// HOLD SOUND - while a spelling letter is held, its sound plays and repeats (the app's startHoldSound):
// a pause of `gapMs` after each one, at most `maxRepeats` repeats; stopHoldSound() (let go) cuts it at once.
let holdToken = 0;
let holdTimer = null;
export function startHoldSound(text, { gapMs = 700, maxRepeats = 8, firstDelay = 0 } = {}) {
  holdToken += 1;
  clearTimeout(holdTimer);
  const mine = holdToken;
  let repeats = 0;
  const once = () => {
    if (mine !== holdToken) return;
    // speakAsync ends on the voice's "end" OR a safety timer (some browsers never report the end)
    speakAsync(text, { lang: 'en-US', rate: 0.75 }).then(() => {
      if (mine !== holdToken || repeats >= maxRepeats) return;
      holdTimer = setTimeout(() => {
        repeats += 1;
        once();
      }, gapMs);
    });
  };
  if (firstDelay) holdTimer = setTimeout(once, firstDelay);
  else once();
}
export function stopHoldSound() {
  holdToken += 1;
  clearTimeout(holdTimer);
  stopSpeaking();
}

const CHEERS = ['Yay!', 'Hooray!', 'Well done!', 'Great job!', 'You did it!', 'Super!'];
let lastCheer = '';
export function cheer() {
  let phrase = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  if (phrase === lastCheer) phrase = CHEERS[(CHEERS.indexOf(phrase) + 1) % CHEERS.length];
  lastCheer = phrase;
  say(phrase, { pitch: 1.5, rate: 1 });
}

// ---------- sound effects ----------
export const SOUND_FILES = {
  pop: 'pop.wav',
  whoosh: 'whoosh.wav',
  boing: 'boing.wav',
  sparkle: 'sparkle.wav',
  tada: 'tada.wav',
  cheerBell: 'cheer-bell.wav',
  bubble: 'bubble.wav',
  squeak: 'squeak.wav',
  giggle: 'giggle.wav',
  whistleUp: 'whistle-up.wav',
  whistleDown: 'whistle-down.wav',
  xylophone: 'xylophone.wav',
  twinkle: 'twinkle.wav',
  thump: 'thump.wav',
  tick: 'tick.wav',
  chime: 'chime.wav',
};

let effect = null;
export function playSound(name) {
  if (!soundEnabled || !SOUND_FILES[name]) return;
  try {
    if (effect) effect.pause();
    effect = new Audio(`/media/sounds/${SOUND_FILES[name]}`);
    effect.volume = 0.7;
    effect.play().catch(() => {});
  } catch (error) {
    // the browser blocked audio: no effect
  }
}

// ---------- background music (English pages) ----------
let music = null;
export function playMusic(volume = 0.12) {
  if (!soundEnabled) return;
  try {
    if (!music) {
      music = new Audio('/media/sounds/ABC-Song-Singing-Bell.mp3');
      music.loop = true;
    }
    music.volume = volume;
    if (music.paused) music.play().catch(() => {});
  } catch (error) {
    // autoplay blocked until the first click: it starts on the next page
  }
}

export function setMusicVolume(volume) {
  if (music) music.volume = volume;
}

export function stopMusic() {
  if (music) {
    music.pause();
    music.currentTime = 0;
  }
}
