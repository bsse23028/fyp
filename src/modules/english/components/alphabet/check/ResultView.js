// RESULT VIEW - the end of a letter: the stars spring in one by one (~400 ms apart), a few ✨ drift
// up, and two calm choices ("Play again", "Back to letters"). "Next letter" is the main button at the
// bottom (LessonLayout). With 1 star, "Play again" is the gently highlighted one.

import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import StarsRow from '../../../../../shared/components/StarsRow';
import Sparkles from '../../../../../shared/components/Sparkles';
import SoftButton from '../../../../../shared/components/SoftButton';
import { usePulse } from '../../../../../shared/utils/motion';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../../../shared/theme/theme';

const STAR_GAP = 400;

export default function ResultView({ stars, onPlayAgain, onBackToLetters }) {
  const [sparkles, setSparkles] = useState(0);
  const lowScore = stars <= 1;
  const pulse = usePulse(lowScore, { duration: 1400 });

  useEffect(() => {
    const timer = setTimeout(() => setSparkles(1), stars * STAR_GAP);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.body}>
      <View style={[styles.card, CALM_SHADOW.soft]}>
        <Text style={styles.title}>Great job!</Text>
        <StarsRow count={stars} popIn gap={STAR_GAP} size={54} style={styles.stars} />
        <Sparkles burstKey={sparkles} size={22} count={4} />
      </View>

      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }] }}>
          <SoftButton
            title="Play again"
            icon="🔁"
            variant={lowScore ? 'primary' : 'soft'}
            onPress={onPlayAgain}
            style={styles.button}
          />
        </Animated.View>
        <SoftButton title="Back to letters" icon="🔤" variant="secondary" onPress={onBackToLetters} style={styles.button} />
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
    paddingVertical: 22,
    paddingHorizontal: 34,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  title: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 28,
    color: CALM.primaryDark,
  },
  stars: {
    marginTop: 8,
  },
  actions: {
    marginTop: 22,
    gap: 12,
    alignItems: 'center',
  },
  button: {
    minWidth: 230,
  },
});
