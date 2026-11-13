// LOOK PAGE - the big letter on its floor shadow, gently pulsing to invite a tap.
// TAP = one joyful sequence, chained to the voice:
//   big jump with one full turn at the top + squash landing  ->  says the letter NAME ("ay")
//   then 3 small hops, each with the SOUND ("ah") and a tiny sparkle
//   then the buddy does a happy hop (onCheer).
// The sequence also plays ONCE by itself ~1.7 s after the page first appears (a demonstration that does
// NOT finish the page: the child must tap). Taps during a sequence are ignored; leaving the page stops it.

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import Sparkles from '../../../../../shared/components/Sparkles';
import JumpingLetter from './JumpingLetter';
import useLessonSequence from './useLessonSequence';
import { SLOW_RATE } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';

const DEMO_DELAY = 1700;
const SOUND_REPEATS = 3;
const land = () => playSound('boing');

export default function LookPage({ item, active, cardSize, onDone, onCheer }) {
  const letter = useRef(null);
  const sequence = useLessonSequence(active);
  const [tapped, setTapped] = useState(false);
  const [sparkle, setSparkle] = useState(0);
  const demoShown = useRef(false);

  async function perform(byChild) {
    const finished = await sequence.play(async ({ anim, say }) => {
      await Promise.all([anim(letter.current.bigJump(land)), say(item.nameSpeech)]);
      for (let i = 0; i < SOUND_REPEATS; i++) {
        setSparkle((k) => k + 1);
        await Promise.all([anim(letter.current.smallHop(land)), say(item.soundSpeech, { rate: SLOW_RATE })]);
      }
    });
    if (finished && byChild) {
      onDone();
      onCheer();
    }
  }

  useEffect(() => {
    if (!active) {
      if (letter.current) letter.current.reset();
      return undefined;
    }
    if (demoShown.current) return undefined;
    const timer = setTimeout(() => {
      demoShown.current = true;
      perform(false);
    }, DEMO_DELAY);
    return () => clearTimeout(timer);
  }, [active]);

  function handleTap() {
    if (sequence.playing) return;
    setTapped(true);
    perform(true);
  }

  return (
    <View style={styles.center}>
      <AnimatedPressable onPress={handleTap} accessibilityLabel={`Letter ${item.letter}`}>
        <JumpingLetter ref={letter} item={item} size={cardSize} inviting={active && !tapped && !sequence.playing} />
        <Sparkles burstKey={sparkle} size={22} count={2} style={styles.sparkles} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkles: {
    start: '70%',
    end: '-20%',
  },
});
