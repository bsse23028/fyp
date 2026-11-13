// LETTER LESSON SCREEN - one letter as ONE swipe pager of 7 pages:
//   Look · Listen (picture 1) · Listen (picture 2) · Say · Play · Star Check · Result
// Forward opens only when the page's small job is done (otherwise a stretch + a buddy hint).
// Back is always open, except in Star Check after the first answer and on the Result page.
// Pages mount when first reached and stay mounted, so a finished page stays finished.
// Stars are saved once through recordLetterResult (nothing in Preview). Params: { letter: 'A' }
// Celebrations (Lottie, or the built-in confetti when the file is missing): a "popper" on Look / Say finished
// and every Play round; "confetti" + "stars" on the Result page.
// The buddy walks in and says "Hi!" when the lesson opens; on Result it walks to the middle, cheers, then waves.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import SwipePager from '../../../shared/components/SwipePager';
import LessonLayout from '../components/LessonLayout';
import LessonProgress from '../components/LessonProgress';
import CaseToggle from '../components/alphabet/CaseToggle';
import { LetterCaseProvider } from '../components/alphabet/LetterCase';
import LookPage from '../components/alphabet/learn/LookPage';
import ListenPage from '../components/alphabet/learn/ListenPage';
import SayPage from '../components/alphabet/learn/SayPage';
import PlayStage, { PLAY_ROUNDS } from '../components/alphabet/play/PlayStage';
import CheckStage from '../components/alphabet/check/CheckStage';
import ResultView from '../components/alphabet/check/ResultView';
import buildQuestions, { starsFor } from '../components/alphabet/check/buildQuestions';
import { getLetter, nextLetter } from '../data/alphabetData';
import { recordLetterResult, selectLetterCase, setLetterCase } from '../store/alphabetSlice';
import { useChild } from '../../../app/store/useChild';
import { cheer, speak, speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { playSound } from '../../../shared/utils/sounds';
import { CALM, SPACING } from '../../../shared/theme/theme';

const PAGES = [
  { id: 'look', icon: 'eye', hint: 'Tap the letter!', blocked: 'Tap the letter!' },
  { id: 'listen1', icon: 'ear', hint: null, blocked: 'Tap the picture!' },
  { id: 'listen2', icon: 'ear', hint: null, blocked: 'Tap the picture!' },
  { id: 'say', icon: 'mic', hint: 'Say it with me!', blocked: 'Tap the big button!' },
  { id: 'play', icon: 'game-controller', hint: null, blocked: "Let's finish the game!" },
  { id: 'check', icon: 'star', hint: null, blocked: 'Pick one!' },
  { id: 'result', icon: 'star', hint: null, blocked: null },
];
const SAY = 3;
const PLAY = 4;
const CHECK = 5;
const RESULT = 6;

const FIRST_HINT_DELAY = 1200; // ms after the buddy's "Hi!" before the first hint
const FIRST_DEMO_DELAY = 4200; // ms before the Look demo on the first page (after the walk-in, "Hi!" and the hint)
const RESULT_WAVE_DELAY = 1600; // ms after the Result cheer before the buddy waves

const STAGES = [
  { icon: 'eye', pages: [0] },
  { icon: 'ear', pages: [1, 2] },
  { icon: 'mic', pages: [SAY] },
  { icon: 'game-controller', pages: [PLAY] },
  { icon: 'star', pages: [CHECK] },
];

function NotYet({ icon }) {
  return (
    <View style={styles.notYet}>
      <Ionicons name={icon} size={96} color={CALM.line} />
    </View>
  );
}

export default function LetterLessonScreen({ navigation, route }) {
  const item = getLetter(route.params ? route.params.letter : 'A');
  const following = nextLetter(item.letter);
  const dispatch = useDispatch();
  const { activeChild } = useChild();
  const caseMode = useSelector(selectLetterCase);
  const { width, height } = useWindowDimensions();
  const contentWidth = width - SPACING.screen * 2;
  const cardSize = Math.min(260, contentWidth * 0.72, height * 0.3);
  const pager = useRef(null);
  const buddyRef = useRef(null);
  const pageRef = useRef(0);

  const [page, setPage] = useState(0);
  const [visited, setVisited] = useState([0]);
  const [done, setDone] = useState(PAGES.map(() => false));
  const [playRound, setPlayRound] = useState(0);
  const questions = useMemo(() => buildQuestions(item), [item.letter]);
  const [checkIndex, setCheckIndex] = useState(0);
  const [checkStarted, setCheckStarted] = useState(false);
  const [stars, setStars] = useState(0);
  const firstTry = useRef(0);
  const [buddy, setBuddy] = useState({ mood: 'idle', moodKey: 0, message: null, messageKey: 0 });
  const [celebration, setCelebration] = useState({ key: 0, types: 'popper', big: false });
  const replay = useRef(null);

  const voice = useMemo(
    () => ({
      ui(text, params, options) {
        replay.current = () => speakUi(text, params);
        speakUi(text, params, options);
      },
      remember(text, options) {
        replay.current = () => speak(text, options && options.rate ? { rate: options.rate } : undefined);
      },
      teach(text, options) {
        replay.current = () => speak(text, options && options.rate ? { rate: options.rate } : undefined);
        speak(text, options);
      },
    }),
    []
  );

  const buddyMood = useCallback((mood) => setBuddy((b) => ({ ...b, mood, moodKey: b.moodKey + 1 })), []);
  const buddySays = useCallback(
    (message, mood) => setBuddy((b) => ({ ...b, message, messageKey: b.messageKey + 1, mood, moodKey: b.moodKey + 1 })),
    []
  );
  // A small win = 'popper'; the Result page = ['confetti', 'stars'] (big).
  const party = useCallback((big = false, count) => {
    setCelebration((c) => ({ key: c.key + 1, types: big ? ['confetti', 'stars'] : 'popper', big, count }));
  }, []);
  const buddyApi = useMemo(() => ({ mood: buddyMood, say: buddySays, party: () => party() }), []);

  // The buddy says the page's short hint (spoken + bubble); 🔊 repeats it.
  function hint(text, mood = 'hop') {
    if (!text) return;
    replay.current = () => speakUi(text);
    buddySays(text, mood);
  }

  // A success moment: a soft sound + a happy cheer.
  const celebrate = useCallback((sound = 'sparkle') => {
    playSound(sound);
    cheer();
  }, []);

  const markDone = useCallback((index) => {
    setDone((list) => (list[index] ? list : list.map((value, i) => (i === index ? true : value))));
  }, []);

  // The first hint waits until the buddy has walked in and said "Hi!".
  const onBuddyEntered = () => {
    setTimeout(() => {
      if (pageRef.current === 0) hint(PAGES[0].hint);
    }, FIRST_HINT_DELAY);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return () => {
      unsubscribe();
      stopSpeaking();
    };
  }, [navigation]);

  useEffect(() => {
    if (playRound !== PLAY_ROUNDS.length) return;
    markDone(PLAY);
    playSound('sparkle');
    buddySays('You did it!', 'cheer');
  }, [playRound]);

  useEffect(() => {
    if (checkIndex !== questions.length) return;
    const earned = starsFor(firstTry.current);
    setStars(earned);
    markDone(CHECK);
    dispatch(recordLetterResult(activeChild ? activeChild.id : null, item.letter, earned));
    playSound('cheerBell');
    buddyMood('cheer');
  }, [checkIndex]);

  const onRoundDone = useCallback(() => setPlayRound((round) => round + 1), []);
  const onSaid = useCallback(() => {
    markDone(SAY);
    celebrate('pop');
    party();
    buddyMood('cheer');
  }, []);
  const onAnswered = useCallback((correct) => {
    if (correct) firstTry.current += 1;
    setCheckIndex((index) => index + 1);
  }, []);

  function handleIndexChange(next) {
    stopSpeaking();
    pageRef.current = next;
    setPage(next);
    setVisited((list) => (list.includes(next) ? list : [...list, next]));
    if (next === RESULT) {
      const arrive = () => {
        playSound('tada');
        party(true);
        buddySays('Great job!', 'cheer');
        setTimeout(() => buddyRef.current && buddyRef.current.wave(), RESULT_WAVE_DELAY);
      };
      if (buddyRef.current) buddyRef.current.walkToCenter(contentWidth, arrive);
      else arrive();
    }
    else hint(PAGES[next].hint);
  }

  const canGoNext = (index) => index < RESULT && done[index];
  const canGoBack = (index) => index > 0 && index !== RESULT && !(index === CHECK && checkStarted);
  const onBlocked = (direction) => {
    if (direction > 0) hint(PAGES[page].blocked, 'think');
  };

  const playAgain = () => navigation.replace('LetterLesson', { letter: item.letter });
  const backToLetters = () => navigation.goBack();
  const goToNextLetter = () => navigation.replace('LetterLesson', { letter: following.letter });
  const finishListen = (index) => {
    markDone(index);
    playSound('sparkle');
    buddyMood('cheer');
  };
  const finishLook = () => {
    markDone(0);
    celebrate();
    party(false, 10);
    buddyMood('happy');
  };

  function renderPage(index) {
    if (!visited.includes(index)) return <NotYet icon={PAGES[index].icon} />;
    let content = null;
    const active = page === index;
    if (index === 0) {
      content = (
        <LookPage item={item} active={active} cardSize={cardSize} onDone={finishLook} onCheer={() => {}} demoDelay={FIRST_DEMO_DELAY} />
      );
    }
    if (index === 1 || index === 2) {
      content = (
        <ListenPage
          item={item}
          exampleIndex={index - 1}
          active={active}
          voice={voice}
          contentWidth={contentWidth}
          onDone={() => finishListen(index)}
          onCheer={() => {}}
          onHint={() => hint('Tap the picture!')}
        />
      );
    }
    if (index === SAY) content = <SayPage item={item} active={active} voice={voice} cardSize={cardSize} onDone={onSaid} />;
    if (index === PLAY) {
      content = (
        <PlayStage
          round={playRound}
          item={item}
          voice={voice}
          buddy={buddyApi}
          contentWidth={contentWidth}
          onRoundDone={onRoundDone}
          active={active}
        />
      );
    }
    if (index === CHECK) {
      content = (
        <CheckStage
          questions={questions}
          index={checkIndex}
          item={item}
          voice={voice}
          buddy={buddyApi}
          contentWidth={contentWidth}
          onChosen={() => setCheckStarted(true)}
          onAnswered={onAnswered}
          active={active}
        />
      );
    }
    if (index === RESULT) {
      content = (
        <ResultView
          stars={stars}
          hasNext={Boolean(following)}
          onNext={goToNextLetter}
          onPlayAgain={playAgain}
          onBackToLetters={backToLetters}
        />
      );
    }
    return <View style={styles.page}>{content}</View>;
  }

  const forwardOpen = canGoNext(page);

  return (
    <LetterCaseProvider value={caseMode}>
      <LessonLayout
        progress={<LessonProgress stages={STAGES} page={page} done={done} />}
        right={<CaseToggle item={item} caseMode={caseMode} onChange={(value) => dispatch(setLetterCase(value))} />}
        onBack={() => navigation.goBack()}
        onSound={page < RESULT ? () => replay.current && replay.current() : null}
        back={canGoBack(page) ? { onPress: () => pager.current && pager.current.back() } : null}
        next={page < RESULT ? { onPress: () => pager.current && pager.current.next(), locked: !forwardOpen, hint: forwardOpen, hintKey: page } : null}
        buddy={buddy}
        buddyRef={buddyRef}
        onBuddyEntered={onBuddyEntered}
        celebration={celebration}
      >
        <SwipePager
          ref={pager}
          count={PAGES.length}
          index={page}
          onIndexChange={handleIndexChange}
          onSlide={() => playSound('whoosh')}
          canGoNext={canGoNext}
          canGoBack={canGoBack}
          onBlocked={onBlocked}
          swipeZone={(index) => (index === PLAY ? 'bottom' : 'full')}
          renderPage={renderPage}
        />
      </LessonLayout>
    </LetterCaseProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
  },
  notYet: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
