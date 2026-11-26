// STORY LIST SCREEN - "Letter stories": 26 tiles with the user's letter pictures. A letter with a video
// (data/letterVideos.js, written by video/scripts/renderAll.mjs) has a ▶ badge and opens LetterStory;
// a letter without one is soft and the buddy says "Coming soon!" (no pop-up).

import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../shared/components/Screen';
import KidScene from '../../../shared/components/KidScene';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from '../components/SectionHeader';
import LetterArt from '../components/spelling/LetterArt';
import { ALPHABET } from '../data/alphabetData';
import { LETTER_VIDEOS } from '../data/letterVideos';
import { useEntrance } from '../../../shared/utils/motion';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { CALM, CALM_RADIUS, CALM_SHADOW, SPACING } from '../../../shared/theme/theme';

const GREETING = 'Pick a letter story!';
const GAP = 12;
const LETTER_SCALE = 0.0017; // letter picture size compared to the tile

function StoryTile({ item, index, size, ready, onPress }) {
  const entrance = useEntrance(index, { stagger: 28, duration: 240, distance: 12 });
  const scale = size * LETTER_SCALE;
  return (
    <Animated.View style={entrance}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={`${item.letter} story`}
        style={[styles.tile, CALM_SHADOW.soft, { width: size, height: size }, !ready && styles.tileSoon]}
      >
        <View style={styles.pair}>
          <LetterArt char={item.letter} scale={scale} />
          <LetterArt char={item.lower} scale={scale} />
        </View>
        <View style={[styles.badge, ready ? styles.badgeReady : styles.badgeSoon]}>
          <Ionicons name={ready ? 'play' : 'time-outline'} size={14} color={ready ? '#FFFFFF' : CALM.textSoft} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function StoryListScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const columns = width >= 400 ? 4 : 3;
  const tileSize = Math.floor((width - SPACING.screen * 2 - GAP * (columns - 1)) / columns);
  const [buddy, setBuddy] = useState({ message: GREETING, messageKey: 1 });

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  function open(item) {
    if (LETTER_VIDEOS[item.letter]) navigation.navigate('LetterStory', { letter: item.letter });
    else setBuddy((b) => ({ message: 'Coming soon!', messageKey: b.messageKey + 1 }));
  }

  return (
    <Screen mode="child" contentStyle={styles.noPadding}>
      <KidScene scene="day" active={focused}>
        <View style={styles.header}>
          <SectionHeader title="Letter stories" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.grid, { gap: GAP }]}>
            {ALPHABET.map((item, i) => (
              <StoryTile
                key={item.letter}
                item={item}
                index={i}
                size={tileSize}
                ready={Boolean(LETTER_VIDEOS[item.letter])}
                onPress={() => open(item)}
              />
            ))}
          </View>
        </ScrollView>
        <BuddyCharacter size={76} style={styles.buddy} message={buddy.message} messageKey={buddy.messageKey} />
      </KidScene>
    </Screen>
  );
}

const styles = StyleSheet.create({
  noPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: SPACING.screen,
    paddingTop: 8,
    paddingBottom: 6,
  },
  scroll: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: 110,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    direction: 'ltr',
  },
  tile: {
    borderRadius: CALM_RADIUS.large,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSoon: {
    opacity: 0.55,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeReady: {
    backgroundColor: CALM.primary,
  },
  badgeSoon: {
    backgroundColor: CALM.surfaceSoft,
  },
  buddy: {
    position: 'absolute',
    left: 10,
    bottom: 8,
  },
});
