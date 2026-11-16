// LETTER AUDIO - the ONE place that plays the recorded SOUND of a letter (phonics clips, expo-audio).
//   playLetterSound('a', onDone)     plays the clip once; onDone is ALWAYS called once (when the clip ends,
//                                    when it is stopped or replaced, or when sound is off)
//   await playLetterSoundAsync('a')  the same as a promise (for lesson scripts)
//   stopLetterSound()                stops everything (call it when a page or screen is left)
//   startHoldSound('a', options)     plays now and keeps repeating while the child holds the letter
//   stopHoldSound()                  the child let go: cut the sound at once, no more repeats
//   preloadLetterSounds(['c','a'])   get the clips ready when a lesson / round opens (no delay on first touch)
//   releaseLetterSounds(['c','a'])   the screen closes: free the clips IT asked for (give the same letters)
// Rules: only ONE letter clip plays at a time (a new one stops the old one); 'a' and 'A' use the same clip;
// the sound-off switch of sounds.js is respected; a clip never talks over the voice (the voice is stopped).
// If a letter has no file, or its clip fails, the phone's voice (expo-speech) says the sound instead, with
// one warning in the development console. The app never crashes or goes silent because of one file.
//
// Two screens can want the same letter at the same moment (the next lesson opens before the old one closes),
// so every letter counts how many screens asked for it and is only freed when nobody needs it any more.
//
// The files and the fallback texts belong to the English module, which hands them over once with
// configureLetterAudio() (see src/modules/english/index.js and data/letterAudio.js).

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { soundEnabled } from './sounds';
import { SLOW_RATE, speak, stopSpeaking } from './speech';

const VOLUME = 1; // normal loudness of a letter clip (0 to 1)
const END_EXTRA_MS = 500; // safety timer = the clip's length + this (if the phone never reports "finished")
const SEEK_WAIT_MS = 200; // wait at most this long for "back at the start of the clip" before playing
const LOAD_WAIT_MS = 700; // wait at most this long for a clip that is still loading
const STARTED_CHECK_MS = 900; // this long after asking, the clip must be playing, or the voice takes over
const UNKNOWN_LENGTH_MS = 3000; // safety timer when the clip's length is not known yet

let files = {}; // 'a' -> the clip's file
let speechTextFor = () => null; // 'a' -> what the voice says instead ("ah") when a clip cannot play
const players = {}; // 'a' -> its audio player (made on first use or by preloadLetterSounds)
const wanted = {}; // 'a' -> how many open screens asked for this letter
const warned = {}; // letters that already printed their warning
let modeReady = false;

// The play that is running now: { id, key, heard, finish, startWhenLoaded }.
//   heard = the phone has confirmed that this play really started (only then may "finished" end it)
let current = null;
let playCount = 0; // every play gets its own number, so late answers from an older play are ignored
let voiceTalking = false; // true while the voice is saying a letter sound instead of a clip

let holdToken = 0; // changes on every start / stop of a hold, so an old timer can never play again
let holdTimer = null;

export function configureLetterAudio(fileMap, speechText) {
  files = fileMap || {};
  speechTextFor = speechText || (() => null);
}

const keyOf = (letter) => String(letter || '').toLowerCase();

function warnOnce(key, reason) {
  if (warned[key]) return;
  warned[key] = true;
  if (__DEV__) console.warn(`[letterAudio] No clip for "${key}" (${reason}). Using the voice instead.`);
}

// The player of one letter, or null when it has no usable file.
function getPlayer(key) {
  if (players[key]) return players[key];
  if (!files[key] || warned[key]) {
    if (!files[key]) warnOnce(key, 'no file in letterAudio.js');
    return null;
  }
  try {
    const player = createAudioPlayer(files[key]);
    // The phone reports what the clip is doing (loaded, playing, finished).
    player.addListener('playbackStatusUpdate', (status) => {
      if (!status || !current || current.key !== key) return;
      // The file was still loading when the play was asked for: start it now.
      if (status.isLoaded && current.startWhenLoaded) current.startWhenLoaded();
      if (status.playing) current.heard = true;
      // "Finished" only counts for a play that really started (an old "finished" from the play before is ignored).
      if (status.didJustFinish && current.heard) current.finish();
    });
    players[key] = player;
    return player;
  } catch (error) {
    warnOnce(key, 'the file could not be loaded');
    return null;
  }
}

export function preloadLetterSounds(letters) {
  (letters || []).forEach((letter) => {
    const key = keyOf(letter);
    wanted[key] = (wanted[key] || 0) + 1;
    getPlayer(key);
  });
}

// Free the clips of the letters a closing screen asked for. A letter that another open screen still
// needs stays loaded.
export function releaseLetterSounds(letters) {
  // No list given = free every clip (a safety net: unused players must never pile up, because a phone
  // can only keep a small number of them and then new clips stay silent).
  if (!letters) {
    Object.keys(players).forEach((key) => {
      wanted[key] = 0;
    });
  }
  (letters || Object.keys(players)).forEach((letter) => {
    const key = keyOf(letter);
    wanted[key] = Math.max(0, (wanted[key] || 0) - 1);
    if (wanted[key] > 0 || !players[key]) return;
    if (current && current.key === key) stopLetterSound();
    try {
      players[key].remove();
    } catch (error) {
      // ignore: the player is gone either way
    }
    delete players[key];
  });
}

// Ends the play that is running now: its clip (or the voice) goes quiet and its onDone is called.
function endCurrent() {
  const play = current;
  current = null;
  if (voiceTalking) {
    voiceTalking = false;
    stopSpeaking();
  }
  if (!play) return;
  try {
    if (players[play.key]) players[play.key].pause();
  } catch (error) {
    // ignore
  }
  play.finish();
}

export function playLetterSound(letter, onDone, { volume = VOLUME } = {}) {
  const key = keyOf(letter);
  endCurrent(); // only one clip at a time

  const id = ++playCount;
  let finished = false;
  let timer = null;
  const play = { id, key, heard: false, startWhenLoaded: null };
  play.finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (current === play) current = null;
    if (onDone) onDone();
  };
  current = play;

  if (!soundEnabled() || !key) {
    setTimeout(play.finish, 0);
    return;
  }

  // The voice says the sound when there is no clip.
  const useVoice = () => {
    const text = speechTextFor(key);
    if (!text) {
      setTimeout(play.finish, 0);
      return;
    }
    speak(text, {
      rate: SLOW_RATE,
      onDone: () => {
        if (current === play) voiceTalking = false;
        play.finish();
      },
    });
    voiceTalking = true;
  };

  const player = getPlayer(key);
  if (!player) {
    useVoice();
    return;
  }

  try {
    if (!modeReady) {
      modeReady = true;
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    stopSpeaking(); // a clip never plays on top of the voice

    // Go back to the start of the clip FIRST, and only then play (in this order the clip can never be
    // skipped because it was still standing at its end from the last time).
    const start = () => {
      play.startWhenLoaded = null;
      if (current !== play || finished) return; // stopped or replaced while it was getting ready
      const begin = () => {
        if (current !== play || finished) return;
        try {
          player.volume = volume;
          player.play();
        } catch (error) {
          warnOnce(key, 'the clip failed to play');
          useVoice();
        }
      };
      let begun = false;
      const beginOnce = () => {
        if (begun) return;
        begun = true;
        begin();
      };
      player.seekTo(0).then(beginOnce, beginOnce);
      setTimeout(beginOnce, SEEK_WAIT_MS); // do not wait forever for the phone's answer
      // Did the clip really start? If the phone gives no sign of it, the voice says the sound instead,
      // so a letter is never silent.
      setTimeout(() => {
        if (current !== play || finished || play.heard) return;
        let moving = false;
        try {
          moving = player.playing || player.currentTime > 0.05;
        } catch (error) {
          moving = false;
        }
        if (moving) {
          play.heard = true;
          return;
        }
        if (__DEV__) console.warn(`[letterAudio] The clip of "${key}" did not start. Using the voice this time.`);
        try {
          player.pause();
        } catch (error) {
          // ignore
        }
        useVoice();
      }, STARTED_CHECK_MS);
      // Safety net: end the play even if the phone never says "finished".
      clearTimeout(timer);
      timer = setTimeout(play.finish, player.duration > 0 ? player.duration * 1000 + END_EXTRA_MS : UNKNOWN_LENGTH_MS);
    };

    if (player.isLoaded) start();
    else {
      // Still loading (the very first touch): the listener above starts it the moment it is ready.
      play.startWhenLoaded = start;
      timer = setTimeout(play.finish, UNKNOWN_LENGTH_MS);
      // The phone did not report "loaded" in time: try to play anyway (the check above still guards it).
      setTimeout(() => {
        if (play.startWhenLoaded) play.startWhenLoaded();
      }, LOAD_WAIT_MS);
    }
  } catch (error) {
    warnOnce(key, 'the clip failed to play');
    useVoice();
  }
}

export function playLetterSoundAsync(letter, options) {
  return new Promise((resolve) => playLetterSound(letter, resolve, options));
}

export function stopLetterSound() {
  holdToken += 1;
  clearTimeout(holdTimer);
  endCurrent();
}

// The child touched a letter: play its sound now, and while the letter is held play it again after each
// pause of `gapMs`, a little quieter, at most `maxRepeats` more times. `repeat: false` = play it only once.
export function startHoldSound(letter, { gapMs = 700, repeatVolume = 0.7, maxRepeats = 8, repeat = true } = {}) {
  holdToken += 1;
  clearTimeout(holdTimer);
  const mine = holdToken;
  let repeats = 0;

  const playOnce = (volume) => {
    playLetterSound(
      letter,
      () => {
        // Still the same hold? (An old timer or callback sees a different token and does nothing.)
        if (mine !== holdToken || !repeat || repeats >= maxRepeats) return;
        holdTimer = setTimeout(() => {
          if (mine !== holdToken) return;
          repeats += 1;
          playOnce(repeatVolume);
        }, gapMs);
      },
      { volume }
    );
  };
  playOnce(VOLUME);
}

export function stopHoldSound() {
  stopLetterSound();
}
