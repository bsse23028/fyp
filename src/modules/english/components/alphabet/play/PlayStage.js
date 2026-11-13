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
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

export const PLAY_ROUNDS = ['drag', 'pop', 'case'];

const TEMPLATES = {
  drag: 'Drag the letter to its picture.',
  pop: 'Pop every {letter} bubble!',
  case: 'Drag big {letter} to small {lower}.',
  done: 'You did it! Ready for the Star Check?',
};

export function playInstruction(round, item) {
  const template = TEMPLATES[PLAY_ROUNDS[round] || 'done'];
  return {
    text: template,
    params: { letter: item.letter, lower: item.lower },
    shown: template.replace('{letter}', item.letter).replace('{lower}', item.lower),
  };
}

function LetterFace({ item, char, size }) {
  return (
    <View style={[styles.face, CALM_SHADOW.lifted, { width: size, height: size, backgroundColor: item.accent.pale }]}>
      <Text style={[styles.faceText, { fontSize: size * 0.5, color: item.accent.deep }]}>{char}</Text>
    </View>
  );
}

function Picture({ example }) {
  return (
    <View style={styles.picture}>
      <Text style={styles.pictureEmoji}>{example.emoji}</Text>
      <Text style={styles.pictureWord} numberOfLines={1}>
        {example.word}
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

export default function PlayStage({ round, item, voice, buddy, contentWidth, onRoundDone }) {
  const name = PLAY_ROUNDS[round] || 'done';
  const instruction = playInstruction(round, item);

  const pictureTargets = useMemo(() => {
    const correct = item.examples[0];
    const others = otherLetters(item.letter, 2).map((other) => other.examples[0]);
    const width = Math.min(110, (contentWidth - 24) / 3);
    return shuffle([correct, ...others]).map((example) => ({
      key: example.word,
      width,
      content: <Picture example={example} />,
    }));
  }, [item.letter]);

  const caseTargets = useMemo(() => {
    const other = otherLetters(item.letter, 1)[0];
    const width = Math.min(120, (contentWidth - 12) / 2);
    return shuffle([item, other]).map((letter) => ({
      key: letter.lower,
      width,
      content: <Text style={[styles.smallLetter, { color: letter.accent.deep }]}>{letter.lower}</Text>,
    }));
  }, [item.letter]);

  const example = item.examples[0];

  return (
    <View style={styles.body}>
      <ProgressDots count={PLAY_ROUNDS.length} current={round} />
      <CrossFade stepKey={name}>
        {name === 'drag' && (
          <DragMatchRound
            targets={pictureTargets}
            correctKey={example.word}
            card={<LetterFace item={item} char={`${item.letter}${item.lower}`} size={96} />}
            badge={item.letter}
            instruction={instruction}
            successLine={`${item.letter} for ${example.word.toLowerCase()}!`}
            voice={voice}
            buddy={buddy}
            onDone={onRoundDone}
          />
        )}
        {name === 'pop' && <PopBubblesRound item={item} instruction={instruction} voice={voice} buddy={buddy} onDone={onRoundDone} />}
        {name === 'case' && (
          <DragMatchRound
            targets={caseTargets}
            correctKey={item.lower}
            card={<LetterFace item={item} char={item.letter} size={96} />}
            badge={item.letter}
            instruction={instruction}
            successLine={`Big ${item.letter}, small ${item.lower}.`}
            successSpeech={`Big ${item.nameSpeech}, small ${item.nameSpeech}.`}
            voice={voice}
            buddy={buddy}
            onDone={onRoundDone}
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
  pictureEmoji: {
    fontSize: 44,
    lineHeight: 54,
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
