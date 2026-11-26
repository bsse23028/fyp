// SPEECH - the ONE place the app talks. SPEECH_ENABLED / setSpeechEnabled() switches the voice off;
// the master sound switch in sounds.js (SOUND_ENABLED) silences the voice too.
//   speak('A says ah, like apple.')        English teaching voice (slow, for children)
//   speakUi('Your turn! Say it with me.')  instruction in the selected language (Urdu when chosen)
//   stopSpeaking()
//   await speakAsync('ay')               resolves when the voice is done (or after a fallback timer)
//   cheer()                              a happy, higher "Yay!" / "Hooray!" ... (never the same twice in a row)
// onDone is always called (also when speech is off), so screens can safely wait for it.

import * as Speech from 'expo-speech';
import { getCurrentLanguage, translate } from '../i18n/translate';
import { soundEnabled } from './sounds';

export const SPEECH_ENABLED = true;
export const CHILD_RATE = 0.78;
export const SLOW_RATE = 0.55;

let enabled = SPEECH_ENABLED;

export function setSpeechEnabled(value) {
  enabled = Boolean(value);
  if (!enabled) Speech.stop();
}

export function speechEnabled() {
  return enabled;
}

export function stopSpeaking() {
  Speech.stop();
}

export function speak(text, { rate = CHILD_RATE, pitch = 1.05, language = 'en-US', onStart, onDone } = {}) {
  Speech.stop();
  if (!enabled || !soundEnabled() || !text) {
    if (onStart) onStart();
    if (onDone) setTimeout(onDone, 0);
    return;
  }
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    if (onDone) onDone();
  };
  Speech.speak(text, { language, rate, pitch, onStart, onDone: done, onStopped: done, onError: done });
}

export function speakUi(text, params, options = {}) {
  const urdu = getCurrentLanguage() === 'ur';
  speak(translate(text, params), { ...options, language: urdu ? 'ur-PK' : 'en-US' });
}

// A rough length of `text` when spoken, used as a safety net if the phone never reports onDone.
function estimateMs(text, rate) {
  return 900 + (String(text).length * 95) / (rate || CHILD_RATE);
}

export function speakAsync(text, options = {}, fallbackMs) {
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, fallbackMs || estimateMs(text, options.rate));
    speak(text, { ...options, onDone: finish });
  });
}

export const HAPPY_PHRASES = ['Yay!', 'Yaaay!', 'Hooray!', 'Wow!', 'You did it!', 'Great job!'];
const CHEER_VOICE = { pitch: 1.5, rate: 0.92 };
let lastCheer = null;

// A happy phrase in the selected language, higher and brighter. Returns a promise (voice done).
export function cheer() {
  const choices = HAPPY_PHRASES.filter((phrase) => phrase !== lastCheer);
  lastCheer = choices[Math.floor(Math.random() * choices.length)];
  const urdu = getCurrentLanguage() === 'ur';
  return speakAsync(translate(lastCheer), { ...CHEER_VOICE, language: urdu ? 'ur-PK' : 'en-US' });
}
