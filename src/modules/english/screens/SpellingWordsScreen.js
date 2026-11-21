// SPELLING WORDS SCREEN - "Pick a word to spell": one big card per word (picture + the word written
// in the colours of its letter pictures). Opened from Words > Spelling; a card opens SpellingGame { wordId }.
// The words come from data/spellingWords.js, so new words show up here by themselves.

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import FadeInView from '../../../shared/components/FadeInView';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import SectionHeader from '../components/SectionHeader';
import SpellingPicture from '../components/spelling/pictures/SpellingPicture';
import { SPELLING } from '../components/spelling/spellingConfig';
import { LETTER_ART } from '../data/letterImages';
import { SPELLING_WORDS } from '../data/spellingWords';
import { speak, speakUi, stopSpeaking } from '../../../shared/utils/speech';
import { useChild } from '../../../app/store/useChild';
import { getAvatar } from '../../../shared/theme/avatars';
import { CALM, CALM_RADIUS, CALM_SHADOW, FONTS } from '../../../shared/theme/theme';

const GREETING = 'Pick a word to spell';
const PICTURE = 76; // size of the picture on each card

export default function SpellingWordsScreen({ navigation }) {
  const { displayAvatar } = useChild();
  const buddy = getAvatar(displayAvatar).mascot; // shown for a word that has no picture (a name)

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', stopSpeaking);
    return unsubscribe;
  }, [navigation]);

  function open(item) {
    stopSpeaking();
    navigation.navigate('SpellingGame', { wordId: item.id });
  }

  return (
    <Screen scroll mode="child" scene="sunset">
      <View style={styles.body}>
        <SectionHeader title="Spelling" onBack={() => navigation.goBack()} onSound={() => speakUi(GREETING)} />
        <Text style={styles.greeting}>{GREETING}</Text>

        {SPELLING_WORDS.map((item, i) => (
          <FadeInView key={item.id} index={i + 1} style={styles.cardWrap}>
            <AnimatedPressable
              onPress={() => open(item)}
              onLongPress={() => speak(item.sayAs)}
              accessibilityLabel={item.sayAs}
              style={[styles.card, CALM_SHADOW.soft]}
            >
              <View style={styles.pictureBox}>
                <SpellingPicture item={item} size={PICTURE} fallback={buddy} />
              </View>
              <View style={styles.word}>
                {(SPELLING.ALL_CAPS ? item.word.toUpperCase() : item.word).split('').map((letter, n) => {
                  const art = LETTER_ART[letter];
                  return (
                    <Text key={n} style={[styles.letter, { color: art ? art.color : CALM.text }]}>
                      {letter}
                    </Text>
                  );
                })}
              </View>
            </AnimatedPressable>
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 16,
  },
  greeting: {
    marginTop: 14,
    marginBottom: 4,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 22,
    color: CALM.heading,
    textAlign: 'center',
  },
  cardWrap: {
    marginTop: 14,
  },
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: CALM_RADIUS.xl,
    backgroundColor: CALM.surface,
  },
  pictureBox: {
    width: PICTURE + 16,
    height: PICTURE + 16,
    borderRadius: CALM_RADIUS.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CALM.surfaceSoft,
  },
  word: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginStart: 12,
    direction: 'ltr',
  },
  letter: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 30,
    lineHeight: 38,
  },
});
