// MODULE MUSIC - plays a module's background song while one of its screens is open, and stops it when
// the user leaves the module. It draws nothing; App.js shows it once.
// A module asks for music in its index.js:
//   music: { file, volume, quietVolume, screens: [...], quietScreens: [...] }
// (see src/modules/english/data/englishMusic.js). On a "quiet" screen the song goes on, but softer.

import { useEffect } from 'react';
import { navigationRef, useCurrentRouteKey } from './navigationRef';
import { MODULE_MUSIC } from '../../modules';
import { playMusic, stopMusic } from '../../shared/utils/backgroundMusic';

export default function ModuleMusic() {
  const routeKey = useCurrentRouteKey(); // changes every time another screen opens

  useEffect(() => {
    const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
    const name = route ? route.name : null;
    const music = MODULE_MUSIC.find((item) => item.screens.includes(name));
    if (!music) stopMusic();
    else playMusic(music.file, music.quietScreens.includes(name) ? music.quietVolume : music.volume);
  }, [routeKey]);

  // The app is closing: no song may go on.
  useEffect(() => stopMusic, []);

  return null;
}
