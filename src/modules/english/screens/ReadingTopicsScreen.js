// READING TOPICS SCREEN - "What do you want to read about?"
//
// The first step of Read Along: the child picks a topic (Animals, Food ...).
// The list comes from the DATABASE (loaded once when the child was chosen, kept in Redux):
// the built-in topics plus this child's custom topics. A spinner shows while it loads,
// and a message with Retry if the server cannot be reached.
//
// The choice is saved in Redux (topicChosen) and the next screen asks for the level.
//
// Props: { navigation }

import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import { useChild } from '../../../app/store/useChild';
import { fetchReadingContent, selectAllTopics, selectContentState, topicChosen } from '../store/englishSlice';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingTopicsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { activeChild } = useChild();
  const topics = useSelector(selectAllTopics);
  const { loading, error } = useSelector(selectContentState);

  // The content is normally loaded when the child was chosen. If it is not there yet
  // (or that failed), ask once more. fetchReadingContent skips this when it is already loaded.
  function loadContent() {
    if (activeChild) dispatch(fetchReadingContent({ childId: activeChild.id }));
  }
  useEffect(loadContent, [activeChild ? activeChild.id : null]);

  function openTopic(topic) {
    dispatch(topicChosen(topic.id)); // remember the choice
    navigation.navigate('ReadingLevel');
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <ChildHeader
          title="Pick a topic"
          onBack={() => navigation.goBack()}
          speakText="Pick a topic. What do you want to read about?"
        />

        <View style={styles.instruction}>
          <ChildInstruction text="What do you want to read about?" />
        </View>

        {/* still loading from the server */}
        {loading && <ActivityIndicator color={COLORS.warmText} style={styles.spinner} />}

        {/* the server could not be reached: say so, with Retry.
            (In DEMO_MODE the built-in topics are shown below it meanwhile.) */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Could not connect</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadContent} accessibilityRole="button" style={styles.retry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.grid}>
          {!loading && topics.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() => openTopic(topic)}
              accessibilityRole="button"
              style={[styles.tile, { backgroundColor: COLORS[topic.tint] || COLORS.bluePale }]}
            >
              <Text style={styles.tileIcon}>{topic.icon}</Text>
              <Text style={styles.tileTitle}>{topic.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  instruction: {
    marginTop: 15,
    marginBottom: 15,
  },
  spinner: {
    marginTop: 30,
  },
  errorBox: {
    marginBottom: 15,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'rgba(61, 43, 31, 0.08)',
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 4,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.warmMuted,
    textAlign: 'center',
  },
  retry: {
    marginTop: 12,
    minHeight: 50,
    paddingHorizontal: 28,
    borderRadius: 18,
    backgroundColor: COLORS.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 17,
    color: COLORS.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    minHeight: 144,
    marginBottom: 13,
    padding: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(61, 43, 31, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIcon: {
    fontSize: 44,
    lineHeight: 54,
  },
  tileTitle: {
    marginTop: 9,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 17,
    lineHeight: 20,
    color: COLORS.warmText,
    textAlign: 'center',
  },
});
