// READING LEVEL SCREEN - "How hard should it be?"
//
// The second step of Read Along: the child picked a topic on the previous screen
// (it is kept in Redux); now they pick Easy, Medium or Hard.
// The level is saved in Redux (levelChosen) and the first sentence opens.
//
// Props: { navigation }

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import { levelChosen, selectTopic } from '../store/englishSlice';
import { LEVELS } from '../readingData';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingLevelScreen({ navigation }) {
  const dispatch = useDispatch();
  const topic = useSelector(selectTopic); // the topic picked on the last screen

  function startLevel(level) {
    dispatch(levelChosen(level.id)); // remember the choice
    navigation.navigate('ReadingAlong', { index: 0 });
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <ChildHeader
          title="Pick a level"
          onBack={() => navigation.goBack()}
          speakText="Pick a level. Easy, medium or hard."
        />

        <View style={styles.instruction}>
          <ChildInstruction text="How hard should it be?" />
        </View>

        {/* the topic that was picked */}
        {topic && (
          <View style={styles.topicRow}>
            <Text style={styles.topicIcon}>{topic.icon}</Text>
            <Text style={styles.topicTitle}>{topic.title}</Text>
          </View>
        )}

        {LEVELS.map((level) => {
          const count = topic && topic.levels[level.id] ? topic.levels[level.id].length : 0;
          return (
            <Pressable
              key={level.id}
              onPress={() => startLevel(level)}
              accessibilityRole="button"
              style={[styles.card, { backgroundColor: COLORS[level.tint] }]}
            >
              {/* one star for easy, two for medium, three for hard */}
              <View style={[styles.starsBox, { backgroundColor: COLORS[level.color] }]}>
                <Text style={styles.starsText}>{'★'.repeat(level.stars)}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{level.label}</Text>
                <Text style={styles.cardCount}>{count} sentences</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
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
    marginBottom: 12,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  topicIcon: {
    fontSize: 30,
  },
  topicTitle: {
    marginStart: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    color: COLORS.warmText,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
    padding: 16,
    minHeight: 96,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(61, 43, 31, 0.05)',
  },
  starsBox: {
    minWidth: 76,
    height: 56,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsText: {
    fontSize: 20,
    color: COLORS.white,
  },
  cardText: {
    flex: 1,
    marginStart: 14,
  },
  cardTitle: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    color: COLORS.warmText,
  },
  cardCount: {
    marginTop: 2,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 14,
    color: COLORS.warmMuted,
  },
  chevron: {
    fontSize: 30,
    color: COLORS.warmMuted,
  },
});
