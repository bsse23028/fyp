// ALPHABET LIST SCREEN - "Alphabets": the buddy says hi, then a grid of 26 letter tiles with the
// stars earned. All letters are open; the next letter without stars glows softly.
// Tapping a tile opens LetterLesson. Stars come from alphabetSlice (empty in Preview mode).

import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import Screen from '../../../shared/components/Screen';
import BuddyCharacter from '../../../shared/components/BuddyCharacter';
import SectionHeader from '../components/SectionHeader';
import LetterTile from '../components/alphabet/LetterTile';
import { ALPHABET } from '../data/alphabetData';
import { selectLetterStars } from '../store/alphabetSlice';
import { useChild } from '../../../app/store/useChild';
import { speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { CALM, SPACING } from '../../../shared/theme/theme';

const GREETING = 'Pick a letter to learn!';
const GAP = 12;

export default function AlphabetListScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { activeChild } = useChild();
  const stars = useSelector((state) => selectLetterStars(state, activeChild ? activeChild.id : null));

  const columns = width >= 400 ? 4 : 3;
  const tileSize = Math.floor((width - SPACING.screen * 2 - GAP * (columns - 1)) / columns);
  const nextLetter = (ALPHABET.find((item) => !stars[item.letter]) || {}).letter;

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  return (
    <Screen scroll mode="child" background={CALM.background}>
      <View style={styles.body}>
        <SectionHeader title="Alphabets" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />

        <View style={styles.greeting}>
          <BuddyCharacter size={80} bubbleSide message={GREETING} messageKey={1} />
        </View>

        <View style={[styles.grid, { gap: GAP }]}>
          {ALPHABET.map((item, index) => (
            <LetterTile
              key={item.letter}
              item={item}
              index={index}
              size={tileSize}
              stars={stars[item.letter] || 0}
              isNext={item.letter === nextLetter}
              onPress={() => navigation.navigate('LetterLesson', { letter: item.letter })}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 20,
  },
  greeting: {
    marginTop: 14,
    marginBottom: 16,
    alignSelf: 'flex-start',
    minHeight: 104,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    direction: 'ltr',
  },
});
