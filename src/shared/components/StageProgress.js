// STAGE PROGRESS - friendly steps at the top of a lesson ("Learn", "Play", "Star Check").
// The current step is bigger and coloured, finished steps show a check. Not tappable: no skipping.
//   <StageProgress steps={[{ label: 'Learn', icon: '👀' }, ...]} current={0} />

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { motion } from '../utils/motion';
import { CALM, CALM_RADIUS, FONTS } from '../theme/theme';

function Step({ step, state }) {
  const scale = useRef(new Animated.Value(state === 'current' ? 1.12 : 1)).current;

  useEffect(() => {
    motion.spring(scale, state === 'current' ? 1.12 : 1, { friction: 5 }).start();
  }, [state]);

  const current = state === 'current';
  const done = state === 'done';

  return (
    <View style={styles.step} accessibilityState={{ selected: current }}>
      <Animated.View
        style={[styles.circle, current && styles.circleCurrent, done && styles.circleDone, { transform: [{ scale }] }]}
      >
        <Text style={styles.icon}>{done ? '✓' : step.icon}</Text>
      </Animated.View>
      <Text style={[styles.label, current && styles.labelCurrent]} numberOfLines={1}>
        {step.label}
      </Text>
    </View>
  );
}

export default function StageProgress({ steps, current }) {
  return (
    <View style={styles.row} accessibilityRole="progressbar">
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          {i > 0 && <View style={[styles.line, i <= current && styles.lineDone]} />}
          <Step step={step} state={i < current ? 'done' : i === current ? 'current' : 'todo'} />
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  step: {
    width: 70,
    alignItems: 'center',
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surfaceSoft,
    borderWidth: 2,
    borderColor: CALM.line,
  },
  circleCurrent: {
    backgroundColor: CALM.primaryPale,
    borderColor: CALM.primary,
  },
  circleDone: {
    backgroundColor: CALM.sagePale,
    borderColor: CALM.sage,
  },
  icon: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 16,
    color: CALM.text,
  },
  label: {
    marginTop: 4,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 12,
    color: CALM.textSoft,
  },
  labelCurrent: {
    fontFamily: FONTS.nunitoBlack,
    color: CALM.primaryDark,
  },
  line: {
    width: 14,
    height: 3,
    marginTop: 18,
    borderRadius: CALM_RADIUS.pill,
    backgroundColor: CALM.line,
  },
  lineDone: {
    backgroundColor: CALM.sage,
  },
});
