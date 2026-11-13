// POP BUBBLES ROUND - "Pop the letter": 7 letter bubbles sway gently in their own spots (no roaming,
// no collisions). Tap the 3 bubbles with the target letter: each pops with a sparkle and says the
// letter. A wrong tap only makes the bubble wobble softly. After ~8 s without a tap, one right bubble glows.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import Sparkles from '../../../../../shared/components/Sparkles';
import { motion, useDrift, usePulse, useScaleIn, wiggle, wiggleRotate } from '../../../../../shared/utils/motion';
import { otherLetters, shuffle } from '../../../data/alphabetData';
import { LessonLetter } from '../LetterCase';
import { cheer } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM, CALM_ACCENTS, FONTS } from '../../../../../shared/theme/theme';

const TARGET_COUNT = 3;
const IDLE_HINT_MS = 8000;
const SPOTS = [
  [0.18, 0.16],
  [0.5, 0.1],
  [0.82, 0.18],
  [0.3, 0.48],
  [0.7, 0.46],
  [0.18, 0.82],
  [0.6, 0.82],
];

function Bubble({ bubble, size, spot, index, hint, onPress }) {
  const appear = useScaleIn(index * 60);
  const drift = useDrift({ dx: 4, dy: 6, duration: 6000 + index * 700, delay: index * 200 });
  const glow = usePulse(hint, { duration: 800 });
  const pop = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const [sparkle, setSparkle] = useState(0);

  useEffect(() => {
    if (bubble.popped) {
      setSparkle((k) => k + 1);
      motion.timing(pop, 1, { duration: 360 }).start();
    }
  }, [bubble.popped]);

  useEffect(() => {
    if (bubble.wobbleKey) wiggle(shake, { swings: 4, duration: 80 }).start();
  }, [bubble.wobbleKey]);

  const accent = CALM_ACCENTS[index % CALM_ACCENTS.length];
  const position = {
    left: `${spot[0] * 100}%`,
    top: `${spot[1] * 100}%`,
    marginLeft: -size / 2,
    marginTop: -size / 2,
  };

  return (
    <Animated.View style={[styles.spot, position, appear]}>
      <Animated.View style={drift}>
        <Animated.View
          style={{
            opacity: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }, { rotate: wiggleRotate(shake, 8) }],
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.glow, { width: size + 16, height: size + 16, borderRadius: (size + 16) / 2, opacity: glow }]}
          />
          <AnimatedPressable
            onPress={bubble.popped ? undefined : onPress}
            accessibilityLabel={bubble.item.letter}
            style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: accent.pale, borderColor: accent.main }]}
          >
            <LessonLetter item={bubble.item} style={[styles.letter, { fontSize: size * 0.5, color: accent.deep }]} />
          </AnimatedPressable>
        </Animated.View>
        <Sparkles burstKey={sparkle} size={18} count={3} />
      </Animated.View>
    </Animated.View>
  );
}

export default function PopBubblesRound({ item, instruction, voice, buddy, onDone }) {
  const [areaHeight, setAreaHeight] = useState(0);
  const [taps, setTaps] = useState(0);
  const [hintId, setHintId] = useState(null);
  const finished = useRef(false);

  const initial = useMemo(() => {
    const letters = [...Array.from({ length: TARGET_COUNT }, () => item), ...otherLetters(item.letter, SPOTS.length - TARGET_COUNT)];
    return shuffle(letters).map((entry, id) => ({ id, item: entry, correct: entry.letter === item.letter, popped: false, wobbleKey: 0 }));
  }, [item.letter]);
  const [bubbles, setBubbles] = useState(initial);

  useEffect(() => {
    voice.ui(instruction.text, instruction.speakParams || instruction.params);
  }, []);

  useEffect(() => {
    setHintId(null);
    if (finished.current) return undefined;
    const timer = setTimeout(() => {
      const waiting = bubbles.find((b) => b.correct && !b.popped);
      if (waiting) setHintId(waiting.id);
    }, IDLE_HINT_MS);
    return () => clearTimeout(timer);
  }, [taps]);

  function handlePress(bubble) {
    setTaps((t) => t + 1);
    if (!bubble.correct) {
      setBubbles((list) => list.map((b) => (b.id === bubble.id ? { ...b, wobbleKey: b.wobbleKey + 1 } : b)));
      return;
    }
    playSound('pop');
    const next = bubbles.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b));
    setBubbles(next);
    const allPopped = next.filter((b) => b.correct && b.popped).length === TARGET_COUNT;
    voice.teach(item.nameSpeech, allPopped ? { onDone: () => cheer() } : undefined);
    if (allPopped) {
      finished.current = true;
      if (buddy.party) buddy.party();
      buddy.mood('happy');
      setTimeout(onDone, 1400);
    }
  }

  const size = Math.max(58, Math.min(80, areaHeight * 0.24));

  return (
    <View style={styles.area} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
      {areaHeight > 0 &&
        bubbles.map((bubble, i) => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            index={i}
            size={size}
            spot={SPOTS[i]}
            hint={hintId === bubble.id && !bubble.popped}
            onPress={() => handlePress(bubble)}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    direction: 'ltr',
  },
  spot: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: CALM.yellow,
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
  },
});
