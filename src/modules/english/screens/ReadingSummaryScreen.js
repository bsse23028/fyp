// READING SUMMARY SCREEN - "Nice reading!" - where Read Along ends.
//
// When it opens, the session is sent to the server (POST /api/children/:id/sessions).
// The server adds the stars to today's total and sends the new totals back, so they show
// up on Child Home and in Parent Progress. "Finish" goes back to "Pick a level".
//
// Props: { navigation }

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import Mascot from '../../../shared/components/Mascot';
import StarRow from '../../../shared/components/StarRow';
import { useSelector } from 'react-redux';
import { useChild } from '../../../app/store/useChild';
// import { goToChildHome } from '../../../app/navigation/helpers';
import { STARS_PER_SESSION } from '../readingData';
import { selectAllTopics } from '../store/englishSlice';
import { makeUuid } from '../../../shared/utils/uuid';
import { dayKey } from '../../../shared/utils/progress';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingSummaryScreen({ navigation }) {
  const { activeChild, addReadingResult } = useChild();
  const { topicId, level } = useSelector((state) => state.english); // what the child picked
  const topics = useSelector(selectAllTopics);
  // Back to "Pick a level". The stack is rebuilt as Child Home > Words > Topics > Level,
  // so the long chain of reading screens is cleared, Child Home stays the first screen
  // (a child can never go back into Parent Mode) and back still walks up one step at a time.
  function backToLevels() {
    navigation.reset({
      index: 3,
      routes: [{ name: 'ChildHome' }, { name: 'WordsHub' }, { name: 'ReadingTopics' }, { name: 'ReadingLevel' }],
    });
  }
  // Runs once, when the screen opens: send this session to the server.
  // The session (with its clientSessionId) is made ONCE here. If saving fails, the pop-up's
  // "Retry" sends this same object again, so the stars are never counted twice.
  useEffect(() => {
    if (!activeChild) return;
    addReadingResult({
      childId: activeChild.id,
      clientSessionId: makeUuid(),
      stars: STARS_PER_SESSION,
      // The same fallback as selectSentences: nothing picked -> first topic, easy.
      topicId: topicId || (topics[0] ? topics[0].id : 'animals'),
      level: level || 'easy',
      language: 'en', // the English module
      sessionDate: dayKey(), // the phone's own today, e.g. "2026-11-11"
    });
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
