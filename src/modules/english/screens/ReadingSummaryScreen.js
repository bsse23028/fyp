// READING SUMMARY SCREEN - "Nice reading!" - where Read Along ends.
//
// When it opens, the session is sent to the server (POST /api/children/:id/sessions).
// The server adds the stars to today's total and sends the new totals back, so they show
// up on Child Home and in Parent Progress. "Finish" goes back to "Pick a level"; "Read again" starts the same
// topic and level at sentence 1 (reaching this page again counts as another session).
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
import { BUTTON, COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingSummaryScreen({ navigation }) {
  const { activeChild, addReadingResult } = useChild();
  const { topicId, level } = useSelector((state) => state.english); // what the child picked
  const topics = useSelector(selectAllTopics);
  // Back to "Pick a level". The stack is rebuilt as Child Home > English > Topics > Level,
  // so the long chain of reading screens is cleared, Child Home stays the first screen
  // (a child can never go back into Parent Mode) and back still walks up one step at a time.
  function backToLevels() {
    navigation.reset({
      index: 3,
      routes: [{ name: 'ChildHome' }, { name: 'EnglishHub' }, { name: 'ReadingTopics' }, { name: 'ReadingLevel' }],
    });
  }
  // The same stack, plus sentence 1 of the level that was just read.
  function readAgain() {
    navigation.reset({
      index: 4,
      routes: [
        { name: 'ChildHome' },
        { name: 'EnglishHub' },
        { name: 'ReadingTopics' },
        { name: 'ReadingLevel' },
        { name: 'ReadingAlong', params: { index: 0 } },
      ],
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
    <Screen mode="child" scene="lesson">
      <View style={styles.body}>
        <View style={styles.center}>
          <Mascot size={150} />
          <Text style={styles.title}>Nice reading!</Text>
          <Text style={styles.copy}>Nice work. Great job.</Text>
          <View style={styles.stars}>
            <StarRow filled={STARS_PER_SESSION} />
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable onPress={readAgain} accessibilityRole="button" style={[styles.button, styles.againButton]}>
            <Text style={[styles.buttonText, styles.againText]}>Read again</Text>
          </Pressable>
          <Pressable onPress={backToLevels} accessibilityRole="button" style={styles.button}>
            <Text style={styles.buttonText}>Finish</Text>
          </Pressable>
        </View>
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
    color: COLORS.heading,
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
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 70,
    paddingHorizontal: 8,
    borderRadius: 22,
    backgroundColor: BUTTON.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
  },
  againButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  againText: {
    color: COLORS.primary,
  },
});
