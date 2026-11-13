// LISTEN PICTURE - ONE big familiar object (emoji now, `image` later) on a soft round background with a
// shadow, bobbing slowly. Its word sits below with the letter highlighted in the letter colour.
// The ref gives dance(): squash-and-stretch bounce, a wiggle (~10°) and a small jump.
// Change `popKey` to make the word's letters pop in one by one.

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { motion, useIdleBob, useFlip, useScaleIn, wiggle, wiggleRotate } from '../../../../../shared/utils/motion';
import { highlightIndex } from '../../../data/alphabetData';
import { useLetterCase } from '../LetterCase';
import { CALM, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

export const LETTER_POP_MS = 120;

function PopLetter({ char, delay, color, size }) {
  const pop = useScaleIn(delay);
  return <Animated.Text style={[styles.wordLetter, { color, fontSize: size }, pop]}>{char}</Animated.Text>;
}

const ListenPicture = forwardRef(function ListenPicture({ item, example, size, popKey = 0 }, ref) {
  const bob = useIdleBob({ height: 6, duration: 2000, cycles: 8, delay: 400 });
  const sx = useRef(new Animated.Value(1)).current;
  const sy = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const { caseMode, word } = useLetterCase();
  const flip = useFlip(caseMode);
  const mark = highlightIndex(example, item.letter);

  useImperativeHandle(ref, () => ({
    dance: () =>
      motion.sequence([
        motion.parallel([motion.timing(sy, 0.82, { duration: 120 }), motion.timing(sx, 1.18, { duration: 120 })]),
        motion.parallel([motion.timing(sy, 1.15, { duration: 130 }), motion.timing(sx, 0.88, { duration: 130 })]),
        motion.parallel([motion.spring(sy, 1, { friction: 4 }), motion.spring(sx, 1, { friction: 4 })]),
        wiggle(shake, { swings: 4, duration: 110 }),
        motion.timing(lift, -26, { duration: 180, easing: Easing.out(Easing.quad) }),
        motion.timing(lift, 0, { duration: 170, easing: Easing.in(Easing.quad) }),
      ]),
  }));

  const objectSize = size * 0.5;

  return (
    <View style={styles.wrap}>
      <Animated.View style={bob}>
        <Animated.View
          style={[
            styles.circle,
            CALM_SHADOW.lifted,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: item.accent.pale },
            {
              transform: [{ translateY: lift }, { scaleX: sx }, { scaleY: sy }, { rotate: wiggleRotate(shake, 10) }],
            },
          ]}
        >
          {example.image ? (
            <Image source={example.image} resizeMode="contain" style={{ width: objectSize * 1.2, height: objectSize * 1.2 }} />
          ) : (
            <Animated.Text style={{ fontSize: objectSize, lineHeight: objectSize * 1.25 }}>{example.emoji}</Animated.Text>
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View key={popKey} style={[styles.word, flip]}>
        {word(example.word)
          .split('')
          .map((char, i) => (
            <PopLetter
              key={i}
              char={char}
              size={Math.max(26, size * 0.16)}
              delay={popKey ? i * LETTER_POP_MS : 0}
              color={i === mark ? item.accent.deep : CALM.text}
            />
          ))}
      </Animated.View>
    </View>
  );
});

export default ListenPicture;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    direction: 'ltr',
  },
  wordLetter: {
    fontFamily: FONTS.nunitoBlack,
  },
});
