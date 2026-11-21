// MATCH PAIRS GAME - a memory game with capital and small letters (A goes with a).
//   The cards first show their faces for a moment (PEEK_MS), then turn over. The child turns two cards:
//   a pair = both bounce + sparkles + chime + the letter's sound and they stay open; not a pair = they turn
//   back softly after a moment (no "wrong" sound). After a few misses in a row one pair glows as help.
//   All pairs found = a big celebration and icon buttons (play again / back). Nothing is saved.
// Every number is in components/games/gamesConfig.js (MATCH_GAME).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import Celebration from '../../../shared/components/Celebration';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { BackCircle } from '../components/SectionHeader';
import MemoryCard from '../components/games/MemoryCard';
import { MATCH_GAME as G } from '../components/games/gamesConfig';
import { ALPHABET, shuffle } from '../data/alphabetData';
import { useScaleIn } from '../../../shared/utils/motion';
import { cheer, stopSpeaking } from '../../../shared/utils/speech';
import { playSound } from '../../../shared/utils/sounds';
import { playLetterSound, stopLetterSound } from '../../../shared/utils/letterAudio';
import { CALM, CALM_SHADOW } from '../../../shared/theme/theme';

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

export default function MatchPairsGameScreen({ navigation }) {
  const focused = useIsFocused();
  const [game, setGame] = useState(0);
  const cards = useMemo(() => {
    const letters = shuffle(ALPHABET).slice(0, G.PAIRS);
    return shuffle(
      letters.flatMap((item, i) => [
        { id: `${item.letter}-big`, char: item.letter, key: item.letter, back: G.BACK_COLORS[i % G.BACK_COLORS.length] },
        { id: `${item.letter}-small`, char: item.lower, key: item.letter, back: G.BACK_COLORS[(i + 2) % G.BACK_COLORS.length] },
      ])
    );
  }, [game]);

  const [peek, setPeek] = useState(true);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [helpKey, setHelpKey] = useState(null);
  const [finished, setFinished] = useState(false);
  const [area, setArea] = useState(null);
  const [celebration, setCelebration] = useState({ key: 0, types: 'popper', big: false });
  const [buddy, setBuddy] = useState({ mood: 'idle', moodKey: 0, message: null, messageKey: 0 });
  const misses = useRef(0);
  const locked = useRef(false);
  const timers = useRef([]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const buddySays = (message, mood = 'hop') => setBuddy((b) => ({ message, messageKey: b.messageKey + 1, mood, moodKey: b.moodKey + 1 }));
  const buddyMood = (mood) => setBuddy((b) => ({ ...b, mood, moodKey: b.moodKey + 1 }));

  // a new game: peek at the faces, then turn them over
  useEffect(() => {
    setPeek(true);
    setOpen([]);
    setMatched([]);
    setHelpKey(null);
    setFinished(false);
    misses.current = 0;
    locked.current = false;
    later(() => buddySays('Find the pairs!'), 600);
    later(() => setPeek(false), G.PEEK_MS);
  }, [game]);

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

  function tap(card) {
    if (peek || finished || locked.current || open.includes(card.id) || matched.includes(card.key)) return;
    playSound('tick');
    const nowOpen = [...open, card.id];
    setOpen(nowOpen);
    if (nowOpen.length < 2) return;

    const [a, b] = nowOpen.map((id) => cards.find((c) => c.id === id));
    locked.current = true;
    if (a.key === b.key) {
      later(() => {
        playSound('chime');
        playLetterSound(a.key);
        const done = [...matched, a.key];
        setMatched(done);
        setOpen([]);
        setHelpKey(null);
        misses.current = 0;
        locked.current = false;
        buddyMood('happy');
        if (done.length === G.PAIRS) {
          later(() => {
            setFinished(true);
            playSound('tada');
            setCelebration((c) => ({ key: c.key + 1, types: ['confetti', 'stars'], big: true }));
            cheer();
            buddyMood('dance');
          }, 900);
        }
      }, 350);
    } else {
      misses.current += 1;
      later(() => {
        setOpen([]);
        locked.current = false;
        if (misses.current >= G.HELP_AFTER_MISSES) {
          const firstOpen = cards.find((c) => !matched.includes(c.key));
          if (firstOpen) setHelpKey(firstOpen.key);
          buddySays("Let's look again", 'think');
        }
      }, G.MISS_SHOW_MS);
    }
  }

  function again() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGame((g) => g + 1);
  }

  // card size: 2 columns, as big as the free space allows
  let cardWidth = 0;
  let cardHeight = 0;
  if (area) {
    const columns = 2;
    const rows = Math.ceil(cards.length / columns);
    cardWidth = Math.min(170, (area.width - G.CARD_GAP * (columns - 1)) / columns);
    cardHeight = Math.min(cardWidth * 0.9, (area.height - G.CARD_GAP * (rows - 1)) / rows);
  }

  return (
    <Screen mode="child" scene="day">
      <View style={styles.body}>
        <View style={styles.header}>
          <BackCircle onPress={() => navigation.goBack()} />
          <View style={styles.count}>
            {Array.from({ length: G.PAIRS }).map((_, i) => (
              <View key={i} style={[styles.countDot, i < matched.length && styles.countDotOn]} />
            ))}
          </View>
        </View>

        <View style={styles.board} onLayout={(e) => !area && setArea(e.nativeEvent.layout)}>
          {area && !finished ? (
            <View style={[styles.grid, { gap: G.CARD_GAP, width: cardWidth * 2 + G.CARD_GAP }]}>
              {cards.map((card) => (
                <MemoryCard
                  key={`${game}-${card.id}`}
                  card={card}
                  width={cardWidth}
                  height={cardHeight}
                  faceUp={peek || open.includes(card.id) || matched.includes(card.key)}
                  matched={matched.includes(card.key)}
                  glowing={helpKey === card.key}
                  active={focused}
                  backColor={card.back}
                  onPress={tap}
                />
              ))}
            </View>
          ) : null}
          {finished ? (
            <View style={styles.finish}>
              <RoundButton icon="refresh" label="Play again" onPress={again} size={76} main />
              <RoundButton icon="arrow-back" label="Back" onPress={() => navigation.goBack()} />
            </View>
          ) : null}
        </View>

        <View style={styles.buddyRoom} />
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
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: CALM.line,
  },
  countDotOn: {
    backgroundColor: '#8A33CF',
  },
  board: {
    flex: 1,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    direction: 'ltr',
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
  buddyRoom: {
    height: 90,
  },
  buddy: {
    position: 'absolute',
    left: -6,
    bottom: 0,
  },
});
