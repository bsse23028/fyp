// BACKGROUND MUSIC - one soft song that loops in the background (expo-audio).
//   playMusic(file, volume)   start the song (or only change its volume when it is already playing)
//   stopMusic()               stop it and free the player
// Only ONE song at a time. It respects the sound-off switch of sounds.js, and it pauses by itself while
// the app is in the background (the phone's home screen, another app) and continues when the app is back.
// Who decides WHEN it plays: src/app/navigation/ModuleMusic.js (it watches which screen is open).

import { AppState } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { soundEnabled } from './sounds';

let player = null;
let currentFile = null;
let modeReady = false;

export function playMusic(file, volume = 0.2) {
  if (!file || !soundEnabled()) {
    stopMusic();
    return;
  }
  try {
    if (!modeReady) {
      modeReady = true;
      setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {});
    }
    if (player && currentFile !== file) stopMusic();
    if (!player) {
      player = createAudioPlayer(file);
      player.loop = true;
      currentFile = file;
    }
    player.volume = volume;
    if (AppState.currentState === 'active') player.play();
  } catch (error) {
    // Music is a nice-to-have: never let it break a screen.
    player = null;
    currentFile = null;
  }
}

export function stopMusic() {
  try {
    if (player) {
      player.pause();
      player.remove();
    }
  } catch (error) {
    // ignore: the player is gone either way
  }
  player = null;
  currentFile = null;
}

// The app went to the background: be quiet. It came back: go on.
AppState.addEventListener('change', (state) => {
  if (!player) return;
  try {
    if (state === 'active') player.play();
    else player.pause();
  } catch (error) {
    // ignore
  }
});
