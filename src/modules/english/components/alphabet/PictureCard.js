// PICTURE CARD - an example picture ("🍎 Apple") with the letter highlighted in its colour.
// Pops in when it appears; each tap bounces it and pops the word's letters in one by one (~120 ms).

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../shared/components/AppText';
import AnimatedPressable from '../../../../shared/components/AnimatedPressable';
import { motion, useScaleIn } from '../../../../shared/utils/motion';
import { highlightIndex } from '../../data/alphabetData';
import { CALM, CALM_RADIUS, CALM_SHADOW, CALM_SUCCESS, FONTS } from '../../../../shared/theme/theme';

export const LETTER_POP_MS = 120;

function PopLetter({ char, delay, color }) {
  const pop = useScaleIn(delay);
  return <Animated.Text style={[styles.wordLetter, { color }, pop]}>{char}</Animated.Text>;
}

export default function PictureCard({ example, item, size = 140, tapped = false, playKey = 0, onPress }) {
  const appear = useScaleIn(0);
  const bounce = useRef(new Animated.Value(1)).current;
  const mark = highlightIndex(example, item.letter);

  useEffect(() => {
    if (!playKey) return;
    motion
      .sequence([motion.timing(bounce, 1.12, { duration: 140 }), motion.spring(bounce, 1, { friction: 4, tension: 160 })])
      .start();
  }, [playKey]);

  return (
    <Animated.View style={appear}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={example.word}
        style={[styles.card, CALM_SHADOW.soft, { width: size }, tapped && styles.tapped]}
      >
        <Animated.View style={{ transform: [{ scale: bounce }] }}>
          <Text style={[styles.emoji, { fontSize: size * 0.42, lineHeight: size * 0.52 }]}>{example.emoji}</Text>
        </Animated.View>
        <View key={playKey} style={styles.word}>
          {example.word.split('').map((char, i) => (
            <PopLetter
              key={i}
              char={char}
              delay={playKey ? i * LETTER_POP_MS : 0}
              color={i === mark ? item.accent.deep : CALM.text}
            />
          ))}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: CALM_RADIUS.large,
    backgroundColor: CALM.surface,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  tapped: {
    borderColor: CALM_SUCCESS.main,
  },
  emoji: {
    textAlign: 'center',
  },
  word: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 6,
    direction: 'ltr',
  },
  wordLetter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
  },
});
