// ANSWER OPTION - one big Star Check choice (a letter or a picture).
//   state 'idle' | 'right' (chosen and correct: soft green glow + a twinkling star)
//         'reveal' (the correct one shown after a miss: soft green glow) | 'faded' (the missed choice)

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import { motion, useScaleIn } from '../../../../../shared/utils/motion';
import { LessonLetter } from '../LetterCase';
import TalkingObject from '../../../../../shared/components/TalkingObject';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SUCCESS, FONTS } from '../../../../../shared/theme/theme';

function Twinkle() {
  const pop = useScaleIn(0);
  return <Animated.Text style={[styles.twinkle, pop]}>⭐</Animated.Text>;
}

export default function AnswerOption({ option, width, state, index, onPress, active = true }) {
  const appear = useScaleIn(120 + index * 90);
  const fade = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const lit = state === 'right' || state === 'reveal';

  useEffect(() => {
    if (state === 'faded') motion.timing(fade, 0.4, { duration: 360 }).start();
    if (lit) {
      motion
        .sequence([motion.timing(glow, 1, { duration: 300 }), motion.timing(glow, 0.55, { duration: 500 })])
        .start();
    }
  }, [state]);

  return (
    <Animated.View style={[{ width, opacity: fade }, appear]}>
      <Animated.View pointerEvents="none" style={[styles.glow, { opacity: glow }]} />
      <AnimatedPressable
        onPress={state === 'idle' ? onPress : undefined}
        accessibilityLabel={option.kind === 'letter' ? option.item.letter : option.example.word}
        style={[styles.card, CALM_SHADOW.soft, lit && styles.lit]}
      >
        {option.kind === 'letter' ? (
          <LessonLetter item={option.item} opposite={option.role === 'opposite'} style={[styles.letter, { color: option.item.accent.deep }]} />
        ) : (
          <>
            <TalkingObject
              emoji={option.example.emoji}
              image={option.example.image}
              size={54}
              calm
              active={active}
              mood={state === 'right' ? 'happy' : 'idle'}
              moodKey={state === 'right' ? 1 : 0}
            />
            <Text style={styles.word} numberOfLines={1}>
              {option.example.word}
            </Text>
          </>
        )}
      </AnimatedPressable>
      {state === 'right' && <Twinkle />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    margin: -7,
    borderRadius: CALM_RADIUS.large + 7,
    backgroundColor: CALM_SUCCESS.main,
  },
  card: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: CALM_RADIUS.large,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: CALM.surface,
  },
  lit: {
    borderColor: CALM_SUCCESS.main,
    backgroundColor: CALM_SUCCESS.pale,
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 52,
    lineHeight: 64,
  },
  word: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: CALM.text,
  },
  twinkle: {
    position: 'absolute',
    top: -14,
    end: -8,
    fontSize: 28,
  },
});
