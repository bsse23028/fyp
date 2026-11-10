// READING YOUR TURN SCREEN - "Listen, then say the glowing word".
//
// The sentence is shown with ONE glowing word. The speaker says that word
// aloud, Buddy encourages, and the child taps "I said it".
// (The app does not check the voice yet - that comes with the speech
// feature in a later phase.)
//
//   more sentences left -> next Reading Along sentence
//   last sentence       -> "Nice reading!" summary
//
// Route params: { index }
// Props: { navigation, route }

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import ChildHeader from '../../../shared/components/ChildHeader';
import ChildInstruction from '../../../shared/components/ChildInstruction';
import SpeakButton from '../../../shared/components/SpeakButton';
import Mascot from '../../../shared/components/Mascot';
import { useLanguage } from '../../../app/context/LanguageContext';
import { selectSentences } from '../store/englishSlice';
import { getSentence } from '../readingData';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function ReadingYourTurnScreen({ navigation, route }) {
  const index = route.params && route.params.index ? route.params.index : 0;
  const { language } = useLanguage();
  const sentences = useSelector(selectSentences); // the sentences of the picked topic + level
  const sentence = getSentence(sentences, index, language); // English or Urdu words
  const focusWord = sentence.words[sentence.focus].replace(/[.!?۔،]/g, ''); // "soft", without the full stop
  const isLast = index >= sentences.length - 1;

  function handleDone() {
    if (isLast) navigation.navigate('ReadingSummary');
    else navigation.push('ReadingAlong', { index: index + 1 });
  }

  return (
    <Screen scroll mode="child">
      <View style={styles.body}>
        <ChildHeader title="Your turn" onBack={() => navigation.goBack()} speakText="Your turn" />

        <View style={styles.instruction}>
          <ChildInstruction text="Listen, then say the glowing word" />
        </View>

        <View style={styles.card}>
          {/* the sentence, with the focus word lit up */}
          <View style={styles.sentence}>
            {sentence.words.map((word, i) => (
              <Text key={i} style={[styles.word, i === sentence.focus && styles.wordLit]}>
                {word}
              </Text>
            ))}
          </View>

          <SpeakButton text={focusWord} style={styles.speaker} />
          <Mascot size={82} />
          <Text style={styles.tryText}>Try “{focusWord}” with me</Text>
        </View>

        <Pressable onPress={handleDone} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>I said it</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  instruction: {
    marginTop: 18,
  },
  card: {
    flex: 1,
    marginTop: 18,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    marginHorizontal: 5,
    marginVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 10,
    overflow: 'hidden',
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 28,
    lineHeight: 46,
    color: COLORS.warmText,
  },
  wordLit: {
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    paddingHorizontal: 10,
  },
  speaker: {
    marginVertical: 18,
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  tryText: {
    marginTop: 10,
    fontFamily: FONTS.nunitoBlack,
    fontSize: 18,
    color: COLORS.warmText,
  },
  button: {
    marginTop: 18,
    minHeight: 68,
    borderRadius: 22,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: COLORS.warmText,
  },
});
