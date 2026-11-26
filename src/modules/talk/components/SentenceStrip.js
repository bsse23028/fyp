// SENTENCE STRIP - the top of the AAC board: the words the child picked, in order (small picture + word),
// a big round Speak button, and two small buttons: delete the last word, clear all.
// Tapping the strip itself also speaks the whole sentence.
// Props: { words: [{ word, type }], onSpeak, onDeleteLast, onClear }

import React, { useEffect, useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../../shared/components/AppText';
import AppIcon from '../../../shared/components/AppIcon';
import AnimatedPressable from '../../../shared/components/AnimatedPressable';
import { WORD_TYPES, symbolFor } from '../data/aacWords';
import { AAC } from '../aacConfig';
import { CALM_SHADOW, FONTS, PALETTE } from '../../../shared/theme/theme';

export default function SentenceStrip({ words, onSpeak, onDeleteLast, onClear }) {
  const scroll = useRef(null);

  // always show the newest word
  useEffect(() => {
    if (scroll.current) scroll.current.scrollToEnd({ animated: true });
  }, [words.length]);

  const empty = words.length === 0;

  return (
    <View style={[styles.bar, CALM_SHADOW.soft]}>
      <Pressable onPress={onSpeak} accessibilityRole="button" accessibilityLabel="Say the sentence" style={styles.words}>
        {empty ? (
          <Text style={styles.hint} numberOfLines={2}>
            Tap pictures to make a sentence
          </Text>
        ) : (
          <ScrollView
            ref={scroll}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordRow}
          >
            {words.map((item, i) => {
              const type = WORD_TYPES[item.type] || WORD_TYPES.people;
              return (
                <View key={`${item.word}-${i}`} style={[styles.chip, { backgroundColor: type.fill, borderColor: type.edge }]}>
                  <Image source={symbolFor(item)} style={styles.chipSymbol} resizeMode="contain" />
                  <Text style={styles.chipLabel} numberOfLines={1}>
                    {item.word}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Pressable>

      {/* delete the last word / clear everything */}
      <View style={styles.small}>
        <AnimatedPressable onPress={onDeleteLast} disabled={empty} accessibilityLabel="Delete the last word" style={styles.smallButton}>
          <AppIcon name="backspace-outline" size={22} color={PALETTE.purple} />
        </AnimatedPressable>
        <AnimatedPressable onPress={onClear} disabled={empty} accessibilityLabel="Clear all words" style={styles.smallButton}>
          <AppIcon name="close" size={22} color={PALETTE.purple} />
        </AnimatedPressable>
      </View>

      {/* Speak */}
      <AnimatedPressable onPress={onSpeak} disabled={empty} accessibilityLabel="Speak" style={styles.speak}>
        <AppIcon name="volume-high" size={30} color={PALETTE.white} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: AAC.STRIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 8,
    paddingEnd: 8,
    borderRadius: 22,
    backgroundColor: PALETTE.cloudWhite,
  },
  words: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  hint: {
    paddingHorizontal: 6,
    fontFamily: FONTS.nunitoSemiBold,
    fontSize: 14,
    color: PALETTE.mutedPlum,
  },
  wordRow: {
    alignItems: 'center',
    gap: 6,
    paddingEnd: 6,
    direction: 'ltr',
  },
  chip: {
    minWidth: 52,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  chipSymbol: {
    width: AAC.STRIP_SYMBOL,
    height: AAC.STRIP_SYMBOL,
  },
  chipLabel: {
    fontFamily: FONTS.nunitoExtraBold,
    fontSize: 11,
    color: PALETTE.deepPlum,
  },
  small: {
    marginHorizontal: 6,
    gap: 6,
  },
  smallButton: {
    width: AAC.SMALL_BUTTON,
    height: AAC.SMALL_BUTTON,
    borderRadius: AAC.SMALL_BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.pastelLilac,
  },
  speak: {
    width: AAC.SPEAK_SIZE,
    height: AAC.SPEAK_SIZE,
    borderRadius: AAC.SPEAK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.deepPurple,
  },
});
