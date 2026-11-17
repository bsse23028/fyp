// TRACE LIST SCREEN - "Trace letters": 26 tiles (your own capital + small letter pictures) over the
// animated KidScene sky. Tiles pop in one after another; a tap opens LetterTrace for that letter.

import React, { useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Screen from '../../../shared/components/Screen';
import KidScene from '../../../shared/components/KidScene';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import SectionHeader from '../components/SectionHeader';
import LetterArt from '../components/spelling/LetterArt';
import { ALPHABET } from '../data/alphabetData';
import { useEntrance } from '../../../shared/utils/motion';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { CALM_RADIUS, CALM_SHADOW, SPACING } from '../../../shared/theme/theme';

const GREETING = 'Pick a letter to trace!';
const GAP = 12;
const LETTER_SCALE = 0.0017; // letter picture size compared to the tile (bigger = bigger letters)

function TraceTile({ item, index, size, onPress }) {
  const entrance = useEntrance(index, { stagger: 28, duration: 240, distance: 12 });
  const scale = size * LETTER_SCALE;
  return (
    <Animated.View style={entrance}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityLabel={`${item.letter} ${item.lower}`}
        style={[styles.tile, CALM_SHADOW.soft, { width: size, height: size }]}
      >
        <View style={styles.pair}>
          <LetterArt char={item.letter} scale={scale} />
          <LetterArt char={item.lower} scale={scale} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function TraceListScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const columns = width >= 400 ? 4 : 3;
  const tileSize = Math.floor((width - SPACING.screen * 2 - GAP * (columns - 1)) / columns);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    const timer = setTimeout(() => speakUi(GREETING), 500);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [navigation]);

  return (
    <Screen mode="child" contentStyle={styles.noPadding}>
      <KidScene scene="day" active={focused}>
        <View style={styles.header}>
          <SectionHeader title="Trace letters" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.grid, { gap: GAP }]}>
            {ALPHABET.map((item, i) => (
              <TraceTile
                key={item.letter}
                item={item}
                index={i}
                size={tileSize}
                onPress={() => navigation.navigate('LetterTrace', { letter: item.letter })}
              />
            ))}
          </View>
        </ScrollView>
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
    paddingBottom: 90,
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
  pair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
});
