// CHECK STAGE - the Star Check page: 5 questions that cross-fade one after another (progress dots).
// After the last answer a big soft star waits; the child swipes on to the Result page.
// The lesson screen keeps the question index and the score.

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CrossFade from '../../../../../shared/components/CrossFade';
import ProgressDots from '../../../../../shared/components/ProgressDots';
import Text from '../../../../../shared/components/AppText';
import QuestionView from './QuestionView';
import { usePulse } from '../../../../../shared/utils/motion';

function AllAnswered({ active }) {
  const pulse = usePulse(active, { duration: 1300 });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <View style={styles.center}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={styles.star}>⭐</Text>
      </Animated.View>
    </View>
  );
}

export default function CheckStage({ questions, index, item, voice, buddy, contentWidth, onChosen, onAnswered, active = true }) {
  const finished = index >= questions.length;

  return (
    <View style={styles.body}>
      <ProgressDots count={questions.length} current={index} />
      <CrossFade stepKey={finished ? 'done' : questions[index].id}>
        {finished ? (
          <AllAnswered active={active} />
        ) : (
          <QuestionView
            question={questions[index]}
            item={item}
            voice={voice}
            buddy={buddy}
            contentWidth={contentWidth}
            onChosen={onChosen}
            onAnswered={onAnswered}
            active={active}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 110,
    lineHeight: 130,
  },
});
