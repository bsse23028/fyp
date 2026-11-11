// STRUGGLE WORDS SCREEN (Parent Mode) - words a child found tricky while reading.
// Opened from  Parent Home -> Plan -> Struggle words.
//
// Where the list comes from:
//   - the words saved for this child ON THE SERVER (fetched when the screen opens and kept
//     in Redux: state.english.struggleWords), or
//   - while a child has none yet, SAMPLE words from data/sampleStruggleWords.json,
//     marked clearly as samples.
// While the first list loads a spinner shows; if the server cannot be reached, a message with Retry.
//
// LATER (automatic): when the speech check finds a word the child could not read, call
//   dispatch(reportStruggleWord(child.id, 'lightning', 'Weather'))   (see ../store/englishSlice.js)
// and the word appears here by itself. This screen does not need to change.
//
// Props: { navigation }

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Text from '../../../shared/components/AppText';
import Screen from '../../../shared/components/Screen';
import Button from '../../../shared/components/Button';
import Chip from '../../../shared/components/Chip';
import { fetchStruggleWords } from '../store/englishSlice';
import SpeakButton from '../../../shared/components/SpeakButton';
import { useChild } from '../../../app/store/useChild';
import { useLanguage } from '../../../app/context/LanguageContext';
import sampleWords from '../data/sampleStruggleWords.json';
import { COLORS, FONTS } from '../../../shared/theme/theme';

export default function StruggleWordsScreen() {
  const { childProfiles, activeChild } = useChild();
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { struggleWords, struggleStatus, struggleError } = useSelector((state) => state.english);

  // Which child's words are shown (starts with the active child).
  const [childId, setChildId] = useState(activeChild ? activeChild.id : null);
  const child = childProfiles.find((c) => c.id === childId) || activeChild;
  const shownId = child ? child.id : null;

  // Ask the server for this child's words when the screen opens and when another child is chosen.
  function loadWords() {
    if (shownId) dispatch(fetchStruggleWords(shownId));
  }
  useEffect(loadWords, [shownId]);

  const status = shownId ? struggleStatus[shownId] : 'ready';
  const hasWords = Boolean(shownId && struggleWords[shownId]);
  const loading = !hasWords && (status === 'loading' || status === undefined); // first load only
  const failed = !hasWords && status === 'failed';

  // This child's real words, most missed first. None yet? Show the samples.
  const realWords = hasWords ? struggleWords[shownId] : [];
  const isSample = !loading && !failed && realWords.length === 0;
  const words = loading || failed ? [] : isSample ? sampleWords : [...realWords].sort((a, b) => b.count - a.count);

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

        {loading && <ActivityIndicator color={COLORS.primary} style={styles.spinner} />}

        {/* the server could not be reached: say so, with Retry */}
        {failed && (
          <View style={styles.note}>
            <Text style={styles.noteTitle}>Could not connect</Text>
            <Text style={styles.noteCopy}>{struggleError[shownId]}</Text>
            <Button title="Retry" variant="secondary" onPress={loadWords} style={styles.retry} />
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
  spinner: {
    marginTop: 24,
  },
  retry: {
    marginTop: 12,
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
