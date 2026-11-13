// QUESTION VIEW - one Star Check question: what to look at (a letter, a picture or a 🔊), then
// 3 big options. No hints. Right = a pop + a happy cheer, a glow and a star. Miss = the choice fades, the right one
// glows and the buddy says "Good try! It was this one." Then it moves on by itself.

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import SoundButton from '../../../../../shared/components/SoundButton';
import AnswerOption from './AnswerOption';
import { LessonLetter, useLetterCase } from '../LetterCase';
import TalkingObject from '../../../../../shared/components/TalkingObject';
import { cheer } from '../../../../../shared/utils/speech';
import { playSound } from '../../../../../shared/utils/sounds';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

const AFTER_RIGHT_MS = 1500;
const AFTER_MISS_MS = 2600;

export default function QuestionView({ question, item, voice, buddy, contentWidth, onChosen, onAnswered, active = true }) {
  const [chosen, setChosen] = useState(null);
  const timer = useRef(null);
  const optionWidth = Math.min(112, (contentWidth - 24) / 3);
  const { caseMode } = useLetterCase();

  useEffect(() => {
    const shownPrompt = question.prompt(caseMode);
    const { text } = shownPrompt;
    const params = { ...shownPrompt.params, letter: item.letter }; // spoken with the letter name
    if (question.say) voice.ui(text, params, { onDone: () => voice.teach(question.say) });
    else voice.ui(text, params);
    return () => clearTimeout(timer.current);
  }, []);

  function choose(option) {
    if (chosen) return;
    setChosen(option.key);
    if (onChosen) onChosen();
    if (option.correct) {
      playSound('pop');
      cheer();
      buddy.mood('happy');
      timer.current = setTimeout(() => onAnswered(true), AFTER_RIGHT_MS);
    } else {
      buddy.say('Good try! It was this one.', 'think');
      timer.current = setTimeout(() => onAnswered(false), AFTER_MISS_MS);
    }
  }

  function stateOf(option) {
    if (!chosen) return 'idle';
    if (option.key === chosen) return option.correct ? 'right' : 'faded';
    return option.correct ? 'reveal' : 'idle';
  }

  return (
    <View style={styles.body}>
      <View style={styles.stimulus}>
        {question.say ? <SoundButton onPress={() => voice.teach(question.say)} style={styles.bigSound} /> : null}
        {question.showLetter ? (
          <View style={[styles.show, CALM_SHADOW.lifted, { backgroundColor: item.accent.pale }]}>
            <LessonLetter item={item} style={[styles.showLetter, { color: item.accent.deep }]} />
          </View>
        ) : null}
        {question.showPicture ? (
          <View style={[styles.show, CALM_SHADOW.lifted]}>
            <TalkingObject emoji={question.showPicture.emoji} image={question.showPicture.image} size={96} calm active={active} />
          </View>
        ) : null}
      </View>

      <View style={styles.options}>
        {question.options.map((option, i) => (
          <AnswerOption
            key={option.key}
            option={option}
            index={i}
            width={optionWidth}
            state={stateOf(option)}
            active={active}
            onPress={() => choose(option)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'space-around',
  },
  stimulus: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  bigSound: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  show: {
    minWidth: 130,
    height: 120,
    paddingHorizontal: 18,
    borderRadius: CALM_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surface,
  },
  showLetter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 64,
    lineHeight: 78,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    direction: 'ltr',
  },
});
