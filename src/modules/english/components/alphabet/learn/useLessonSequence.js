// USE LESSON SEQUENCE - runs ONE animation + voice script at a time on a lesson page.
//   const sequence = useLessonSequence(active);
//   await sequence.play(async ({ anim, say, wait }) => {
//     await Promise.all([anim(letter.bigJump()), say('ay')]);   // voice and motion stay together
//   });
// play() returns true when the script finished, false when it was skipped (already playing) or
// cancelled (the page stopped being active, or cancel() was called). Taps during a script are ignored.

import { useCallback, useEffect, useRef, useState } from 'react';
import { speakAsync } from '../../../../../shared/utils/speech';

const CANCELLED = { cancelled: true };

export default function useLessonSequence(active) {
  const token = useRef(0);
  const running = useRef(false);
  const [playing, setPlaying] = useState(false);

  const cancel = useCallback(() => {
    token.current += 1;
    running.current = false;
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!active) cancel();
  }, [active]);

  useEffect(() => () => {
    token.current += 1;
  }, []);

  const play = useCallback(async (script) => {
    if (running.current) return false;
    const mine = ++token.current;
    running.current = true;
    setPlaying(true);

    const guard = (promise) =>
      promise.then((value) => {
        if (mine !== token.current) throw CANCELLED;
        return value;
      });
    const helpers = {
      anim: (animation) => guard(new Promise((resolve) => animation.start(() => resolve()))),
      say: (text, options) => guard(speakAsync(text, options)),
      wait: (ms) => guard(new Promise((resolve) => setTimeout(resolve, ms))),
    };

    try {
      await script(helpers);
      return true;
    } catch (error) {
      if (error !== CANCELLED) throw error;
      return false;
    } finally {
      if (mine === token.current) {
        running.current = false;
        setPlaying(false);
      }
    }
  }, []);

  return { play, cancel, playing };
}
