// READING SUMMARY SCREEN - "Nice reading!" - where Read Along ends.
//
// When it opens, the stars are added to today's total (saved with AsyncStorage),
// so they show up on Child Home. "Finish" goes back to Child Home.
//
// Props: { navigation }

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import Mascot from '../../../shared/components/Mascot';
import StarRow from '../../../shared/components/StarRow';
import { useChild } from '../../../app/store/useChild';
// import { goToChildHome } from '../../../app/navigation/helpers';
import { STARS_PER_SESSION } from '../readingData';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingSummaryScreen({ navigation }) {
  const { addReadingResult } = useChild();
  // Back to "Pick a level". The stack is rebuilt as Child Home > Words > Topics > Level,
  // so the long chain of reading screens is cleared, Child Home stays the first screen
  // (a child can never go back into Parent Mode) and back still walks up one step at a time.
  function backToLevels() {
    navigation.reset({
      index: 3,
      routes: [{ name: 'ChildHome' }, { name: 'WordsHub' }, { name: 'ReadingTopics' }, { name: 'ReadingLevel' }],
    });
  }
  // Runs once, when the screen opens.
  useEffect(() => {
    addReadingResult(STARS_PER_SESSION);
  }, []);

  return (
    <Screen mode="child">
      <View style={styles.body}>
        <View style={styles.center}>
          <Mascot size={150} />
          <Text style={styles.title}>Nice reading!</Text>
          <Text style={styles.copy}>You kept trying and found the tricky words.</Text>
          <View style={styles.stars}>
            <StarRow filled={STARS_PER_SESSION} />
          </View>
        </View>

        <Pressable onPress={backToLevels} accessibilityRole="button" style={styles.button}>          <Text style={styles.buttonText}>Finish</Text>
        </Pressable>
      </View>
    </Screen>
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
  title: {
    marginTop: 20,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 32,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  copy: {
    marginTop: 8,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.warmMuted,
    textAlign: 'center',
  },
  stars: {
    marginTop: 24,
  },
  button: {
    minHeight: 70,
    borderRadius: 22,
    backgroundColor: COLORS.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.white,
  },
});
