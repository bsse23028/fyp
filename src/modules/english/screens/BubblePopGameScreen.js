// BUBBLE POP GAME - soap bubbles with letters float up slowly; the buddy says "Find A!" and the child
// pops every bubble with that letter. A right bubble pops (plop + sparkles + the letter's sound); a wrong
// one only wobbles. Bubbles that float away come back from the bottom, so there is never a rush.
// After a while without a find, the right bubbles glow. ROUNDS letters per game, a celebration after
// each, then icon buttons (play again / back). Letters follow the A / a choice of the lessons.
// Nothing is saved. Every number is in components/games/gamesConfig.js (BUBBLE_GAME).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import Celebration from '../../../shared/components/Celebration';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { BackCircle } from '../components/SectionHeader';
import RisingBubble from '../components/games/RisingBubble';
import LetterArt from '../components/spelling/LetterArt';
import { BUBBLE_GAME as G } from '../components/games/gamesConfig';
import { ALPHABET, pickLetters, shuffle } from '../data/alphabetData';
import { selectLetterCase } from '../store/alphabetSlice';
import { useScaleIn } from '../../../shared/utils/motion';
import { cheer, stopSpeaking } from '../../../shared/utils/speech';
import { playSound } from '../../../shared/utils/sounds';
import { playLetterSound, stopLetterSound } from '../../../shared/utils/letterAudio';
import { CALM, CALM_SHADOW, SPACING } from '../../../shared/theme/theme';

let nextId = 1;
const random = (min, max) => min + Math.random() * (max - min);

function RoundButton({ icon, onPress, label, size = 64, main = false }) {
  const appear = useScaleIn(0);
  return (
    <Animated.View style={appear}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        style={[styles.round, main && styles.roundMain, CALM_SHADOW.soft, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Ionicons name={icon} size={size * 0.48} color={main ? '#FFFFFF' : CALM.primaryDark} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function BubblePopGameScreen({ navigation }) {
  const focused = useIsFocused();
  const caseMode = useSelector(selectLetterCase);
  const show = (item) => (caseMode === 'lower' ? item.lower : item.letter);

  const [game, setGame] = useState(0); // changes = a new game
  const targets = useMemo(() => shuffle(ALPHABET).slice(0, G.ROUNDS), [game]);
  const [round, setRound] = useState(0);
  const [pops, setPops] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [area, setArea] = useState(null);
  const [glowing, setGlowing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [celebration, setCelebration] = useState({ key: 0, types: 'popper', big: false });
  const [buddy, setBuddy] = useState({ mood: 'idle', moodKey: 0, message: null, messageKey: 0 });
  const timers = useRef([]);
  const hintTimer = useRef(null);
  const busy = useRef(false);

  const target = targets[round];
  const others = useMemo(() => (target ? pickLetters(target.letter, 5) : []), [target]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const buddySays = (message, mood = 'hop') => setBuddy((b) => ({ message, messageKey: b.messageKey + 1, mood, moodKey: b.moodKey + 1 }));
  const buddyMood = (mood) => setBuddy((b) => ({ ...b, mood, moodKey: b.moodKey + 1 }));

  function makeBubble(list, first = false) {
    const targetsNow = list.filter((b) => b.isTarget && !b.popping).length;
    const isTarget = targetsNow < 2 || Math.random() < G.RIGHT_SHARE;
    const letter = isTarget ? target : others[Math.floor(Math.random() * others.length)];
    const size = random(G.SIZE_MIN, G.SIZE_MAX);
    return {
      id: nextId++,
      item: letter,
      char: show(letter),
      isTarget,
      size,
      x: random(0, Math.max(1, area.width - size)),
      duration: random(G.RISE_MIN_MS, G.RISE_MAX_MS),
      delay: first ? random(0, G.RISE_MIN_MS * 0.8) : random(0, 900),
      restAt: random(0.15, 0.85),
      popping: false,
      wobbleKey: 0,
    };
  }

  function sayTarget() {
    buddySays('Find {letter}!'.replace('{letter}', target.letter));
    later(() => playLetterSound(target.letter), 1300);
  }

  function restartHint() {
    clearTimeout(hintTimer.current);
    setGlowing(false);
    hintTimer.current = setTimeout(() => setGlowing(true), G.HINT_AFTER_MS);
  }

  // a new round: a fresh sky of bubbles and the buddy names the letter
  useEffect(() => {
    if (!area || !target || finished) return;
    busy.current = false;
    setPops(0);
    let list = [];
    for (let i = 0; i < G.BUBBLES; i++) list = [...list, makeBubble(list, true)];
    setBubbles(list);
    later(sayTarget, 500);
    restartHint();
  }, [area, round, game]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      stopSpeaking();
      stopLetterSound();
    });
    return () => {
      unsubscribe();
      timers.current.forEach(clearTimeout);
      clearTimeout(hintTimer.current);
      stopSpeaking();
      stopLetterSound();
    };
  }, [navigation]);

  // a bubble floated away or popped: put a new one in its place
  function replace(old) {
    setBubbles((list) => {
      const rest = list.filter((b) => b.id !== old.id);
      return busy.current ? rest : [...rest, makeBubble(rest)];
    });
  }

  function tap(bubble) {
    if (busy.current || bubble.popping) return;
    if (!bubble.isTarget) {
      setBubbles((list) => list.map((b) => (b.id === bubble.id ? { ...b, wobbleKey: b.wobbleKey + 1 } : b)));
      return;
    }
    playSound('bubble');
    later(() => playLetterSound(target.letter), 120);
    setBubbles((list) => list.map((b) => (b.id === bubble.id ? { ...b, popping: true } : b)));
    restartHint();
    const count = pops + 1;
    setPops(count);
    if (count < G.POPS_PER_ROUND) return;

    // round finished
    busy.current = true;
    clearTimeout(hintTimer.current);
    setGlowing(false);
    later(() => {
      setCelebration((c) => ({ key: c.key + 1, types: 'popper', big: false }));
      playSound('pop');
      cheer();
      buddyMood('cheer');
    }, 600);
    later(() => {
      if (round + 1 < targets.length) setRound(round + 1);
      else {
        setFinished(true);
        setBubbles([]);
        playSound('tada');
        setCelebration((c) => ({ key: c.key + 1, types: ['confetti', 'stars'], big: true }));
        buddySays('Great job!', 'dance');
      }
    }, G.ROUND_PAUSE_MS);
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFinished(false);
    setRound(0);
    setGame((g) => g + 1);
  }

  return (
    <Screen mode="child" scene="day">
      <View style={styles.body}>
        <View style={styles.header}>
          <BackCircle onPress={() => navigation.goBack()} />
          {target && !finished ? (
            <AnimatedPressable onPress={sayTarget} accessibilityLabel={`Find ${target.letter}`} style={[styles.targetCard, CALM_SHADOW.lifted]}>
              <LetterArt char={show(target)} scale={0.17} />
              <Ionicons name="volume-high" size={22} color={CALM.primaryDark} style={styles.targetIcon} />
            </AnimatedPressable>
          ) : (
            <View />
          )}
          <View style={styles.count}>
            {Array.from({ length: G.POPS_PER_ROUND }).map((_, i) => (
              <View key={i} style={[styles.countDot, i < pops && styles.countDotOn]} />
            ))}
          </View>
        </View>

        <View style={styles.sky} onLayout={(e) => !area && setArea(e.nativeEvent.layout)}>
          {area &&
            bubbles.map((bubble) => (
              <RisingBubble
                key={bubble.id}
                bubble={bubble}
                areaHeight={area.height}
                active={focused}
                glowing={glowing && bubble.isTarget}
                onTap={tap}
                onGone={replace}
                onPopped={replace}
              />
            ))}
          {finished ? (
            <View style={styles.finish}>
              <RoundButton icon="refresh" label="Play again" onPress={again} size={76} main />
              <RoundButton icon="arrow-back" label="Back" onPress={() => navigation.goBack()} />
            </View>
          ) : null}
        </View>

        <BuddyCharacter
          size={80}
          style={styles.buddy}
          enterFromLeft
          mood={buddy.mood}
          moodKey={buddy.moodKey}
          message={buddy.message}
          messageKey={buddy.messageKey}
        />
      </View>
      <Celebration burstKey={celebration.key} types={celebration.types} big={celebration.big} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'ltr',
    zIndex: 5,
  },
  targetCard: {
    minWidth: 96,
    height: 82,
    paddingHorizontal: 16,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  targetIcon: {
    marginStart: 2,
  },
  count: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  countDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CALM.line,
  },
  countDotOn: {
    backgroundColor: '#7FC6E8',
  },
  sky: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: -SPACING.screen / 2,
    overflow: 'hidden',
  },
  finish: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  roundMain: {
    backgroundColor: CALM.primary,
  },
  buddy: {
    position: 'absolute',
    left: -6,
    bottom: 0,
  },
});
