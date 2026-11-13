// LETTER LESSON SCREEN - one letter, three stages on ONE screen: Learn -> Play -> Star Check.
// Stages cross-fade in place (no navigation, no skipping); the buddy hops at each change.
// Star Check stars (first-try answers) are saved once through recordLetterResult (nothing in Preview).
// Back leaves to the letter list with no penalty. Params: { letter: 'A' }

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import CrossFade from '../../../shared/components/CrossFade';
import StageProgress from '../../../shared/components/StageProgress';
import LessonLayout from '../components/LessonLayout';
import LearnStage, { LEARN_INSTRUCTIONS, LEARN_STEPS } from '../components/alphabet/learn/LearnStage';
import CheckStage from '../components/alphabet/check/CheckStage';
import buildQuestions, { starsFor } from '../components/alphabet/check/buildQuestions';
import PlayStage, { PLAY_ROUNDS, playInstruction } from '../components/alphabet/play/PlayStage';
import { getLetter, nextLetter } from '../data/alphabetData';
import { recordLetterResult } from '../store/alphabetSlice';
import { useChild } from '../../../app/store/useChild';
import { speak, speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { SPACING } from '../../../shared/theme/theme';

const STAGES = [
  { label: 'Learn', icon: '👀' },
  { label: 'Play', icon: '🧩' },
  { label: 'Star Check', icon: '⭐' },
];

export default function LetterLessonScreen({ navigation, route }) {
  const item = getLetter(route.params ? route.params.letter : 'A');
  const following = nextLetter(item.letter);
  const dispatch = useDispatch();
  const { activeChild } = useChild();
  const { width, height } = useWindowDimensions();
  const contentWidth = width - SPACING.screen * 2;
  const cardSize = Math.min(260, contentWidth * 0.72, height * 0.3);

  const [stage, setStage] = useState(0);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [playRound, setPlayRound] = useState(0);
  const questions = useMemo(() => buildQuestions(item), [item.letter]);
  const [checkIndex, setCheckIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const firstTry = useRef(0);
  const [buddy, setBuddy] = useState({ mood: 'idle', moodKey: 0, message: null, messageKey: 0 });
  const replay = useRef(null);

  const voice = useMemo(
    () => ({
      ui(text, params, options) {
        replay.current = () => speakUi(text, params);
        speakUi(text, params, options);
      },
      teach(text, options) {
        replay.current = () => speak(text, options && options.rate ? { rate: options.rate } : undefined);
        speak(text, options);
      },
    }),
    []
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return () => {
      unsubscribe();
      stopSpeaking();
    };
  }, [navigation]);

  const buddyMood = useCallback((mood) => setBuddy((b) => ({ ...b, mood, moodKey: b.moodKey + 1 })), []);
  const buddySays = useCallback(
    (message, mood) => setBuddy((b) => ({ ...b, message, messageKey: b.messageKey + 1, mood, moodKey: b.moodKey + 1 })),
    []
  );

  const markReady = useCallback(() => setReady(true), []);
  const buddyApi = useMemo(() => ({ mood: buddyMood, say: (text, mood) => buddySays(text, mood) }), []);
  const onRoundDone = useCallback(() => setPlayRound((round) => round + 1), []);

  useEffect(() => {
    if (playRound === PLAY_ROUNDS.length) buddySays('You did it!', 'cheer');
  }, [playRound]);
  const onSaid = useCallback(() => {
    setReady(true);
    buddySays("Let's play!", 'cheer');
  }, []);

  const onAnswered = useCallback(
    (correct) => {
      if (correct) firstTry.current += 1;
      setCheckIndex((index) => index + 1);
    },
    []
  );

  useEffect(() => {
    if (checkIndex !== questions.length) return;
    const earned = starsFor(firstTry.current);
    setStars(earned);
    dispatch(recordLetterResult(activeChild ? activeChild.id : null, item.letter, earned));
    buddySays('Great job!', 'dance');
  }, [checkIndex]);

  const playAgain = () => navigation.replace('LetterLesson', { letter: item.letter });
  const backToLetters = () => navigation.goBack();
  const goToNextLetter = () => navigation.replace('LetterLesson', { letter: following.letter });

  function handleNext() {
    if (stage === 0 && step < LEARN_STEPS.length - 1) {
      setReady(false);
      setStep(step + 1);
      return;
    }
    if (stage < STAGES.length - 1) {
      setStage(stage + 1);
      return;
    }
    navigation.goBack();
  }

  const lastLearnStep = stage === 0 && step === LEARN_STEPS.length - 1;
  const playDone = playRound >= PLAY_ROUNDS.length;
  const checkDone = checkIndex >= questions.length;
  let instruction;
  let next;
  if (stage === 0) {
    instruction = LEARN_INSTRUCTIONS[LEARN_STEPS[step]](item);
    next = { title: lastLearnStep && ready ? "Let's play!" : 'Next', disabled: !ready, pulsing: lastLearnStep && ready, onPress: handleNext };
  } else if (stage === 1) {
    instruction = playInstruction(playRound, item).shown;
    next = { title: 'Star Check', disabled: !playDone, pulsing: playDone, onPress: handleNext };
  } else if (!checkDone) {
    instruction = questions[checkIndex].prompt.shown;
    next = { title: 'Next', disabled: true };
  } else {
    instruction = 'Great job!';
    next = following
      ? { title: 'Next letter', onPress: goToNextLetter, pulsing: stars > 1 }
      : { title: 'Back to letters', onPress: backToLetters, pulsing: stars > 1 };
  }

  return (
    <LessonLayout
      progress={<StageProgress steps={STAGES} current={stage} />}
      instruction={instruction}
      onBack={() => navigation.goBack()}
      onSound={() => replay.current && replay.current()}
      next={next}
      buddy={buddy}
    >
      <CrossFade stepKey={stage} onShown={() => buddyMood('hop')}>
        {stage === 1 && (
          <PlayStage
            round={playRound}
            item={item}
            voice={voice}
            buddy={buddyApi}
            contentWidth={contentWidth}
            onRoundDone={onRoundDone}
          />
        )}
        {stage === 0 ? (
          <LearnStage
            step={step}
            item={item}
            voice={voice}
            cardSize={cardSize}
            contentWidth={contentWidth}
            onReady={markReady}
            onHappy={() => buddyMood('happy')}
            onSaid={onSaid}
          />
        ) : stage === 2 ? (
          <CheckStage
            questions={questions}
            index={checkIndex}
            stars={stars}
            item={item}
            voice={voice}
            buddy={buddyApi}
            contentWidth={contentWidth}
            onAnswered={onAnswered}
            onPlayAgain={playAgain}
            onBackToLetters={backToLetters}
          />
        ) : null}
      </CrossFade>
    </LessonLayout>
  );
}
