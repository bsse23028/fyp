// SAY PAGE - (the buddy says "Say it with me!") a big round mic button pulses. Tapping it says the
// sound slowly 3 times, the letter beating with each one. Then a big thumbs-up button appears
// (no text; nothing is recorded): tapping it makes the buddy cheer and finishes the page.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import JumpingLetter from './JumpingLetter';
import useLessonSequence from './useLessonSequence';
import { motion, usePulse } from '../../../../../shared/utils/motion';
import { SLOW_RATE } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM, CALM_SHADOW, CALM_SUCCESS } from '../../../../../shared/theme/theme';

const REPEATS = 3;

function RoundIconButton({ icon, color, size, pulsing, onPress, label }) {
  const pulse = usePulse(pulsing, { duration: 1000 });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        style={[styles.round, CALM_SHADOW.lifted, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}
      >
        <Ionicons name={icon} size={size * 0.5} color={CALM.onPrimary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function SayPage({ item, active, voice, cardSize, onDone }) {
  const letter = useRef(null);
  const sequence = useLessonSequence(active);
  const [phase, setPhase] = useState('ready'); // ready | saying | canSay | done
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'canSay') motion.spring(appear, 1, { friction: 5 }).start();
  }, [phase]);

  useEffect(() => {
    if (!active && letter.current) letter.current.reset();
  }, [active]);

  async function sayTogether() {
    if (sequence.playing) return;
    playSound('sparkle');
    setPhase((p) => (p === 'ready' ? 'saying' : p));
    voice.remember(item.soundSpeech, { rate: SLOW_RATE });
    const finished = await sequence.play(async ({ anim, say }) => {
      for (let i = 0; i < REPEATS; i++) {
        await Promise.all([anim(letter.current.beat()), say(item.soundSpeech, { rate: SLOW_RATE })]);
      }
    });
    if (finished) setPhase((p) => (p === 'done' ? p : 'canSay'));
  }

  function saidIt() {
    if (phase === 'done') return;
    setPhase('done');
    onDone();
  }

  const thumbStyle = {
    opacity: appear,
    transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
  };

  return (
    <View style={styles.body}>
      <JumpingLetter ref={letter} item={item} size={cardSize * 0.8} room={12} />
      <View style={styles.buttons}>
        <RoundIconButton
          icon="mic"
          color={CALM.primary}
          size={96}
          pulsing={active && phase === 'ready'}
          onPress={sayTogether}
          label="Say it together"
        />
        {phase === 'canSay' || phase === 'done' ? (
          <Animated.View style={thumbStyle}>
            <RoundIconButton
              icon="thumbs-up"
              color={CALM_SUCCESS.main}
              size={96}
              pulsing={active && phase === 'canSay'}
              onPress={saidIt}
              label="I said it"
            />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 10,
    minHeight: 110,
    alignItems: 'center',
    direction: 'ltr',
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
