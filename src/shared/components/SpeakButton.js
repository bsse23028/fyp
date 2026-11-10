// SPEAK BUTTON - the little speaker. Tap it and the phone reads `text` aloud
// (children who cannot read yet can still follow the instructions).
//
//   <SpeakButton text="Pick a word activity" />               big square (64)
//   <SpeakButton text="..." compact />                        small white square (44)
//   <SpeakButton text="..." onPress={playAgain} />             does `playAgain` instead of just speaking

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from './AppText';
import * as Speech from 'expo-speech';
import { useLanguage } from '../../app/context/LanguageContext';
import { COLORS } from '../theme/theme';

export default function SpeakButton({ text, compact = false, onPress, style }) {
  const { language, t } = useLanguage();

  function speak() {
    if (onPress) {
      onPress(); // the screen wants to do something special (e.g. light up words)
      return;
    }
    Speech.stop(); // stop anything that is still being read
    // Urdu: reads the Urdu text (needs an Urdu voice on the phone; English otherwise)
    Speech.speak(t(text), { language: language === 'ur' ? 'ur-PK' : 'en', rate: 0.9 });
  }

  return (
    <Pressable
      onPress={speak}
      accessibilityRole="button"
      accessibilityLabel="Read aloud"
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.big,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={compact ? styles.iconCompact : styles.iconBig}>🔊</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  big: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.bluePale,
  },
  compact: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.white,
  },
  pressed: {
    opacity: 0.8,
  },
  iconBig: {
    fontSize: 24,
  },
  iconCompact: {
    fontSize: 20,
  },
});
