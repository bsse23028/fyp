// READING YOUR TURN SCREEN - "Listen, then say the glowing word".
//
// The sentence is shown with ONE glowing word. The speaker says that word
// aloud, Buddy encourages, and the child taps "I said it". "Sentence n of m" shows where the child is.
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
import ReadingWord from '../components/ReadingWord';
import { READING } from '../readingConfig';
import { translate } from '../../../shared/i18n/translate';
import { useLanguage } from '../../../app/context/LanguageContext';
import { selectSentences } from '../store/englishSlice';
import { getSentence } from '../readingData';
import { BUTTON, COLORS, FONTS } from '../../../shared/theme/theme';

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
    <Screen scroll mode="child" scene="lesson">
      <View style={styles.body}>
        <ChildHeader title="Your turn" onBack={() => navigation.goBack()} speakText="Your turn" />

        <Text style={styles.count}>{translate('Sentence {n} of {total}', { n: index + 1, total: sentences.length })}</Text>

        <View style={styles.instruction}>
          <ChildInstruction text="Listen, then say the glowing word" />
        </View>

        <View style={styles.card}>
          {/* the sentence, with the focus word lit up */}
          <View style={styles.sentence}>
            {sentence.words.map((word, i) => (
              <ReadingWord
                key={i}
                word={word}
                lit={i === sentence.focus}
                size={READING.TURN_WORD_SIZE}
                lineHeight={READING.TURN_WORD_SIZE * READING.LINE_HEIGHT}
              />
            ))}
          </View>

          <SpeakButton text={focusWord} style={styles.speaker} />
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
  count: {
    marginTop: 10,
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 16,
    color: COLORS.warmText,
    textAlign: 'center',
  },
  instruction: {
    marginTop: 10,
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
    backgroundColor: BUTTON.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.nunitoBlack,
    fontSize: 20,
    color: BUTTON.text,
  },
});
