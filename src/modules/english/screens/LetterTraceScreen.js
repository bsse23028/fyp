// LETTER TRACE SCREEN - trace one letter with a finger: first the CAPITAL, then the small letter.
//   The buddy walks in; the voice says "Let's trace A!" and a short cue for every stroke ("Down!").
//   Each finished stroke = a sparkle + the buddy hops. Each finished letter = the letter's recorded
//   sound, a party popper and a cheer. After both: the picture friend dances and says "A for apple!",
//   a big celebration plays and three icon buttons appear (again / next letter / all letters).
// Nothing is saved (tracing progress is not stored yet). Params: { letter: 'A' }
// Every number is in components/trace/traceConfig.js.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import KidScene from '../../../shared/components/KidScene';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import TalkingObject from '../../../shared/components/TalkingObject';
import Celebration from '../../../shared/components/Celebration';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import Text from '../../../shared/components/AppText';
import { BackCircle } from '../components/SectionHeader';
import TraceCanvas from '../components/trace/TraceCanvas';
import LetterArt from '../components/spelling/LetterArt';
import { TRACE } from '../components/trace/traceConfig';
import { getLetter, nextLetter } from '../data/alphabetData';
import { LETTER_ART } from '../data/letterImages';
import { strokesFor } from '../data/traceStrokes';
import { motion, useScaleIn } from '../../../shared/utils/motion';
import { cheer, speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { playSound } from '../../../shared/utils/sounds';
import { pictureVoice } from '../../../shared/utils/voiceConfig';
import { playLetterSound, stopLetterSound } from '../../../shared/utils/letterAudio';
import { CALM, CALM_SHADOW, FONTS, SPACING } from '../../../shared/theme/theme';

function RoundButton({ icon, onPress, label, size = 52, main = false }) {
  const appear = useScaleIn(0);
  return (
    <Animated.View style={appear}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        style={[styles.round, main ? styles.roundMain : null, CALM_SHADOW.soft, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Ionicons name={icon} size={size * 0.48} color={main ? '#FFFFFF' : CALM.primaryDark} />
      </AnimatedPressable>
    </Animated.View>
  );
}

function StrokeDots({ total, done }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < done && { backgroundColor: TRACE.BADGE_COLORS[i % TRACE.BADGE_COLORS.length] }]} />
      ))}
    </View>
  );
}

export default function LetterTraceScreen({ navigation, route }) {
  const item = getLetter(route.params ? route.params.letter : 'A');
  const following = nextLetter(item.letter);
  const phases = [item.letter, item.lower];
  const focused = useIsFocused();
  const { width, height } = useWindowDimensions();
  const canvasWidth = Math.min(TRACE.CANVAS_MAX_WIDTH, width * TRACE.CANVAS_WIDTH_FRACTION, (height * TRACE.CANVAS_MAX_HEIGHT_FRACTION) / 1.15);

  const [phase, setPhase] = useState(0);
  const [attempt, setAttempt] = useState(0); // changes = the canvas starts again
  const [strokesDone, setStrokesDone] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [celebration, setCelebration] = useState({ key: 0, types: 'popper', big: false });
  const [buddy, setBuddy] = useState({ mood: 'idle', moodKey: 0 });
  const [friend, setFriend] = useState({ mood: 'idle', key: 0, speaking: false });
  const flip = useRef(new Animated.Value(1)).current;
  const timers = useRef([]);
  const lastCue = useRef(null);

  const char = phases[phase];
  const total = strokesFor(char).length;
  const example = item.examples[0];
  const ink = (LETTER_ART[char] && LETTER_ART[char].color) || item.accent.main;

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const buddyMood = (mood) => setBuddy((b) => ({ mood, moodKey: b.moodKey + 1 }));
  const friendMood = (mood, speaking = false) => setFriend((f) => ({ mood, key: f.key + 1, speaking }));

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      stopSpeaking();
      stopLetterSound();
    });
    return () => {
      unsubscribe();
      timers.current.forEach(clearTimeout);
      stopSpeaking();
      stopLetterSound();
    };
  }, [navigation]);

  // The voice: the first stroke of a letter says the intro first, then the stroke cue.
  function onStrokeStart(index, cue) {
    setStrokesDone(index);
    lastCue.current = cue;
    if (index === 0) {
      const intro = phase === 0 ? "Let's trace {letter}!" : 'Now small {letter}!';
      // the voice always says the letter NAME (a small "a" would be read as the word "a")
      later(() => speakUi(intro, { letter: item.letter }, { onDone: () => speakUi(cue) }), phase === 0 ? 900 : 200);
    } else {
      speakUi(cue);
    }
  }

  function onStrokeDone(index) {
    setStrokesDone(index + 1);
    playSound('chime');
    buddyMood('hop');
  }

  function onLetterDone() {
    playLetterSound(char);
    later(() => {
      playSound('pop');
      setCelebration((c) => ({ key: c.key + 1, types: 'popper', big: false }));
      cheer();
      buddyMood('cheer');
      friendMood('happy');
    }, 700);

    if (phase === 0) {
      later(() => {
        motion
          .sequence([
            motion.timing(flip, 0.6, { duration: TRACE.NEXT_LETTER_FLIP_MS / 2 }),
            motion.call(() => {
              setPhase(1);
              setStrokesDone(0);
            }),
            motion.spring(flip, 1, { friction: 5 }),
          ])
          .start();
      }, TRACE.LETTER_CELEBRATE_MS);
    } else {
      later(() => {
        setAllDone(true);
        playSound('tada');
        setCelebration((c) => ({ key: c.key + 1, types: ['confetti', 'stars'], big: true }));
        friendMood('dance', true);
        speakUi('{letter} for {word}!', { letter: item.letter, word: example.word.toLowerCase() }, {
          ...pictureVoice(example.emoji),
          onDone: () => setFriend((f) => ({ ...f, speaking: false })),
        });
        buddyMood('dance');
      }, TRACE.LETTER_CELEBRATE_MS);
    }
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stopSpeaking();
    setAllDone(false);
    setPhase(0);
    setStrokesDone(0);
    setAttempt((a) => a + 1);
  }

  function repeatVoice() {
    if (allDone) speakUi('{letter} for {word}!', { letter: item.letter, word: example.word.toLowerCase() }, pictureVoice(example.emoji));
    else if (lastCue.current) speakUi(lastCue.current);
  }

  return (
    <Screen mode="child" contentStyle={styles.noPadding}>
      <KidScene scene="day" active={focused}>
        <View style={styles.body}>
          <View style={styles.header}>
            <BackCircle onPress={() => navigation.goBack()} />
            <StrokeDots total={total} done={allDone ? total : strokesDone} />
            <View style={styles.headerRight}>
              <RoundButton icon="volume-high" label="Say it again" onPress={repeatVoice} />
              <RoundButton icon="refresh" label="Start again" onPress={again} />
            </View>
          </View>

          <View style={styles.pairRow}>
            {phases.map((c, i) => (
              <View key={c} style={[styles.pairChip, i === phase && !allDone ? styles.pairChipOn : null]}>
                <LetterArt char={c} scale={i === phase && !allDone ? 0.16 : 0.12} />
              </View>
            ))}
          </View>

          <View style={styles.canvasArea}>
            <Animated.View style={[styles.canvasCard, CALM_SHADOW.lifted, { transform: [{ scale: flip }] }]}>
              <TraceCanvas
                key={`${attempt}-${char}`}
                char={char}
                width={canvasWidth}
                color={ink}
                active={focused && !allDone}
                onStrokeStart={onStrokeStart}
                onStrokeDone={onStrokeDone}
                onDone={onLetterDone}
              />
            </Animated.View>
          </View>

          <View style={styles.bottom}>
            <View style={styles.buddySpot} />
            {allDone ? (
              <View style={styles.actions}>
                <RoundButton icon="refresh" label="Play again" onPress={again} size={60} />
                {following ? (
                  <RoundButton
                    icon="arrow-forward"
                    label="Next letter"
                    main
                    size={76}
                    onPress={() => navigation.replace('LetterTrace', { letter: following.letter })}
                  />
                ) : null}
                <RoundButton icon="grid" label="All letters" onPress={() => navigation.goBack()} size={60} />
              </View>
            ) : (
              <View style={styles.spacer} />
            )}
            <View style={styles.friend}>
              <TalkingObject
                emoji={example.emoji}
                image={example.image}
                size={78}
                mood={friend.mood}
                moodKey={friend.key}
                speaking={friend.speaking}
                active={focused}
                onPress={() => speakUi('{letter} for {word}!', { letter: item.letter, word: example.word.toLowerCase() }, pictureVoice(example.emoji))}
              />
              <Text style={styles.friendWord}>{example.word}</Text>
            </View>
          </View>

          <BuddyCharacter size={80} style={styles.buddy} enterFromLeft idleThink mood={buddy.mood} moodKey={buddy.moodKey} />
        </View>
        <Celebration burstKey={celebration.key} types={celebration.types} big={celebration.big} />
      </KidScene>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'ltr',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  roundMain: {
    backgroundColor: CALM.primary,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CALM.line,
  },
  pairRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 10,
    direction: 'ltr',
  },
  pairChip: {
    minWidth: 54,
    height: 58,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  pairChipOn: {
    backgroundColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  canvasArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasCard: {
    padding: 10,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 253, 248, 0.96)',
  },
  bottom: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'ltr',
  },
  buddySpot: {
    width: 70,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  friend: {
    alignItems: 'center',
    width: 96,
  },
  friendWord: {
    marginTop: 2,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 16,
    color: CALM.text,
  },
  buddy: {
    position: 'absolute',
    left: 4,
    bottom: 8,
  },
});
