// CELEBRATION - one happy effect over the whole screen, played ONCE each time `burstKey` changes.
//   <Celebration burstKey={n} types="popper" />                 a small win
//   <Celebration burstKey={n} types={['confetti', 'stars']} big /> the Result page
// types: 'confetti' | 'popper' | 'stars' | 'balloons' (one name or a list played together)
// It plays the Lottie files listed in lottieFiles.js. If a file is not there yet (null), or animations
// are switched off, it uses the built-in Confetti instead, so the app always works.
// It never catches touches, removes itself when done, and only ONE celebration plays at a time
// (a new one replaces the one that is still playing).

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Confetti from './Confetti';
import { LOTTIE_FILES } from './lottieFiles';
import { animationsEnabled } from '../utils/motion';

const SAFETY_MS = 4500; // remove the Lottie layer after this long even if it never says "finished"

let stopPlaying = null; // stops whichever celebration is playing now (one at a time)

export default function Celebration({ burstKey = 0, types = 'popper', big = false, count }) {
  const [shown, setShown] = useState(null); // { key, files } while a Lottie plays
  const [fallbackKey, setFallbackKey] = useState(0);
  const finished = useRef(0);

  useEffect(() => {
    if (!burstKey) return undefined;
    if (stopPlaying) stopPlaying();

    const list = Array.isArray(types) ? types : [types];
    const files = animationsEnabled() ? list.map((name) => LOTTIE_FILES[name]).filter(Boolean) : [];

    if (files.length === 0) {
      setShown(null);
      setFallbackKey((k) => k + 1);
      stopPlaying = null;
      return undefined;
    }

    finished.current = 0;
    setShown({ key: burstKey, files });
    const stop = () => setShown(null);
    stopPlaying = stop;
    const timer = setTimeout(stop, SAFETY_MS);
    return () => clearTimeout(timer);
  }, [burstKey]);

  useEffect(() => () => {
    stopPlaying = null;
  }, []);

  function handleFinish(total) {
    finished.current += 1;
    if (finished.current >= total) setShown(null);
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Confetti burstKey={fallbackKey} big={big} count={count} />
      {shown
        ? shown.files.map((source, i) => (
            <LottieView
              key={`${shown.key}-${i}`}
              source={source}
              autoPlay
              loop={false}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
              onAnimationFinish={() => handleFinish(shown.files.length)}
            />
          ))
        : null}
    </View>
  );
}
