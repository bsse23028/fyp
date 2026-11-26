// PLAY STAGE - stage 2 of a letter: three short rounds that cross-fade one after another,
// with progress dots: drag the letter to its picture -> pop the letter bubbles -> big and small.
// The lesson screen keeps the round number; `round === 3` shows the "all done" state.

import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import CrossFade from '../../../../../shared/components/CrossFade';
import ProgressDots from '../../../../../shared/components/ProgressDots';
import DragMatchRound from './DragMatchRound';
import PopBubblesRound from './PopBubblesRound';
import { otherLetters, shuffle } from '../../../data/alphabetData';
import { useScaleIn } from '../../../../../shared/utils/motion';
import { LessonLetter, useLetterCase } from '../LetterCase';
import TalkingObject from '../../../../../shared/components/TalkingObject';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

export const PLAY_ROUNDS = ['drag', 'pop', 'case'];

const TEMPLATES = {
  drag: 'Drag the letter to its picture.',
  pop: 'Pop every {letter} bubble!',
  case: 'Drag big {letter} to small {lower}.',
  caseLower: 'Drag small {lower} to big {letter}.',
  done: 'You did it! Ready for the Star Check?',
};

// The pop round names the letter as drawn; "Big and small" swaps roles in small-letter mode.
export function playInstruction(round, item, caseMode = 'upper') {
  const lower = caseMode === 'lower';
  let name = PLAY_ROUNDS[round] || 'done';
  if (name === 'case' && lower) name = 'caseLower';
  const template = TEMPLATES[name];
  const letter = name === 'pop' && lower ? item.lower : item.letter;
  return {
    text: template,
    params: { letter, lower: item.lower },
    speakParams: { letter: item.letter, lower: item.letter }, // the voice always says the letter name
    shown: template.replace('{letter}', letter).replace('{lower}', item.lower),
  };
}

function LetterFace({ item, size }) {
  return (
    <View style={[styles.face, CALM_SHADOW.lifted, { width: size, height: size, backgroundColor: item.accent.pale }]}>
      <LessonLetter item={item} style={[styles.faceText, { fontSize: size * 0.56, lineHeight: size * 0.7, color: item.accent.deep }]} />
    </View>
  );
}

// A calm little character (blinking only) that does a small happy hop when the letter lands on it.
function Picture({ example, matched, active }) {
  const { word } = useLetterCase();
  return (
    <View style={styles.picture}>
      <TalkingObject
        emoji={example.emoji}
        image={example.image}
        size={58}
        calm
        active={active}
        mood={matched ? 'happy' : 'idle'}
        moodKey={matched ? 1 : 0}
      />
      <Text style={styles.pictureWord} numberOfLines={1}>
        {word(example.word)}
      </Text>
    </View>
  );
}

function AllDone() {
  const pop = useScaleIn(100);
  return (
    <View style={styles.center}>
      <Animated.View style={[styles.doneCard, CALM_SHADOW.soft, pop]}>
        <Text style={styles.doneEmoji}>🎉</Text>
        <Text style={styles.doneText}>You did it!</Text>
      </Animated.View>
    </View>
  );
}

export default function PlayStage({ round, item, voice, buddy, contentWidth, onRoundDone, active = true }) {
  const { caseMode, show, other } = useLetterCase();
  const name = PLAY_ROUNDS[round] || 'done';
  const instruction = playInstruction(round, item, caseMode);
  const lower = caseMode === 'lower';

  // Shuffled once per letter, so switching the case never resets a round; only the drawing changes.
  const pictureOrder = useMemo(
    () => shuffle([item.examples[0], ...otherLetters(item.letter, 2).map((o) => o.examples[0])]),
    [item.letter]
  );
  const caseOrder = useMemo(() => shuffle([item, otherLetters(item.letter, 1)[0]]), [item.letter]);

  const pictureWidth = Math.min(110, (contentWidth - 24) / 3);
  const pictureTargets = pictureOrder.map((example) => ({
    key: example.word,
    width: pictureWidth,
    content: ({ matched }) => <Picture example={example} matched={matched} active={active} />,
  }));

  // "Big and small": the card shows the chosen case, the targets the other case.
  const caseWidth = Math.min(120, (contentWidth - 12) / 2);
  const caseTargets = caseOrder.map((letter) => ({
    key: letter.letter,
    width: caseWidth,
    content: <LessonLetter item={letter} opposite style={[styles.smallLetter, { color: letter.accent.deep }]} />,
  }));

  const example = item.examples[0];

  return (
    <View style={styles.body}>
      <ProgressDots count={PLAY_ROUNDS.length} current={round} />
      <CrossFade stepKey={name}>
        {name === 'drag' && (
          <DragMatchRound
            targets={pictureTargets}
            correctKey={example.word}
            card={<LetterFace item={item} size={96} />}
            badge={show(item)}
            instruction={instruction}
            successLine={`${show(item)} for ${example.word.toLowerCase()}!`}
            successSpeech={`${item.letter} for ${example.word.toLowerCase()}!`}
            voice={voice}
            buddy={buddy}
            onDone={onRoundDone}
            active={active}
          />
        )}
        {name === 'pop' && (
          <PopBubblesRound item={item} instruction={instruction} voice={voice} buddy={buddy} onDone={onRoundDone} active={active} />
        )}
        {name === 'case' && (
          <DragMatchRound
            targets={caseTargets}
            correctKey={item.letter}
            card={<LetterFace item={item} size={96} />}
            badge={show(item)}
            instruction={instruction}
            successLine={lower ? `Small ${item.lower}, big ${item.letter}.` : `Big ${item.letter}, small ${item.lower}.`}
            successSpeech={`Big ${item.nameSpeech}, small ${item.nameSpeech}.`}
            voice={voice}
            buddy={buddy}
            onDone={onRoundDone}
            active={active}
          />
        )}
        {name === 'done' && <AllDone />}
      </CrossFade>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceText: {
    fontFamily: FONTS.nunitoBlack,
  },
  picture: {
    alignItems: 'center',
  },
  pictureWord: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: CALM.text,
  },
  smallLetter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 54,
    lineHeight: 66,
  },
  doneCard: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 44,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  doneEmoji: {
    fontSize: 60,
    lineHeight: 72,
  },
  doneText: {
    marginTop: 6,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 26,
    color: CALM.primaryDark,
  },
});
