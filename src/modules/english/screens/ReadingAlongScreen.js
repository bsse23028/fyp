// READING ALONG SCREEN - "Listen first, then it is your turn!"
//
// What happens:
//   1. Buddy reads the sentence aloud (the phone's voice) and each word lights
//      up in turn, IN STEP WITH THE VOICE (see "HIGHLIGHT TIMING" below).
//      The speaker button plays it again.
//   2. The child taps the big microphone button ("Tap to speak"). The first
//      time, the phone may ask for the microphone (see shared/utils/permissions.js).
//   3. That opens "Your turn" for the same sentence.
//   Or "Next sentence" skips the child's turn and goes to the next one ("Finish" on the last one).
//
// The progress bars and "Sentence n of m" at the top show which sentence of the session this is.
// Sizes are in ../readingConfig.js.
//
// The sentences come from the topic + level the child picked (kept in Redux, see
// ../store/englishSlice.js). The sentences themselves come from the database.
//
// Route params: { index }  - which sentence (0 = first)
// Props: { navigation, route }

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import * as Speech from 'expo-speech';
import Screen from '../../../shared/components/Screen';
import BackButton from '../../../shared/components/BackButton';
import SpeakButton from '../../../shared/components/SpeakButton';
import Mascot from '../../../shared/components/Mascot';
import Button from '../../../shared/components/Button';
import ReadingWord from '../components/ReadingWord';
import { READING } from '../readingConfig';
import { translate } from '../../../shared/i18n/translate';
import { ensureMicrophone } from '../../../shared/utils/permissions';
import { useLanguage } from '../../../app/context/LanguageContext';
import { selectSentences } from '../store/englishSlice';
import { getSentence } from '../readingData';
import { BUTTON, COLORS, FONTS } from '../../../shared/theme/theme';

// HIGHLIGHT TIMING
// ----------------
// The old code lit one word every 600 ms, no matter how fast the voice was, so the
// highlight was seconds behind the sound. Now the highlight follows the voice:
//   1. iPhone: the voice tells us exactly when each word starts (onBoundary) -> we follow it.
//   2. Android / no word events: we ESTIMATE how long each word takes from its length
//      (long words take longer), start the clock when the voice really starts (onStart),
//      and END it when the voice finishes (onDone).
//   3. The app LEARNS: after every sentence it compares the estimate with the real time
//      and corrects itself, so the next sentence is even closer to the voice.
const SPEECH_RATE = 0.85;      // how fast Buddy talks (1 = normal)
const MS_PER_LETTER = 62;      // first guess: time to say one letter at rate 1
const MS_PER_WORD = 80;        // first guess: small gap at the start of every word
const PAUSE_COMMA = 120;       // extra pause after , ; :
const PAUSE_STOP = 220;        // extra pause after . ! ?
let learnedSpeed = 1;          // 1 = estimate was right; 0.8 = voice is faster than guessed ...

// Time (ms) each word takes, from the length of the word and its punctuation.
function estimateWordTimes(words) {
  return words.map((word, i) => {
    const letters = word.replace(/[.,!?;:\u060C\u061B\u061F\u06D4"'()]/g, '').length;
    let ms = letters * MS_PER_LETTER + MS_PER_WORD;
    if (/[,;:\u060C\u061B]$/.test(word)) ms += PAUSE_COMMA;
    if (/[.!?\u06D4\u061F]$/.test(word) && i < words.length - 1) ms += PAUSE_STOP;
    return ms / SPEECH_RATE;
  });
}

// Heights of the sound-wave bars (decoration, from Figma).
const WAVE_BARS = [3, 6, 14, 22, 30, 26, 18, 24, 16, 8, 4, 10, 6, 3];

export default function ReadingAlongScreen({ navigation, route }) {
  const index = route.params && route.params.index ? route.params.index : 0;
  const { language } = useLanguage();
  const sentences = useSelector(selectSentences); // the sentences of the picked topic + level
  const sentence = getSentence(sentences, index, language); // English or Urdu words
  const { height } = useWindowDimensions();
  const wordSize = height < READING.SMALL_PHONE_HEIGHT ? READING.WORD_SIZE_SMALL : READING.WORD_SIZE; // smaller on small phones
  const isLast = index >= sentences.length - 1;

  // Which word is lit right now (-1 = none).
  const [highlighted, setHighlighted] = useState(-1);
  const [reading, setReading] = useState(false);
  const timers = useRef([]); // every pending timeout, so they can all be cancelled
  const runId = useRef(0);   // changes on every new reading, so an old voice can never move the highlight

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // Buddy reads the sentence: the voice speaks, and the words light up in step with it.
  function startReading() {
    stopReading();
    const id = runId.current; // stopReading() just made a new id
    const words = sentence.words;
    const text = words.join(' ');

    // Where each word begins inside `text` (used when the phone reports word positions).
    const wordStarts = [];
    let at = 0;
    words.forEach((word) => {
      wordStarts.push(at);
      at += word.length + 1;
    });

    const wordTimes = estimateWordTimes(words);
    const estimated = wordTimes.reduce((sum, ms) => sum + ms, 0);
    let startedAt = 0;
    let started = false;
    let followingVoice = false; // true once the phone reports real word positions
    const isCurrent = () => runId.current === id;

    function finish() {
      clearTimers();
      setReading(false);
      setHighlighted(-1);
    }

    // The voice has really begun: start the word clock.
    function begin() {
      if (started || !isCurrent()) return;
      started = true;
      startedAt = Date.now();
      setHighlighted(0);

      let elapsed = 0;
      for (let i = 1; i < words.length; i++) {
        elapsed += wordTimes[i - 1] * learnedSpeed;
        const wait = Math.max(0, elapsed - (Date.now() - startedAt));
        timers.current.push(
          setTimeout(() => {
            if (isCurrent() && !followingVoice) setHighlighted(i);
          }, wait)
        );
      }
      // Safety: if the voice never reports "done", stop a moment after the estimate.
      timers.current.push(setTimeout(() => isCurrent() && finish(), estimated * learnedSpeed + 2500));
    }

    setReading(true);
    Speech.speak(text, {
      language: language === 'ur' ? 'ur-PK' : 'en',
      rate: SPEECH_RATE,
      onStart: begin,
      // iPhone: the voice tells us which letter it is on -> light the matching word.
      onBoundary: (event) => {
        if (!isCurrent() || !event || typeof event.charIndex !== 'number') return;
        begin();
        followingVoice = true;
        let word = 0;
        for (let i = 0; i < wordStarts.length; i++) {
          if (wordStarts[i] <= event.charIndex) word = i;
        }
        setHighlighted(word);
      },
      onDone: () => {
        if (!isCurrent()) return;
        const took = Date.now() - startedAt;
        // Learn: how long did the voice really take compared with our estimate?
        if (started && !followingVoice && took > 300) {
          const ratio = Math.min(2, Math.max(0.5, took / estimated));
          learnedSpeed = learnedSpeed * 0.4 + ratio * 0.6;
        }
        // If the voice ended instantly (e.g. no Urdu voice installed) keep the animation going
        // on its own instead of cutting it off.
        if (!started || took > 300) finish();
      },
      onStopped: () => {},
      onError: () => {
        // No sound possible: still show the words lighting up, at the estimated speed.
        begin();
      },
    });

    // Some phones never send onStart: begin anyway after a moment.
    timers.current.push(setTimeout(begin, 450));
  }

  function stopReading() {
    runId.current += 1; // forget the previous reading
    clearTimers();
    Speech.stop();
    setReading(false);
    setHighlighted(-1);
  }

  // Start reading when the screen opens; stop when it closes.
  useEffect(() => {
    const start = setTimeout(startReading, 500);
    return () => {
      clearTimeout(start);
      runId.current += 1;
      clearTimers();
      Speech.stop();
    };
  }, [index, language]);

  async function handleSpeak() {
    stopReading();
    const allowed = await ensureMicrophone(); // asks / explains if the microphone is off
    if (allowed) navigation.push('ReadingYourTurn', { index });
  }

  // Next sentence: skips the child's turn for this one (the microphone is still the way to say the word).
  function handleNext() {
    stopReading();
    if (isLast) navigation.navigate('ReadingSummary');
    else navigation.push('ReadingAlong', { index: index + 1 });
  }

  return (
    <Screen scroll mode="child" scene="lesson">
      <View style={styles.body}>
        {/* top row: back, title, play again */}
        <View style={styles.topRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.title}>Reading Time</Text>
          <SpeakButton text={sentence.words.join(' ')} onPress={startReading} />
        </View>

        {/* progress bars: one per sentence */}
        <View style={styles.dots}>
          {sentences.map((_, i) => (
            <View key={i} style={[styles.dot, i <= index && styles.dotDone]} />
          ))}
        </View>

        <Text style={styles.count}>{translate('Sentence {n} of {total}', { n: index + 1, total: sentences.length })}</Text>

        {/* reading card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>READ ALOUD:</Text>
          <View style={styles.words}>
            {sentence.words.map((word, i) => (
              <ReadingWord key={i} word={word} lit={i === highlighted} size={wordSize} lineHeight={wordSize * READING.LINE_HEIGHT} />
            ))}
          </View>

          <View style={styles.wave}>
            {WAVE_BARS.map((barHeight, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  { height: barHeight, backgroundColor: reading && i >= 3 && i <= 8 ? COLORS.primary : COLORS.warmBorder },
                ]}
              />
            ))}
          </View>

          <View style={styles.encourage}>
            <Mascot size={52} />
            <Text style={styles.encourageText}>Listen first, then it is your turn!</Text>
          </View>
        </View>

        {/* the microphone, with "Next sentence" beside it */}
        <View style={styles.actions}>
          <View style={styles.micWrap}>
            <Pressable
              onPress={handleSpeak}
              accessibilityRole="button"
              accessibilityLabel="Tap to speak"
              style={({ pressed }) => [styles.mic, pressed && styles.micPressed]}
            >
              <Text style={styles.micIcon}>🎤</Text>
            </Pressable>
            <Text style={styles.micLabel}>Tap to speak</Text>
          </View>
          <Button title={isLast ? 'Finish' : 'Next sentence'} variant="secondary" onPress={handleNext} style={styles.next} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 21,
    color: COLORS.heading,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  dot: {
    flex: 1,
    maxWidth: READING.BAR_WIDTH,
    height: READING.BAR_HEIGHT,
    marginHorizontal: READING.BAR_GAP / 2,
    borderRadius: READING.BAR_HEIGHT / 2,
    backgroundColor: COLORS.warmBorder,
  },
  dotDone: {
    backgroundColor: COLORS.primary,
  },
  count: {
    marginTop: 8,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    marginTop: 12,
    padding: 22,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardLabel: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: COLORS.warmMuted,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  bar: {
    width: 5,
    marginHorizontal: 2.5,
    borderRadius: 3,
  },
  encourage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.sagePale,
  },
  encourageText: {
    flex: 1,
    marginStart: 12,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: COLORS.warmText,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: READING.ACTIONS_GAP,
    marginTop: 14,
  },
  micWrap: {
    alignItems: 'center',
  },
  next: {
    flex: 1,
    height: READING.NEXT_HEIGHT,
  },
  mic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BUTTON.fill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BUTTON.fill,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  micPressed: {
    opacity: 0.85,
  },
  micIcon: {
    fontSize: 38,
  },
  micLabel: {
    marginTop: 8,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 15,
    color: COLORS.warmMuted,
  },
});
