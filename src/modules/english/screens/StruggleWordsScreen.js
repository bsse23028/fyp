// STRUGGLE WORDS SCREEN (Parent Mode) - words a child found tricky while reading.
// Opened from  Parent Home -> Plan -> Struggle words.
//
// Where the list comes from:
//   - the words saved for this child in Redux (state.english.struggleWords), or
//   - while a child has none yet, SAMPLE words from data/sampleStruggleWords.json,
//     marked clearly as samples.
//
// LATER (automatic): when the speech check finds a word the child could not read, call
//   dispatch(reportStruggleWord(child.id, 'lightning', 'Weather'))   (see ../store/englishSlice.js)
// and the word appears here by itself. This screen does not need to change.
//
// Props: { navigation }

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import Chip from '../../../shared/components/Chip';
import SpeakButton from '../../../shared/components/SpeakButton';
import { useChild } from '../../../app/store/useChild';
import { useLanguage } from '../../../app/context/LanguageContext';
import sampleWords from '../data/sampleStruggleWords.json';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function StruggleWordsScreen() {
  const { childProfiles, activeChild } = useChild();
  const { t } = useLanguage();
  const struggleWords = useSelector((state) => state.english.struggleWords);

  // Which child's words are shown (starts with the active child).
  const [childId, setChildId] = useState(activeChild ? activeChild.id : null);
  const child = childProfiles.find((c) => c.id === childId) || activeChild;

  // This child's real words, most missed first. None yet? Show the samples.
  const realWords = child && struggleWords[child.id] ? struggleWords[child.id] : [];
  const isSample = realWords.length === 0;
  const words = isSample ? sampleWords : [...realWords].sort((a, b) => b.count - a.count);

  return (
    <Screen scroll mode="parent">
      <View style={styles.body}>
        <Text style={styles.heading}>Struggle words</Text>
        <Text style={styles.subheading}>Words that came up again while reading. Practise them gently at home.</Text>

        {/* more than one child: choose whose words to see */}
        {childProfiles.length > 1 && (
          <View style={styles.chips}>
            {childProfiles.map((c) => (
              <View key={c.id} style={styles.chipWrap}>
                <Chip label={c.name} selected={child && c.id === child.id} onPress={() => setChildId(c.id)} />
              </View>
            ))}
          </View>
        )}

        {isSample && (
          <View style={styles.note}>
            <Text style={styles.noteTitle}>Sample words</Text>
            <Text style={styles.noteCopy}>
              These are examples. Once your child reads, the words they find hard will appear here.
            </Text>
          </View>
        )}

        {words.map((item) => (
          <View key={item.word} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.meta}>
                {item.count === 1 ? 'Missed 1 time' : `Missed ${item.count} times`}
                {item.topic ? ` · ${t(item.topic)}` : ''}
              </Text>
            </View>
            <SpeakButton text={item.word} compact />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  heading: {
    fontFamily: FONTS.interBold,
    fontSize: 24,
    color: COLORS.text,
  },
  subheading: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chipWrap: {
    marginEnd: 8,
    marginBottom: 8,
  },
  note: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primaryPale,
  },
  noteTitle: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  noteCopy: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  rowText: {
    flex: 1,
  },
  word: {
    fontFamily: FONTS.interBold,
    fontSize: 20,
    color: COLORS.text,
  },
  meta: {
    marginTop: 3,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
