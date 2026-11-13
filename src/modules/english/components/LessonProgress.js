// LESSON PROGRESS - icon dots at the top of a lesson (eye · ear · mic · game · star) with one tiny dot
// per page under each. The current stage is bigger and coloured; finished stages get a small check.
// Not tappable: the child can only move with swipes / arrows.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { motion } from '../../../shared/utils/motion';
import { CALM, CALM_SUCCESS } from '../../../shared/theme/theme';

function Stage({ stage, state, page, done }) {
  const scale = useRef(new Animated.Value(state === 'current' ? 1.18 : 1)).current;

  useEffect(() => {
    motion.spring(scale, state === 'current' ? 1.18 : 1, { friction: 5 }).start();
  }, [state]);

  const current = state === 'current';
  const finished = state === 'done';

  return (
    <View style={styles.stage}>
      <Animated.View
        style={[styles.circle, current && styles.circleCurrent, finished && styles.circleDone, { transform: [{ scale }] }]}
      >
        <Ionicons name={stage.icon} size={20} color={current ? CALM.onPrimary : finished ? CALM_SUCCESS.deep : CALM.textSoft} />
        {finished && (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={10} color={CALM.onPrimary} />
          </View>
        )}
      </Animated.View>
      <View style={styles.pageDots}>
        {stage.pages.map((p) => (
          <View key={p} style={[styles.pageDot, done[p] && styles.pageDotDone, p === page && styles.pageDotCurrent]} />
        ))}
      </View>
    </View>
  );
}

export default function LessonProgress({ stages, page, done }) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" importantForAccessibility="no-hide-descendants">
      {stages.map((stage) => {
        const isCurrent = stage.pages.includes(page);
        const isDone = !isCurrent && stage.pages.every((p) => done[p]);
        return <Stage key={stage.icon} stage={stage} page={page} done={done} state={isCurrent ? 'current' : isDone ? 'done' : 'todo'} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    direction: 'ltr',
  },
  stage: {
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surfaceSoft,
  },
  circleCurrent: {
    backgroundColor: CALM.primary,
  },
  circleDone: {
    backgroundColor: CALM_SUCCESS.pale,
  },
  check: {
    position: 'absolute',
    top: -3,
    end: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM_SUCCESS.main,
  },
  pageDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CALM.line,
  },
  pageDotDone: {
    backgroundColor: CALM_SUCCESS.main,
  },
  pageDotCurrent: {
    backgroundColor: CALM.primary,
    transform: [{ scale: 1.3 }],
  },
});
