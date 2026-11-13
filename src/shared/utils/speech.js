// SPEECH - the ONE place the app talks. SPEECH_ENABLED / setSpeechEnabled() is the sound switch.
//   speak('A says ah, like apple.')        English teaching voice (slow, for children)
//   speakUi('Your turn! Say it with me.')  instruction in the selected language (Urdu when chosen)
//   stopSpeaking()
// onDone is always called (also when speech is off), so screens can safely wait for it.

import * as Speech from 'expo-speech';
import { getCurrentLanguage, translate } from '../i18n/translate';

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

export function speak(text, { rate = CHILD_RATE, language = 'en-US', onStart, onDone } = {}) {
  Speech.stop();
  if (!enabled || !text) {
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
  Speech.speak(text, { language, rate, pitch: 1.05, onStart, onDone: done, onStopped: done, onError: done });
}

export function speakUi(text, params, options = {}) {
  const urdu = getCurrentLanguage() === 'ur';
  speak(translate(text, params), { ...options, language: urdu ? 'ur-PK' : 'en-US' });
}
