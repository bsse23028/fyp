// SAY - "Your turn! Say it with me." "Say it together" plays the sound slowly while the letter pulses
// in time. Then "I said it!" appears (nothing is recorded); tapping it makes the buddy cheer.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from '../../../../../shared/components/AppText';
import SoftButton from '../../../../../shared/components/SoftButton';
import LetterCard from '../LetterCard';
import { motion } from '../../../../../shared/utils/motion';
import { SLOW_RATE } from '../../../../../shared/utils/speech';
import { CALM, FONTS } from '../../../../../shared/theme/theme';

export default function SayStep({ item, voice, cardSize, onDone }) {
  const [phase, setPhase] = useState('ready'); // ready | speaking | canSay | done
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    voice.ui('Your turn! Say it with me.');
  }, []);

  useEffect(() => {
    if (phase === 'canSay') motion.spring(appear, 1, { friction: 6 }).start();
  }, [phase]);

  function sayTogether() {
    setPhase('speaking');
    voice.teach(`${item.soundSpeech}. ${item.soundSpeech}.`, {
      rate: SLOW_RATE,
      onDone: () => setPhase((current) => (current === 'speaking' ? 'canSay' : current)),
    });
  }

  function saidIt() {
    setPhase('done');
    onDone();
  }

  return (
    <View style={styles.body}>
      <LetterCard item={item} size={cardSize * 0.85} pulsing={phase === 'speaking'} />

      <View style={styles.actions}>
        {phase === 'done' ? (
          <Text style={styles.cheer}>Let's play!</Text>
        ) : (
          <>
            <SoftButton title="Say it together" icon="🗣️" variant="soft" onPress={sayTogether} style={styles.button} />
            {phase === 'canSay' && (
              <Animated.View
                style={{ opacity: appear, transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}
              >
                <SoftButton title="I said it!" icon="🎉" onPress={saidIt} style={styles.button} />
              </Animated.View>
            )}
          </>
        )}
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
  actions: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    minHeight: 136,
  },
  button: {
    minWidth: 220,
  },
  cheer: {
    marginTop: 20,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 28,
    color: CALM.primaryDark,
    textAlign: 'center',
  },
});
