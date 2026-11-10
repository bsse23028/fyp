// READING TOPICS SCREEN - "What do you want to read about?"
//
// The first step of Read Along: the child picks a topic (Animals, Food ...).
// The list comes from data/readingTopics.json (plus any custom topics saved later), so
// adding a topic to the file adds a tile here automatically.
//
// The choice is saved in Redux (topicChosen) and the next screen asks for the level.
//
// Props: { navigation }

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import { selectAllTopics, topicChosen } from '../store/englishSlice';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingTopicsScreen({ navigation }) {
  const dispatch = useDispatch();
  const topics = useSelector(selectAllTopics);

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

        <View style={styles.grid}>
          {topics.map((topic) => (
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
