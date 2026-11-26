// RESULT VIEW - the last lesson page: the stars spring in one by one (~400 ms apart), a few ✨ drift up,
// then three icon buttons (no words): next letter (big), play again, back to letters.
// With 1 star "play again" is the gently highlighted one; next letter stays available.

import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarsRow from '../../../../../shared/components/StarsRow';
import Sparkles from '../../../../../shared/components/Sparkles';
import AnimatedPressable from '../../../../../shared/components/AnimatedPressable';
import { usePulse, useScaleIn } from '../../../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW } from '../../../../../shared/theme/theme';

const STAR_GAP = 400;

function IconButton({ icon, size, main, highlight, onPress, label, delay }) {
  const appear = useScaleIn(delay);
  const pulse = usePulse(highlight, { duration: 1300 });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <Animated.View style={[appear, { transform: [{ scale }] }]}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={label}
        style={[
          styles.iconButton,
          { width: size, height: size, borderRadius: size / 2 },
          main || highlight ? [styles.main, CALM_SHADOW.lifted] : [styles.soft, CALM_SHADOW.soft],
        ]}
      >
        <Ionicons name={icon} size={size * 0.48} color={main || highlight ? CALM.onPrimary : CALM.primaryDark} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ResultView({ stars, hasNext, onNext, onPlayAgain, onBackToLetters }) {
  const [sparkles, setSparkles] = useState(0);
  const lowScore = stars <= 1;
  const buttonsDelay = stars * STAR_GAP + 300;

  useEffect(() => {
    const timer = setTimeout(() => setSparkles(1), stars * STAR_GAP);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.body}>
      <View style={[styles.card, CALM_SHADOW.soft]}>
        <StarsRow count={stars} popIn gap={STAR_GAP} size={64} />
        <Sparkles burstKey={sparkles} size={24} count={4} />
      </View>

      <View style={styles.actions}>
        <IconButton icon="refresh" size={68} highlight={lowScore} onPress={onPlayAgain} label="Play again" delay={buttonsDelay} />
        {hasNext ? (
          <IconButton icon="arrow-forward" size={92} main={!lowScore} onPress={onNext} label="Next letter" delay={buttonsDelay + 120} />
        ) : null}
        <IconButton icon="grid" size={68} onPress={onBackToLetters} label="Back to letters" delay={buttonsDelay + 240} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 30,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 30,
    direction: 'ltr',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    backgroundColor: CALM.primary,
  },
  soft: {
    backgroundColor: CALM.surface,
  },
});
