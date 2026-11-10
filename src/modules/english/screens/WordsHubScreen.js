// WORDS HUB SCREEN - "Pick a word activity".
// Only "Read Along" is built so far (it opens the topic list); the other tiles say "Coming soon".
//
// Props: { navigation }

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import { showComingSoon } from '../../../shared/utils/alerts';
import { COLORS, FONTS } from '../../../shared/theme/theme';

const ITEMS = [
  { title: 'Read Along', icon: '📖', tint: COLORS.bluePale, screen: 'ReadingTopics' },
  { title: 'Reading Helper', icon: '👓', tint: COLORS.sagePale, screen: null },
  { title: 'Phonics', icon: '🔊', tint: COLORS.yellowPale, screen: null },
  { title: 'Spelling', icon: '🔤', tint: COLORS.purplePale, screen: null },
  { title: 'Writing', icon: '✏️', tint: COLORS.orangePale, screen: null },
];

export default function WordsHubScreen({ navigation }) {
  function openItem(item) {
    if (item.screen) navigation.navigate(item.screen);
    else showComingSoon(item.title);
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <ChildHeader title="English" onBack={() => navigation.goBack()}/>

        <View style={styles.instruction}>
          <ChildInstruction text="Pick a word activity" />
        </View>

        <View style={styles.grid}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => openItem(item)}
              accessibilityRole="button"
              style={[styles.tile, { backgroundColor: item.tint }]}
            >
              <Text style={styles.tileIcon}>{item.icon}</Text>
              <Text style={styles.tileTitle}>{item.title}</Text>
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
