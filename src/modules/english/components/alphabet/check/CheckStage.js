// CHECK STAGE - stage 3 of a letter: 5 questions that cross-fade one after another (progress dots),
// then the result. The lesson screen keeps the question index and the score.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import CrossFade from '../../../../../shared/components/CrossFade';
import ProgressDots from '../../../../../shared/components/ProgressDots';
import QuestionView from './QuestionView';
import ResultView from './ResultView';

export default function CheckStage({ questions, index, stars, item, voice, buddy, contentWidth, onAnswered, onPlayAgain, onBackToLetters }) {
  const finished = index >= questions.length;

  return (
    <View style={styles.body}>
      {!finished && <ProgressDots count={questions.length} current={index} />}
      <CrossFade stepKey={finished ? 'result' : questions[index].id}>
        {finished ? (
          <ResultView stars={stars} onPlayAgain={onPlayAgain} onBackToLetters={onBackToLetters} />
        ) : (
          <QuestionView
            question={questions[index]}
            item={item}
            voice={voice}
            buddy={buddy}
            contentWidth={contentWidth}
            onAnswered={onAnswered}
          />
        )}
      </CrossFade>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
});
